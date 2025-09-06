/**
 * Electron API types and interfaces
 */

import type { FormField, TypingOptions } from './form';
import type { StreamRequest } from './stream';

/**
 * LLM status information
 */
export interface LLMStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'processing' | 'error';
  message?: string;
}

/**
 * Enhancement details for a form field
 */
export interface EnhancementDetails {
  prompt?: string;
  response?: string;
  confidence?: number;
  fieldType?: string;
}

/**
 * Browser history entry
 */
export interface BrowserHistoryEntry {
  url: string;
  title: string;
  timestamp: number;
}

/**
 * Enhancement configuration
 */
export interface EnhancementConfig {
  enableCache: boolean;
  selectedModel?: string;
}

/**
 * Ollama model information
 */
export interface OllamaModel {
  name: string;
  modified_at: string;
  [key: string]: unknown;
}

/**
 * Ollama connection test result
 */
export interface OllamaConnectionResult {
  connected: boolean;
  models?: Array<string | OllamaModel>;
}

/**
 * Complete Electron API interface
 */
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
    getModels: () => Promise<OllamaModel[]>;
    testConnection: () => Promise<OllamaConnectionResult>;
    sendPrompt: (model: string, prompt: string) => Promise<string>;
    // Streaming methods
    streamPrompt: (request: StreamRequest) => Promise<string>;
    cancelStream: (streamId: string, reason?: string) => Promise<void>;
    getStreamInfo: (streamId: string) => Promise<unknown>;
    getActiveStreams: () => Promise<unknown[]>;
    onStreamEvent: (callback: (event: unknown) => void) => () => void;
  };
  llm: {
    getStatus: () => Promise<LLMStatus>;
    getEnhancementDetails: (
      fieldId: string,
    ) => Promise<EnhancementDetails | undefined>;
    reconnect: () => Promise<boolean>;
  };
  browser: {
    getCurrentUrl: () => Promise<string | undefined>;
    getHistory: () => Promise<BrowserHistoryEntry[]>;
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
    getEnhancementConfig: () => Promise<EnhancementConfig>;
    updateEnhancementConfig: (config: EnhancementConfig) => Promise<{
      success: boolean;
      config: unknown;
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
}

/**
 * Global window augmentation for Electron
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
