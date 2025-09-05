import type { FieldEnhancer, FieldContext, FieldEnhancement } from '../types';

export class StaticEnhancer implements FieldEnhancer {
  name = 'StaticEnhancer';
  priority = 1;
  isEnabled = true;

  private fieldTypePatterns = new Map<string, RegExp[]>([
    [
      'email',
      [/email/i, /e-mail/i, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/],
    ],
    ['phone', [/phone/i, /mobile/i, /cell/i, /tel/i, /^\+?[\d\s\-().]+$/]],
    ['date', [/date/i, /birth/i, /dob/i, /^\d{4}-\d{2}-\d{2}$/]],
    ['password', [/password/i, /passwd/i, /pwd/i]],
    ['url', [/url/i, /website/i, /link/i, /^https?:\/\//]],
    [
      'number',
      [/amount/i, /quantity/i, /price/i, /salary/i, /age/i, /year/i, /^\d+$/],
    ],
    ['postal', [/zip/i, /postal/i, /postcode/i, /^\d{5}(-\d{4})?$/]],
    [
      'creditcard',
      [
        /card/i,
        /credit/i,
        /payment/i,
        /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
      ],
    ],
  ]);

  private validationPatterns = new Map<
    string,
    { pattern: string; message: string }
  >([
    [
      'email',
      {
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        message: 'Please enter a valid email address',
      },
    ],
    [
      'phone',
      {
        pattern: '^\\+?[1-9]\\d{1,14}$',
        message: 'Please enter a valid phone number',
      },
    ],
    [
      'url',
      {
        pattern: '^https?:\\/\\/.+',
        message: 'Please enter a valid URL starting with http:// or https://',
      },
    ],
    [
      'postal',
      {
        pattern: '^\\d{5}(-\\d{4})?$',
        message: 'Please enter a valid ZIP code',
      },
    ],
    [
      'creditcard',
      {
        pattern: '^\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$',
        message: 'Please enter a valid credit card number',
      },
    ],
  ]);

  canEnhance(_context: FieldContext): boolean {
    return true;
  }

  async enhance(context: FieldContext): Promise<FieldEnhancement | null> {
    const enhancement: FieldEnhancement = {
      confidence: 0,
      source: 'static',
    };

    const detectedType = this.detectFieldType(context);
    if (detectedType) {
      enhancement.fieldType = detectedType;
      enhancement.confidence = Math.max(enhancement.confidence, 0.8);
    }

    const extractedLabel = this.extractLabel(context);
    if (extractedLabel) {
      enhancement.label = extractedLabel;
      enhancement.confidence = Math.max(enhancement.confidence, 0.9);
    }

    const validation = this.inferValidation(context, detectedType);
    if (validation) {
      enhancement.validation = validation;
      enhancement.confidence = Math.max(enhancement.confidence, 0.7);
    }

    if (enhancement.confidence === 0) {
      return null;
    }

    return enhancement;
  }

  private detectFieldType(context: FieldContext): string | null {
    if (context.element.type && context.element.type !== 'text') {
      return context.element.type;
    }

    const searchText = [
      context.element.name,
      context.element.id,
      context.element.label,
      context.element.placeholder,
      context.element.ariaLabel,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    for (const [fieldType, patterns] of this.fieldTypePatterns) {
      for (const pattern of patterns) {
        if (pattern.test(searchText)) {
          return fieldType;
        }
      }
    }

    if (context.element.autocomplete) {
      const autocompleteMap: Record<string, string> = {
        email: 'email',
        tel: 'phone',
        url: 'url',
        'current-password': 'password',
        'new-password': 'password',
        'cc-number': 'creditcard',
        'postal-code': 'postal',
        bday: 'date',
      };

      const mappedType = autocompleteMap[context.element.autocomplete];
      if (mappedType) {
        return mappedType;
      }
    }

    if (context.element.pattern) {
      for (const [fieldType, patterns] of this.fieldTypePatterns) {
        for (const pattern of patterns) {
          if (pattern.source.includes(context.element.pattern)) {
            return fieldType;
          }
        }
      }
    }

    return null;
  }

  private extractLabel(context: FieldContext): string | null {
    if (
      context.element.label &&
      !context.element.label.toLowerCase().includes('field')
    ) {
      return context.element.label;
    }

    if (context.element.ariaLabel) {
      return context.element.ariaLabel;
    }

    if (context.surroundingText && context.surroundingText.length > 0) {
      const labelText = context.surroundingText.find(
        (text) =>
          text && text.length > 2 && text.length < 50 && !text.includes('*'),
      );
      if (labelText) {
        return labelText.trim();
      }
    }

    if (context.element.placeholder && context.element.placeholder.length > 2) {
      return context.element.placeholder;
    }

    if (context.element.name) {
      return context.element.name
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    return null;
  }

  private inferValidation(
    context: FieldContext,
    detectedType: string | null,
  ): FieldEnhancement['validation'] {
    const validation: FieldEnhancement['validation'] = {};

    if (context.element.required) {
      validation.required = true;
    }

    if (context.element.pattern) {
      validation.pattern = context.element.pattern;
    } else if (detectedType && this.validationPatterns.has(detectedType)) {
      const pattern = this.validationPatterns.get(detectedType);
      if (pattern) {
        validation.pattern = pattern.pattern;
        validation.message = pattern.message;
      }
    }

    if (context.element.minLength) {
      validation.minLength = context.element.minLength;
    }
    if (context.element.maxLength) {
      validation.maxLength = context.element.maxLength;
    }
    if (context.element.min) {
      validation.min = context.element.min;
    }
    if (context.element.max) {
      validation.max = context.element.max;
    }

    if (detectedType === 'email' && !validation.pattern) {
      validation.pattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
      validation.message = 'Please enter a valid email address';
    }

    if (detectedType === 'phone' && !validation.pattern) {
      validation.pattern = '^\\+?[1-9]\\d{1,14}$';
      validation.message = 'Please enter a valid phone number';
    }

    return Object.keys(validation).length > 0 ? validation : undefined;
  }
}
