// Re-export shared types and augment the UI window types
import '@packages/ui/src/types/window';
import type { ElectronAPI } from '@packages/shared';

// The ElectronAPI interface is now fully defined in @packages/shared
// We just re-export and ensure the global Window interface is set

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
