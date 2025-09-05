import type { FormField, TypingOptions } from './form';

declare global {
  interface Window {
    electronAPI: {
      platform: string;
      versions: {
        node: string;
        chrome: string;
        electron: string;
      };
      ollama: {
        setHost: (host: string) => Promise<{ success: boolean }>;
        getModels: () => Promise<Array<{ name: string; modified_at: string }>>;
        sendPrompt: (model: string, prompt: string) => Promise<string>;
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
    };
  }
}

export {};
