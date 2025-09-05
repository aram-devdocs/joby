import { contextBridge, ipcRenderer } from 'electron';
import type { FormField, TypingOptions } from './types/form';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  ollama: {
    setHost: (host: string) => ipcRenderer.invoke('ollama:setHost', host),
    getHost: () => ipcRenderer.invoke('ollama:getHost'),
    getModels: () => ipcRenderer.invoke('ollama:getModels'),
    sendPrompt: (model: string, prompt: string) =>
      ipcRenderer.invoke('ollama:sendPrompt', model, prompt),
    testConnection: () => ipcRenderer.invoke('ollama:testConnection'),
    // Streaming methods
    streamPrompt: (request: {
      model: string;
      prompt: string;
      context: string;
      userPrompt?: string;
      contextData?: Record<string, unknown>;
    }) => ipcRenderer.invoke('ollama:streamPrompt', request),
    cancelStream: (streamId: string, reason?: string) =>
      ipcRenderer.invoke('ollama:cancelStream', streamId, reason),
    getStreamInfo: (streamId: string) =>
      ipcRenderer.invoke('ollama:getStreamInfo', streamId),
    getActiveStreams: () => ipcRenderer.invoke('ollama:getActiveStreams'),
    // Event listeners
    onStreamEvent: (callback: (event: unknown) => void) => {
      ipcRenderer.on('ollama:streamEvent', (_event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('ollama:streamEvent');
    },
  },
  llm: {
    getStatus: () => ipcRenderer.invoke('llm:getStatus'),
    getEnhancementDetails: (fieldId: string) =>
      ipcRenderer.invoke('llm:getEnhancementDetails', fieldId),
    reconnect: () => ipcRenderer.invoke('llm:reconnect'),
  },
  browser: {
    getCurrentUrl: () => ipcRenderer.invoke('browser:getCurrentUrl'),
    getHistory: () => ipcRenderer.invoke('browser:getHistory'),
    detectJobSite: (url: string) =>
      ipcRenderer.invoke('browser:detectJobSite', url),
    analyzeHTML: (html: string, pageUrl?: string, pageTitle?: string) =>
      ipcRenderer.invoke('browser:analyzeHTML', html, pageUrl, pageTitle),
    setLLMEnabled: (enabled: boolean) =>
      ipcRenderer.invoke('browser:setLLMEnabled', enabled),
    getEnhancementConfig: () =>
      ipcRenderer.invoke('browser:getEnhancementConfig'),
    updateEnhancementConfig: (config: {
      enableLLM: boolean;
      enableCache: boolean;
      selectedModel?: string;
    }) => ipcRenderer.invoke('browser:updateEnhancementConfig', config),
    onNavigationStart: (url: string) =>
      ipcRenderer.send('browser:navigationStart', url),
    onNavigationComplete: (url: string, title?: string) =>
      ipcRenderer.send('browser:navigationComplete', url, title),
  },
  form: {
    updateField: (field: FormField, value: string, options?: TypingOptions) =>
      ipcRenderer.invoke('form:updateField', field, value, options),
    focusField: (field: FormField) =>
      ipcRenderer.invoke('form:focusField', field),
    getFieldValue: (field: FormField) =>
      ipcRenderer.invoke('form:getFieldValue', field),
    monitorFields: (fields: FormField[]) =>
      ipcRenderer.invoke('form:monitorFields', fields),
  },
});
