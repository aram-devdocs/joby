export interface ElectronAPI {
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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}