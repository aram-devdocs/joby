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
    getModels: () => ipcRenderer.invoke('ollama:getModels'),
    sendPrompt: (model: string, prompt: string) =>
      ipcRenderer.invoke('ollama:sendPrompt', model, prompt),
  },
  browser: {
    getCurrentUrl: () => ipcRenderer.invoke('browser:getCurrentUrl'),
    getHistory: () => ipcRenderer.invoke('browser:getHistory'),
    detectJobSite: (url: string) =>
      ipcRenderer.invoke('browser:detectJobSite', url),
    analyzeHTML: (html: string) =>
      ipcRenderer.invoke('browser:analyzeHTML', html),
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
