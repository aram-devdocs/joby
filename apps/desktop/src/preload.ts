import { contextBridge, ipcRenderer } from 'electron';

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
    sendPrompt: (model: string, prompt: string) => ipcRenderer.invoke('ollama:sendPrompt', model, prompt),
  },
});