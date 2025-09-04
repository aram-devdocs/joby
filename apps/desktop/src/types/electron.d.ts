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
  browser: {
    getCurrentUrl: () => Promise<string | undefined>;
    getHistory: () => Promise<any[]>;
    detectJobSite: (url: string) => Promise<string | null>;
    analyzeHTML: (html: string) => Promise<{ forms: any[]; summary: string }>;
    onNavigationStart: (url: string) => void;
    onNavigationComplete: (url: string, title?: string) => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
