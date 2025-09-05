export interface FormField {
  id?: string;
  name?: string;
  type: string;
  label?: string;
  placeholder?: string;
  required: boolean;
  value?: string;
  options?: string[];
  selector?: string;
  xpath?: string;
  position?: { x: number; y: number; width: number; height: number };
  attributes?: Record<string, string>;
  section?: string; // Section/group this field belongs to
}

export interface InteractiveFormField extends FormField {
  isEditing: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  uiValue: string;
  browserValue: string;
  lastSyncTime?: number;
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
