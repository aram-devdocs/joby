import type { FormField, ValidationRule } from '../types/form';

/**
 * Validate a field value against its validation rules
 */
export function validateField(
  field: FormField,
  value: string,
): { isValid: boolean; error?: string } {
  // Check required
  if (field.required && !value.trim()) {
    return { isValid: false, error: 'This field is required' };
  }

  // Skip other validations if field is empty and not required
  if (!value && !field.required) {
    return { isValid: true };
  }

  // Email validation - strict RFC-compliant regex
  if (field.inputType === 'email') {
    // More strict email validation
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(value)) {
      return {
        isValid: false,
        error: 'Please enter a valid email address (e.g., user@example.com)',
      };
    }
  }

  // Phone validation - must be exactly 10 digits (US format)
  if (field.inputType === 'tel') {
    // Strip formatting and validate
    const phoneDigits = value.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return {
        isValid: false,
        error: 'Please enter a valid 10-digit phone number',
      };
    }
    // Check if it starts with a valid US area code (optional additional validation)
    if (phoneDigits[0] === '0' || phoneDigits[0] === '1') {
      return {
        isValid: false,
        error: 'Phone number must start with area code 2-9',
      };
    }
  }

  // URL validation
  if (field.inputType === 'url') {
    try {
      new URL(value);
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' };
    }
  }

  // Pattern validation
  if (field.pattern) {
    try {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        return {
          isValid: false,
          error: `Value must match pattern: ${field.pattern}`,
        };
      }
    } catch {
      // Invalid pattern, skip validation
    }
  }

  // Min/Max length validation
  if (field.minLength && value.length < field.minLength) {
    return {
      isValid: false,
      error: `Minimum length is ${field.minLength} characters`,
    };
  }

  if (field.maxLength && value.length > field.maxLength) {
    return {
      isValid: false,
      error: `Maximum length is ${field.maxLength} characters`,
    };
  }

  // Number validation
  if (field.inputType === 'number') {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return { isValid: false, error: 'Please enter a valid number' };
    }

    if (field.min !== undefined && numValue < Number(field.min)) {
      return { isValid: false, error: `Minimum value is ${field.min}` };
    }

    if (field.max !== undefined && numValue > Number(field.max)) {
      return { isValid: false, error: `Maximum value is ${field.max}` };
    }

    if (field.step !== undefined && field.step !== 'any') {
      const step = Number(field.step);
      const base = field.min ? Number(field.min) : 0;
      const diff = numValue - base;
      if (Math.abs(diff % step) > 0.000001) {
        return {
          isValid: false,
          error: `Value must be in increments of ${step}`,
        };
      }
    }
  }

  // Date validation
  if (field.inputType === 'date') {
    const dateValue = new Date(value);
    if (isNaN(dateValue.getTime())) {
      return { isValid: false, error: 'Please enter a valid date' };
    }

    if (field.min) {
      const minDate = new Date(field.min);
      if (dateValue < minDate) {
        return { isValid: false, error: `Date must be after ${field.min}` };
      }
    }

    if (field.max) {
      const maxDate = new Date(field.max);
      if (dateValue > maxDate) {
        return { isValid: false, error: `Date must be before ${field.max}` };
      }
    }
  }

  // Apply custom validation rules if present
  if (field.validationRules) {
    for (const rule of field.validationRules) {
      const result = applyValidationRule(rule, value);
      if (!result.isValid) {
        return result;
      }
    }
  }

  return { isValid: true };
}

/**
 * Apply a single validation rule
 */
function applyValidationRule(
  rule: ValidationRule,
  value: string,
): { isValid: boolean; error?: string } {
  switch (rule.type) {
    case 'required':
      if (!value.trim()) {
        return {
          isValid: false,
          error: rule.message || 'This field is required',
        };
      }
      break;

    case 'pattern':
      if (rule.value && typeof rule.value === 'string') {
        const regex = new RegExp(rule.value);
        if (!regex.test(value)) {
          return {
            isValid: false,
            error: rule.message || `Value must match pattern: ${rule.value}`,
          };
        }
      }
      break;

    case 'minLength':
      if (
        rule.value &&
        typeof rule.value === 'number' &&
        value.length < rule.value
      ) {
        return {
          isValid: false,
          error: rule.message || `Minimum length is ${rule.value}`,
        };
      }
      break;

    case 'maxLength':
      if (
        rule.value &&
        typeof rule.value === 'number' &&
        value.length > rule.value
      ) {
        return {
          isValid: false,
          error: rule.message || `Maximum length is ${rule.value}`,
        };
      }
      break;

    case 'min':
      if (rule.value !== undefined) {
        const numValue = parseFloat(value);
        const minValue = Number(rule.value);
        if (!isNaN(numValue) && numValue < minValue) {
          return {
            isValid: false,
            error: rule.message || `Minimum value is ${minValue}`,
          };
        }
      }
      break;

    case 'max':
      if (rule.value !== undefined) {
        const numValue = parseFloat(value);
        const maxValue = Number(rule.value);
        if (!isNaN(numValue) && numValue > maxValue) {
          return {
            isValid: false,
            error: rule.message || `Maximum value is ${maxValue}`,
          };
        }
      }
      break;

    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return {
          isValid: false,
          error: rule.message || 'Please enter a valid email address',
        };
      }
      break;
    }

    case 'tel': {
      const phoneDigits = value.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        return {
          isValid: false,
          error: rule.message || 'Please enter a valid phone number',
        };
      }
      break;
    }

    case 'url': {
      try {
        new URL(value);
      } catch {
        return {
          isValid: false,
          error: rule.message || 'Please enter a valid URL',
        };
      }
      break;
    }
  }

  return { isValid: true };
}

/**
 * Format phone number for display - only allows numeric input
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');

  // Limit to 10 digits for US phone numbers (can be extended for international)
  const limited = cleaned.slice(0, 10);

  if (limited.length <= 3) {
    return limited;
  }
  if (limited.length <= 6) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  }
  if (limited.length <= 10) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
  return limited; // Should not reach here with limit, but safe fallback
}

/**
 * Strip non-numeric characters from phone input
 */
export function stripNonNumeric(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Get appropriate input type for HTML input element
 */
export function getHTMLInputType(field: FormField): string {
  switch (field.inputType) {
    case 'email':
      return 'email';
    case 'tel':
      return 'tel';
    case 'url':
      return 'url';
    case 'number':
      return 'number';
    case 'date':
      // Check the original type attribute to determine exact date input type
      if (field.type === 'datetime-local') {
        return 'datetime-local';
      } else if (field.type === 'time') {
        return 'time';
      } else if (field.type === 'month') {
        return 'month';
      } else if (field.type === 'week') {
        return 'week';
      }
      return 'date'; // Default to date input
    case 'password':
      return 'password';
    case 'range':
      return 'range';
    case 'color':
      return 'color';
    case 'search':
      return 'search';
    default:
      return 'text';
  }
}

/**
 * Get input props for validation and proper HTML5 input behavior
 */
export function getValidationProps(
  field: FormField,
): Record<string, string | number | boolean> {
  const props: Record<string, string | number | boolean> = {};

  if (field.required) {
    props.required = true;
  }

  // Add input-specific attributes
  if (field.inputType === 'tel') {
    // For phone numbers: restrict to numeric input
    props.inputMode = 'numeric';
    props.pattern = '[0-9() -]*'; // Allow formatted phone numbers
    props.maxLength = 14; // (XXX) XXX-XXXX format
  } else if (field.inputType === 'email') {
    props.inputMode = 'email';
    props.autoComplete = field.autocomplete || 'email';
  } else if (field.inputType === 'number') {
    props.inputMode = 'numeric';
  } else if (field.pattern) {
    props.pattern = field.pattern;
  }

  if (field.minLength) {
    props.minLength = field.minLength;
  }

  if (field.maxLength && field.inputType !== 'tel') {
    // Don't override tel maxLength
    props.maxLength = field.maxLength;
  }

  if (field.min !== undefined) {
    props.min = field.min;
  }

  if (field.max !== undefined) {
    props.max = field.max;
  }

  if (field.step !== undefined) {
    props.step = field.step;
  }

  if (field.autocomplete && field.inputType !== 'email') {
    // Don't override email autocomplete
    props.autoComplete = field.autocomplete;
  }

  return props;
}
