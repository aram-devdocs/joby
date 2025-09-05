// Existing service exports for backward compatibility
export { OllamaService } from './ollama/service';
export type {
  OllamaConfig,
  OllamaModel,
  OllamaPromptRequest,
  OllamaPromptResponse,
  OllamaClient,
} from './ollama/types';

// New streaming infrastructure exports
export { OllamaStreamManager } from './ollama/stream-manager';
export * from './events';
export * from './debug';

// Backward compatibility adapters
export * from './adapters';

// Logger exports
export { Logger, initializeLogger } from './logger';
