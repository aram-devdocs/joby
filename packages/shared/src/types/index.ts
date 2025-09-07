/**
 * Re-export all shared types
 */

// Stream types
export type {
  StreamRequest,
  StreamEventBase,
  StreamEventType,
  StreamEvent,
  StreamInfo,
} from './stream';
export { isStreamEvent } from './stream';

// Form types
export type {
  ValidationRule,
  FormSelectOption,
  FormField,
  InteractiveFormField,
  FormInfo,
  TypingOptions,
} from './form';

// Electron API types
export type {
  LLMStatus,
  EnhancementDetails,
  BrowserHistoryEntry,
  EnhancementConfig,
  OllamaModel,
  OllamaConnectionResult,
  ElectronAPI,
} from './electron';

// Terminal types
export type { TerminalEvent, TerminalSession } from './terminal';

// Legacy stream events (for backward compatibility during migration)
export type { StreamEventType as LegacyStreamEventType } from './stream-events';
export type { StreamEvent as LegacyStreamEvent } from './stream-events';
