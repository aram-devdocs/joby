// Logger exports
export {
  Logger,
  ConsoleTransport,
  TerminalTransport,
  LocalStorageTransport,
} from './logger';

export type {
  LogLevel,
  LogEntry,
  LoggerTransport,
  LoggerConfig,
} from './logger';

// Type exports
export type {
  // Stream types
  StreamRequest,
  StreamEventBase,
  StreamEventType,
  StreamEvent,
  StreamInfo,
  // Form types
  ValidationRule,
  FormSelectOption,
  FormField,
  InteractiveFormField,
  FormInfo,
  TypingOptions,
  // Electron API types
  LLMStatus,
  EnhancementDetails,
  BrowserHistoryEntry,
  EnhancementConfig,
  OllamaModel,
  OllamaConnectionResult,
  ElectronAPI,
  // Terminal types
  TerminalEvent,
  TerminalSession,
  // Legacy types (for migration)
  LegacyStreamEventType,
  LegacyStreamEvent,
} from './types';

// Type guard exports
export { isStreamEvent } from './types';

// Utility exports
export { cssEscape } from './utils';
