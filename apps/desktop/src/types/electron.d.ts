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
}

export interface TypingOptions {
  minDelay?: number;
  maxDelay?: number;
  clearFirst?: boolean;
  simulateFocus?: boolean;
  simulateBlur?: boolean;
}

export interface ElectronAPI {
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  ollama: {
    setHost: (host: string) => Promise<{ success: boolean }>;
    getHost: () => Promise<string>;
    getModels: () => Promise<Array<{ name: string; modified_at: string }>>;
    sendPrompt: (model: string, prompt: string) => Promise<string>;
    testConnection: () => Promise<{
      connected: boolean;
      models?: Array<string | { name: string; [key: string]: unknown }>;
    }>;
  };
  browser: {
    getCurrentUrl: () => Promise<string | undefined>;
    getHistory: () => Promise<
      Array<{ url: string; title: string; timestamp: number }>
    >;
    detectJobSite: (url: string) => Promise<string | null>;
    analyzeHTML: (html: string) => Promise<{
      forms: Array<{
        fields: FormField[];
      }>;
      summary: string;
    }>;
    setLLMEnabled: (
      enabled: boolean,
    ) => Promise<{ success: boolean; llmEnabled: boolean }>;
    getEnhancementConfig: () => Promise<{
      enableLLM: boolean;
      enableCache: boolean;
      selectedModel?: string;
    }>;
    updateEnhancementConfig: (config: {
      enableLLM: boolean;
      enableCache: boolean;
      selectedModel?: string;
    }) => Promise<{ success: boolean; config: unknown }>;
    onNavigationStart: (url: string) => void;
    onNavigationComplete: (url: string, title?: string) => void;
  };
  form: {
    updateField: (
      field: FormField,
      value: string,
      options?: TypingOptions,
    ) => Promise<{ script: string }>;
    focusField: (field: FormField) => Promise<{ script: string }>;
    getFieldValue: (field: FormField) => Promise<{ script: string }>;
    monitorFields: (fields: FormField[]) => Promise<{ script: string }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
