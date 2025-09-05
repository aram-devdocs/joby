import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { FormInfo, FormField } from './BrowserService';

export class FormAnalyzer {
  analyzeHTML(html: string): FormInfo[] {
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

    const field: FormField = {
      id: $field.attr('id') ?? '',
      name: $field.attr('name') ?? '',
      type,
      placeholder: $field.attr('placeholder') ?? '',
      required:
        $field.attr('required') !== undefined ||
        $field.attr('aria-required') === 'true',
      value: $field.val() as string,
      selector: this.generateSelector($field, tagName),
      attributes: this.extractAttributes($field),
    };

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

    // For select fields, extract options
    if (tagName === 'select') {
      field.options = [];
      $field.find('option').each((_, optionEl) => {
        const $option = $(optionEl);
        const value = $option.val() as string;
        if (value) {
          field.options?.push(value);
        }
      });
    }

    return field;
  }

  private generateSelector(
    $field: cheerio.Cheerio<AnyNode>,
    tagName: string,
  ): string {
    // Priority 1: ID selector
    const id = $field.attr('id');
    if (id) {
      return `#${CSS.escape(id)}`;
    }

    // Priority 2: Name attribute selector
    const name = $field.attr('name');
    if (name) {
      return `${tagName}[name="${CSS.escape(name)}"]`;
    }

    // Priority 3: Unique attribute combination
    const type = $field.attr('type');
    const placeholder = $field.attr('placeholder');
    let selector = tagName;

    if (type) {
      selector += `[type="${CSS.escape(type)}"]`;
    }
    if (placeholder) {
      selector += `[placeholder="${CSS.escape(placeholder)}"]`;
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
