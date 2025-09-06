/**
 * Form-related types and interfaces
 */

/**
 * Validation rule for form fields
 */
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

/**
 * Option for select/radio form fields
 */
export interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  selected?: boolean;
}

/**
 * Base form field interface
 */
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
    | 'search'
    | 'phone'
    | 'postal'
    | 'creditcard';
  label?: string;
  placeholder?: string;
  required: boolean;
  value?: string;
  options?: FormSelectOption[] | string[];
  selector?: string;
  xpath?: string;
  position?: { x: number; y: number; width: number; height: number };
  attributes?: Record<string, string>;
  section?: string;
  validationRules?: ValidationRule[];
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  multiple?: boolean;
  checked?: boolean;
  autocomplete?: string;
  enhancement?: {
    fieldType?: string;
    label?: string;
    validation?: {
      pattern?: string;
      minLength?: number;
      maxLength?: number;
      min?: string | number;
      max?: string | number;
      required?: boolean;
      message?: string;
    };
    confidence: number;
    source: 'static' | 'llm' | 'cache' | 'hybrid';
  };
}

/**
 * Interactive form field with editing state
 */
export interface InteractiveFormField extends FormField {
  isEditing: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  uiValue: string;
  browserValue: string;
  lastSyncTime?: number;
  validationError?: string;
  isValid?: boolean;
}

/**
 * Form information
 */
export interface FormInfo {
  id?: string;
  name?: string;
  action?: string;
  method?: string;
  fields: FormField[];
}

/**
 * Options for simulating typing
 */
export interface TypingOptions {
  minDelay?: number;
  maxDelay?: number;
  clearFirst?: boolean;
  simulateFocus?: boolean;
  simulateBlur?: boolean;
}
