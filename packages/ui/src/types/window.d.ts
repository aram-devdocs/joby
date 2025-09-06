// Re-import ElectronAPI from shared to avoid duplication
import type { ElectronAPI } from '@packages/shared';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
