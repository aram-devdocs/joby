/**
 * Stream-related types and interfaces
 */

/**
 * Request structure for streaming prompts to LLM
 */
export interface StreamRequest {
  model: string;
  prompt: string;
  context: string;
  userPrompt?: string;
  contextData?: Record<string, unknown>;
}

/**
 * Base structure for stream events
 */
export interface StreamEventBase {
  type: string;
  data: Record<string, unknown>;
}

/**
 * Stream event types
 */
export type StreamEventType =
  | 'stream:started'
  | 'stream:chunk'
  | 'stream:completed'
  | 'stream:error'
  | 'stream:cancelled'
  | 'debug:output'
  | 'info'
  | 'warning'
  | 'error';

/**
 * Complete stream event structure
 */
export interface StreamEvent {
  id: string;
  type: StreamEventType;
  timestamp?: Date;
  data?: unknown;
}

/**
 * Stream state information
 */
export interface StreamInfo {
  id: string;
  status: 'idle' | 'streaming' | 'completed' | 'error' | 'cancelled';
  model?: string;
  startTime?: Date;
  endTime?: Date;
  chunks: string[];
  fullContent?: string;
  error?: Error;
  metadata?: Record<string, unknown>;
}

/**
 * Type guard for stream events
 */
export function isStreamEvent(event: unknown): event is StreamEventBase {
  return (
    typeof event === 'object' &&
    event !== null &&
    typeof (event as StreamEventBase).type === 'string' &&
    typeof (event as StreamEventBase).data === 'object'
  );
}
