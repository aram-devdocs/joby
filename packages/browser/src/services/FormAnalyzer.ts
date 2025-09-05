import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { FormInfo, FormField, FormSelectOption } from './BrowserService';
import { FieldEnhancementService } from './field-enhancement';
import type { FieldContext } from './field-enhancement';

// CSS.escape polyfill for Node.js environment
function cssEscape(value: string): string {
  if (typeof value !== 'string') {
    throw new TypeError('CSS.escape requires a string argument');
  }

  const string = value;
  const length = string.length;
  let index = -1;
  let codeUnit: number;
  let result = '';

  const firstCodeUnit = string.charCodeAt(0);

  while (++index < length) {
    codeUnit = string.charCodeAt(index);

    // Note: there's no need to special-case astral symbols, surrogate
    // pairs, or lone surrogates.

    // If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
    // (U+FFFD).
    if (codeUnit === 0x0000) {
      result += '\uFFFD';
      continue;
    }

    if (
      // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
      // U+007F, […]
      (codeUnit >= 0x0001 && codeUnit <= 0x001f) ||
      codeUnit === 0x007f ||
      // If the character is the first character and is in the range [0-9]
      // (U+0030 to U+0039), […]
      (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      // If the character is the second character and is in the range [0-9]
      // (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
      (index === 1 &&
        codeUnit >= 0x0030 &&
        codeUnit <= 0x0039 &&
        firstCodeUnit === 0x002d)
    ) {
      // https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
      result += '\\' + codeUnit.toString(16) + ' ';
      continue;
    }

    if (
      // If the character is the first character and is a `-` (U+002D), and
      // there is no second character, […]
      index === 0 &&
      length === 1 &&
      codeUnit === 0x002d
    ) {
      result += '\\' + string.charAt(index);
      continue;
    }

    // If the character is not handled by one of the above rules and is one
    // of the following characters: [`!`, `"`, `#`, `$`, `%`, `&`, `'`, `(`,
    // `)`, `*`, `+`, `,`, `-`, `.`, `/`, `:`, `;`, `<`, `=`, `>`, `?`, `@`,
    // `[`, `\`, `]`, `^`, `` ` ``, `{`, `|`, `}`, `~`], […]
    if (
      codeUnit >= 0x0080 ||
      codeUnit === 0x002d ||
      codeUnit === 0x005f ||
      (codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      (codeUnit >= 0x0041 && codeUnit <= 0x005a) ||
      (codeUnit >= 0x0061 && codeUnit <= 0x007a)
    ) {
      // the character itself
      result += string.charAt(index);
      continue;
    }

    // Otherwise, the escaped character.
    // https://drafts.csswg.org/cssom/#escape-a-character
    result += '\\' + string.charAt(index);
  }

  return result;
}

export class FormAnalyzer {
  private enhancementService: FieldEnhancementService;

  constructor() {
    // Initialize with static enhancement only (LLM disabled by default)
    this.enhancementService = FieldEnhancementService.getInstance({
      enableStatic: true,
      enableLLM: false,
      enableCache: true,
    });
  }
  async analyzeHTML(
    html: string,
    pageTitle?: string,
    pageUrl?: string,
  ): Promise<FormInfo[]> {
    const $ = cheerio.load(html);
    const forms: FormInfo[] = [];

    $('form').each((_, formEl) => {
      const $form = $(formEl);
      const formInfo: FormInfo = {
        id: $form.attr('id') ?? '',
        name: $form.attr('name') ?? '',
        action: $form.attr('action') ?? '',
        method: $form.attr('method') || 'GET',
        fields: [],
      };

      // Find all input fields
      $form.find('input, select, textarea').each((_, fieldEl) => {
        const $field = $(fieldEl);
        const field = this.extractFieldInfo(
          $,
          $field,
          fieldEl.tagName.toLowerCase(),
        );
        if (field) {
          formInfo.fields.push(field);
        }
      });

      if (formInfo.fields.length > 0) {
        forms.push(formInfo);
      }
    });

    // Also look for inputs not in forms (common in SPAs)
    const orphanFields: FormField[] = [];
    $('input, select, textarea').each((_, fieldEl) => {
      const $field = $(fieldEl);
      if ($field.closest('form').length === 0) {
        const field = this.extractFieldInfo(
          $,
          $field,
          fieldEl.tagName.toLowerCase(),
        );
        if (field) {
          orphanFields.push(field);
        }
      }
    });

    if (orphanFields.length > 0) {
      forms.push({
        fields: orphanFields,
      });
    }

    // Apply enhancements to all fields
    for (const form of forms) {
      form.fields = await this.enhanceFields(
        form.fields,
        $,
        pageTitle,
        pageUrl,
      );
    }

    return forms;
  }

  private extractFieldInfo(
    $: cheerio.CheerioAPI,
    $field: cheerio.Cheerio<AnyNode>,
    tagName: string,
  ): FormField | null {
    const type = $field.attr('type') || tagName;

    // Skip hidden and submit fields
    if (type === 'hidden' || type === 'submit' || type === 'button') {
      return null;
    }

    // Detect section from HTML structure
    const section = this.detectFieldSection($, $field);

    // Determine the proper input type
    let inputType: FormField['inputType'] = 'text';
    if (tagName === 'select') {
      inputType = 'select';
    } else if (tagName === 'textarea') {
      inputType = 'textarea';
    } else if (type === 'radio') {
      inputType = 'radio';
    } else if (type === 'checkbox') {
      inputType = 'checkbox';
    } else if (type === 'email') {
      inputType = 'email';
    } else if (type === 'tel') {
      inputType = 'tel';
    } else if (type === 'url') {
      inputType = 'url';
    } else if (type === 'number') {
      inputType = 'number';
    } else if (
      type === 'date' ||
      type === 'datetime-local' ||
      type === 'time' ||
      type === 'month' ||
      type === 'week'
    ) {
      inputType = 'date';
    } else if (type === 'password') {
      inputType = 'password';
    } else if (type === 'range') {
      inputType = 'range';
    } else if (type === 'color') {
      inputType = 'color';
    } else if (type === 'search') {
      inputType = 'search';
    }

    // Ensure inputType is always set (fallback to 'text' for any unknown types)
    if (!inputType) {
      inputType = 'text';
    }

    const field: FormField = {
      id: $field.attr('id') ?? '',
      name: $field.attr('name') ?? '',
      type,
      inputType,
      placeholder: $field.attr('placeholder') ?? '',
      required:
        $field.attr('required') !== undefined ||
        $field.attr('aria-required') === 'true',
      value: $field.val() as string,
      selector: this.generateSelector($field, tagName),
      attributes: this.extractAttributes($field),
    };

    // Add section if present
    if (section) {
      field.section = section;
    }

    // Add HTML5 validation attributes if present
    const pattern = $field.attr('pattern');
    if (pattern) {
      field.pattern = pattern;
    }

    const minLength = parseInt($field.attr('minlength') || '0');
    if (minLength > 0) {
      field.minLength = minLength;
    }

    const maxLength = parseInt($field.attr('maxlength') || '0');
    if (maxLength > 0) {
      field.maxLength = maxLength;
    }

    const min = $field.attr('min');
    if (min) {
      field.min = min;
    }

    const max = $field.attr('max');
    if (max) {
      field.max = max;
    }

    const step = $field.attr('step');
    if (step) {
      field.step = step;
    }

    if ($field.attr('multiple') !== undefined) {
      field.multiple = true;
    }

    if ($field.attr('checked') !== undefined) {
      field.checked = true;
    }

    const autocomplete = $field.attr('autocomplete');
    if (autocomplete) {
      field.autocomplete = autocomplete;
    }

    // Try to find associated label
    const id = field.id;
    if (id) {
      const $label = $(`label[for="${id}"]`);
      if ($label.length > 0) {
        field.label = $label.text().trim();
      }
    }

    // If no label found, check for parent label
    if (!field.label) {
      const $parentLabel = $field.closest('label');
      if ($parentLabel.length > 0) {
        field.label = $parentLabel.text().trim();
      }
    }

    // For select fields, extract options with labels
    if (tagName === 'select') {
      const selectOptions: FormSelectOption[] = [];
      $field.find('option').each((_, optionEl) => {
        const $option = $(optionEl);
        const value = $option.val() as string;
        const label = $option.text().trim();
        const selected = $option.attr('selected') !== undefined;
        if (value || label) {
          selectOptions.push({
            value: value || label,
            label: label || value,
            selected,
          });
        }
      });
      if (selectOptions.length > 0) {
        field.options = selectOptions;
      }
    }

    // For radio buttons and checkboxes that share the same name, group them
    if (type === 'radio' || type === 'checkbox') {
      // Get all inputs with the same name
      const sameName = $(`input[name="${field.name}"]`);
      if (sameName.length > 1) {
        const radioOptions: FormSelectOption[] = [];
        sameName.each((_, el) => {
          const $el = $(el);
          const val = $el.val() as string;
          const labelFor = $el.attr('id')
            ? $(`label[for="${$el.attr('id')}"]`)
                .text()
                .trim()
            : '';
          const parentLabel = !labelFor
            ? $el.closest('label').text().trim()
            : '';
          const label = labelFor || parentLabel || val;

          radioOptions.push({
            value: val,
            label,
            selected: $el.attr('checked') !== undefined,
          });
        });
        if (radioOptions.length > 0) {
          field.options = radioOptions;
        }
      }
    }

    return field;
  }

  /**
   * Convert FormField to FieldContext for enhancement
   */
  private convertToFieldContext(
    field: FormField,
    _$?: cheerio.CheerioAPI,
    pageTitle?: string,
    pageUrl?: string,
  ): FieldContext {
    const context: FieldContext = {
      element: {
        ...(field.type && { type: field.type }),
        ...(field.name && { name: field.name }),
        ...(field.id && { id: field.id }),
        ...(field.placeholder && { placeholder: field.placeholder }),
        ...(field.value && { value: field.value }),
        ...(field.label && { label: field.label }),
        ...(field.autocomplete && { autocomplete: field.autocomplete }),
        ...(field.pattern && { pattern: field.pattern }),
        ...(field.required && { required: field.required }),
        ...(field.minLength && { minLength: field.minLength }),
        ...(field.maxLength && { maxLength: field.maxLength }),
        ...(field.min && { min: field.min.toString() }),
        ...(field.max && { max: field.max.toString() }),
      },
      ...(field.section && {
        formContext: {
          sectionName: field.section,
        },
      }),
      ...(pageTitle || pageUrl
        ? {
            pageContext: {
              ...(pageTitle && { pageTitle }),
              ...(pageUrl && { pageUrl }),
            },
          }
        : {}),
    };

    // Add aria labels from attributes if available
    if (field.attributes?.['aria-label']) {
      context.element.ariaLabel = field.attributes['aria-label'];
    }
    if (field.attributes?.['aria-labelledby']) {
      context.element.ariaLabelledBy = field.attributes['aria-labelledby'];
    }

    return context;
  }

  /**
   * Enhance a single field with intelligent detection
   */
  async enhanceField(
    field: FormField,
    $?: cheerio.CheerioAPI,
    pageTitle?: string,
    pageUrl?: string,
  ): Promise<FormField> {
    const context = this.convertToFieldContext(field, $, pageTitle, pageUrl);
    const enhancement = await this.enhancementService.enhanceField(context);

    // Merge enhancement data into field
    if (enhancement.confidence > 0) {
      field.enhancement = {
        ...(enhancement.fieldType !== undefined && {
          fieldType: enhancement.fieldType,
        }),
        ...(enhancement.label !== undefined && { label: enhancement.label }),
        ...(enhancement.validation !== undefined && {
          validation: enhancement.validation,
        }),
        confidence: enhancement.confidence,
        source: enhancement.source,
      };

      // Apply enhanced data with priority
      if (enhancement.label && !field.label) {
        field.label = enhancement.label;
      }

      if (enhancement.fieldType) {
        // Map enhanced field type to inputType if applicable
        const enhancedType = enhancement.fieldType.toLowerCase();
        const validInputTypes = [
          'text',
          'email',
          'tel',
          'url',
          'number',
          'date',
          'password',
          'select',
          'radio',
          'checkbox',
          'textarea',
          'range',
          'color',
          'search',
        ] as const;
        type ValidInputType = (typeof validInputTypes)[number];

        if (validInputTypes.includes(enhancedType as ValidInputType)) {
          field.inputType = enhancedType as ValidInputType;
        } else if (enhancedType === 'phone') {
          field.inputType = 'tel';
        } else if (enhancedType === 'postal' || enhancedType === 'creditcard') {
          field.inputType = 'text';
        }
      }

      // Apply enhanced validation rules
      if (enhancement.validation) {
        if (!field.validationRules) {
          field.validationRules = [];
        }

        if (enhancement.validation.required && !field.required) {
          field.required = true;
        }

        if (enhancement.validation.pattern && !field.pattern) {
          field.pattern = enhancement.validation.pattern;
        }

        if (enhancement.validation.minLength && !field.minLength) {
          field.minLength = enhancement.validation.minLength;
        }

        if (enhancement.validation.maxLength && !field.maxLength) {
          field.maxLength = enhancement.validation.maxLength;
        }

        if (enhancement.validation.min && !field.min) {
          field.min = enhancement.validation.min;
        }

        if (enhancement.validation.max && !field.max) {
          field.max = enhancement.validation.max;
        }
      }
    }

    return field;
  }

  /**
   * Enhance multiple fields in batch
   */
  async enhanceFields(
    fields: FormField[],
    $?: cheerio.CheerioAPI,
    pageTitle?: string,
    pageUrl?: string,
  ): Promise<FormField[]> {
    const contexts = fields.map((field) =>
      this.convertToFieldContext(field, $, pageTitle, pageUrl),
    );

    const enhancements = await this.enhancementService.enhanceFields(contexts);

    return fields.map((field, index) => {
      const enhancement = enhancements[index];
      if (enhancement && enhancement.confidence > 0) {
        field.enhancement = {
          ...(enhancement.fieldType !== undefined && {
            fieldType: enhancement.fieldType,
          }),
          ...(enhancement.label !== undefined && { label: enhancement.label }),
          ...(enhancement.validation !== undefined && {
            validation: enhancement.validation,
          }),
          confidence: enhancement.confidence,
          source: enhancement.source,
        };

        // Apply enhanced data as described above
        if (enhancement.label && !field.label) {
          field.label = enhancement.label;
        }

        if (enhancement.fieldType) {
          const enhancedType = enhancement.fieldType.toLowerCase();
          const validInputTypes = [
            'text',
            'email',
            'tel',
            'url',
            'number',
            'date',
            'password',
            'select',
            'radio',
            'checkbox',
            'textarea',
            'range',
            'color',
            'search',
          ] as const;
          type ValidInputType = (typeof validInputTypes)[number];

          if (validInputTypes.includes(enhancedType as ValidInputType)) {
            field.inputType = enhancedType as ValidInputType;
          } else if (enhancedType === 'phone') {
            field.inputType = 'tel';
          } else if (
            enhancedType === 'postal' ||
            enhancedType === 'creditcard'
          ) {
            field.inputType = 'text';
          }
        }

        if (enhancement.validation) {
          if (enhancement.validation.required && !field.required) {
            field.required = true;
          }
          if (enhancement.validation.pattern && !field.pattern) {
            field.pattern = enhancement.validation.pattern;
          }
          if (enhancement.validation.minLength && !field.minLength) {
            field.minLength = enhancement.validation.minLength;
          }
          if (enhancement.validation.maxLength && !field.maxLength) {
            field.maxLength = enhancement.validation.maxLength;
          }
        }
      }
      return field;
    });
  }

  /**
   * Enable or disable LLM enhancement
   */
  setLLMEnabled(enabled: boolean): void {
    this.enhancementService.enableLLM(enabled);
  }

  /**
   * Get current enhancement configuration
   */
  getEnhancementConfig() {
    return this.enhancementService.getConfig();
  }

  private generateSelector(
    $field: cheerio.Cheerio<AnyNode>,
    tagName: string,
  ): string {
    // Priority 1: ID selector
    const id = $field.attr('id');
    if (id) {
      return `#${cssEscape(id)}`;
    }

    // Priority 2: Name attribute selector
    const name = $field.attr('name');
    if (name) {
      return `${tagName}[name="${cssEscape(name)}"]`;
    }

    // Priority 3: Unique attribute combination
    const type = $field.attr('type');
    const placeholder = $field.attr('placeholder');
    let selector = tagName;

    if (type) {
      selector += `[type="${cssEscape(type)}"]`;
    }
    if (placeholder) {
      selector += `[placeholder="${cssEscape(placeholder)}"]`;
    }

    // Priority 4: Position-based selector
    const parent = $field.parent();
    const index = parent.children(tagName).index($field[0]);
    if (index >= 0) {
      selector += `:nth-of-type(${index + 1})`;
    }

    return selector;
  }

  private extractAttributes(
    $field: cheerio.Cheerio<AnyNode>,
  ): Record<string, string> {
    const attributes: Record<string, string> = {};
    const element = $field[0];

    if (element && 'attribs' in element) {
      const attribs = element.attribs as Record<string, string>;
      // Extract relevant attributes for field identification
      const relevantAttrs = [
        'class',
        'data-testid',
        'data-qa',
        'data-test',
        'aria-label',
        'aria-describedby',
        'autocomplete',
        'maxlength',
        'pattern',
        'step',
        'min',
        'max',
      ];

      for (const attr of relevantAttrs) {
        if (attribs[attr]) {
          attributes[attr] = attribs[attr];
        }
      }
    }

    return attributes;
  }

  detectJobApplicationFields(fields: FormField[]): Record<string, FormField[]> {
    const categories: Record<string, FormField[]> = {
      personal: [],
      contact: [],
      experience: [],
      education: [],
      documents: [],
      other: [],
    };

    const patterns = {
      personal: /name|first|last|middle|surname|given/i,
      contact: /email|phone|address|city|state|zip|postal|country/i,
      experience:
        /experience|work|job|company|employer|position|title|role|years/i,
      education: /education|school|university|degree|major|graduation|gpa/i,
      documents: /resume|cv|cover|letter|portfolio|file|upload|attach/i,
    };

    for (const field of fields) {
      let categorized = false;
      const searchText = `${field.name || ''} ${field.label || ''} ${field.placeholder || ''}`;

      for (const [category, pattern] of Object.entries(patterns)) {
        if (pattern.test(searchText)) {
          const categoryFields = categories[category];
          if (categoryFields) {
            categoryFields.push(field);
            categorized = true;
            break;
          }
        }
      }

      if (!categorized) {
        const otherFields = categories.other;
        if (otherFields) {
          otherFields.push(field);
        }
      }
    }

    return categories;
  }

  private detectFieldSection(
    _$: cheerio.CheerioAPI,
    $field: cheerio.Cheerio<AnyNode>,
  ): string | undefined {
    // Strategy 1: Look for fieldset with legend
    const $fieldset = $field.closest('fieldset');
    if ($fieldset.length > 0) {
      const legend = $fieldset.find('legend').first().text().trim();
      if (legend) return legend;
    }

    // Strategy 2: Look for section headings by traversing up the DOM
    let $current = $field;
    let maxLevels = 10;

    while ($current.length > 0 && maxLevels > 0) {
      // Look for any preceding heading at the same level
      const $prevHeading = $current.prevAll('h1, h2, h3, h4, h5, h6').first();
      if ($prevHeading.length > 0) {
        const heading = $prevHeading.text().trim();
        if (heading && heading.length < 50) {
          // Reasonable heading length
          return heading;
        }
      }

      // Check parent's previous siblings for headings
      const $parent = $current.parent();
      if ($parent.length > 0) {
        const $parentPrevHeading = $parent
          .prevAll('h1, h2, h3, h4, h5, h6')
          .first();
        if ($parentPrevHeading.length > 0) {
          const heading = $parentPrevHeading.text().trim();
          if (heading && heading.length < 50) {
            return heading;
          }
        }

        // Check if parent has a heading as first child (common pattern)
        const $firstChild = $parent.children().first();
        if ($firstChild.is('h1, h2, h3, h4, h5, h6')) {
          const heading = $firstChild.text().trim();
          if (heading && heading.length < 50) {
            return heading;
          }
        }
      }

      $current = $parent;
      maxLevels--;
    }

    return undefined;
  }

  generateFormSummary(forms: FormInfo[]): string {
    if (forms.length === 0) {
      return 'No forms detected on this page.';
    }

    let summary = `Found ${forms.length} form(s) on this page:\n\n`;

    forms.forEach((form, index) => {
      summary += `Form ${index + 1}:\n`;
      if (form.id || form.name) {
        summary += `  ID/Name: ${form.id || form.name}\n`;
      }
      if (form.action) {
        summary += `  Action: ${form.action}\n`;
      }
      summary += `  Fields: ${form.fields.length}\n`;

      const categories = this.detectJobApplicationFields(form.fields);
      for (const [category, fields] of Object.entries(categories)) {
        if (fields.length > 0) {
          summary += `    - ${category}: ${fields.length} field(s)\n`;
        }
      }
      summary += '\n';
    });

    return summary;
  }
}
