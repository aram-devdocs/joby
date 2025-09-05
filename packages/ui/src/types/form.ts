import type { SelectOption as BaseSelectOption } from '../atoms/select';

export interface ValidationRule {
  type:
    | 'pattern'
    | 'minLength'
    | 'maxLength'
    | 'min'
    | 'max'
    | 'required'
    | 'email'
    | 'tel'
    | 'url';
  value?: string | number | boolean;
  message?: string;
}

export interface FormSelectOption extends BaseSelectOption {
  selected?: boolean;
}

export interface FormField {
  id?: string;
  name?: string;
  type: string;
  inputType?:
    | 'text'
    | 'email'
    | 'tel'
    | 'url'
    | 'number'
    | 'date'
    | 'password'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'textarea'
    | 'range'
    | 'color'
    | 'search';
  label?: string;
  placeholder?: string;
  required: boolean;
  value?: string;
  options?: FormSelectOption[] | string[]; // Enhanced for select/radio options
  selector?: string;
  xpath?: string;
  position?: { x: number; y: number; width: number; height: number };
  attributes?: Record<string, string>;
  section?: string; // Section/group this field belongs to
  validationRules?: ValidationRule[]; // Validation rules extracted from HTML
  pattern?: string; // HTML5 pattern attribute
  minLength?: number; // HTML5 minlength attribute
  maxLength?: number; // HTML5 maxlength attribute
  min?: string | number; // HTML5 min attribute (for number/date inputs)
  max?: string | number; // HTML5 max attribute (for number/date inputs)
  step?: string | number; // HTML5 step attribute (for number inputs)
  multiple?: boolean; // For select elements with multiple attribute
  checked?: boolean; // For checkboxes and radio buttons
  autocomplete?: string; // HTML5 autocomplete attribute
}

export interface InteractiveFormField extends FormField {
  isEditing: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  uiValue: string;
  browserValue: string;
  lastSyncTime?: number;
  validationError?: string; // Validation error message if field is invalid
  isValid?: boolean; // Whether the field passes validation
}

export interface FormInfo {
  id?: string;
  name?: string;
  action?: string;
  method?: string;
  fields: FormField[];
}

export interface TypingOptions {
  minDelay?: number;
  maxDelay?: number;
  clearFirst?: boolean;
  simulateFocus?: boolean;
  simulateBlur?: boolean;
}
