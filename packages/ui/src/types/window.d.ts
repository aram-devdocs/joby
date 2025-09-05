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
        getHost: () => Promise<string>;
        getModels: () => Promise<Array<{ name: string; modified_at: string }>>;
        testConnection: () => Promise<{
          connected: boolean;
          models?: Array<string | { name: string; [key: string]: unknown }>;
        }>;
        sendPrompt: (model: string, prompt: string) => Promise<string>;
        // Streaming methods
        streamPrompt: (request: {
          model: string;
          prompt: string;
          context: string;
          userPrompt?: string;
          contextData?: Record<string, unknown>;
        }) => Promise<string>;
        cancelStream: (streamId: string, reason?: string) => Promise<void>;
        getStreamInfo: (streamId: string) => Promise<unknown>;
        getActiveStreams: () => Promise<unknown[]>;
        onStreamEvent: (callback: (event: unknown) => void) => () => void;
      };
      llm: {
        getStatus: () => Promise<{
          status:
            | 'disconnected'
            | 'connecting'
            | 'connected'
            | 'processing'
            | 'error';
          message?: string;
        }>;
        getEnhancementDetails: (fieldId: string) => Promise<
          | {
              prompt?: string;
              response?: string;
              confidence?: number;
              fieldType?: string;
            }
          | undefined
        >;
        reconnect: () => Promise<boolean>;
      };
      browser: {
        getCurrentUrl: () => Promise<string | undefined>;
        getHistory: () => Promise<
          Array<{ url: string; title: string; timestamp: number }>
        >;
        detectJobSite: (url: string) => Promise<string | null>;
        analyzeHTML: (
          html: string,
          pageUrl?: string,
          pageTitle?: string,
        ) => Promise<{
          forms: Array<{
            fields: FormField[];
          }>;
          summary: string;
        }>;
        getEnhancementConfig: () => Promise<{
          enableCache: boolean;
          selectedModel?: string;
        }>;
        updateEnhancementConfig: (config: {
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
    };
  }
}

export {};
