/**
 * Stream event types and interfaces for AI debugging terminal
 * Provides comprehensive event definitions for stream lifecycle management
 */

export type StreamContext =
  | 'form-analysis'
  | 'user-chat'
  | 'settings-test'
  | 'debug-manual';

export type StreamStatus =
  | 'starting'
  | 'streaming'
  | 'completed'
  | 'error'
  | 'cancelled';

export interface StreamMetadata {
  /** Unique identifier for this stream */
  streamId: string;
  /** Context that initiated this stream */
  context: StreamContext;
  /** Model being used for the stream */
  model: string;
  /** Timestamp when stream was initiated */
  startedAt: Date;
  /** Optional user-provided prompt for manual debugging */
  userPrompt?: string;
  /** Additional metadata specific to the context */
  contextData?: Record<string, unknown>;
}

export interface StreamChunk {
  /** Unique identifier for this stream */
  streamId: string;
  /** Raw response chunk from Ollama */
  content: string;
  /** Sequence number for ordering */
  sequence: number;
  /** Timestamp when chunk was received */
  timestamp: Date;
}

export interface StreamResult {
  /** Unique identifier for this stream */
  streamId: string;
  /** Complete response content */
  fullContent: string;
  /** Final status of the stream */
  status: StreamStatus;
  /** Stream metadata */
  metadata: StreamMetadata;
  /** Timestamp when stream completed */
  completedAt: Date;
  /** Error information if stream failed */
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  /** Performance metrics */
  metrics?: {
    totalChunks: number;
    totalBytes: number;
    durationMs: number;
    tokensPerSecond?: number;
  };
}

// Event type definitions
export interface StreamStartedEvent {
  type: 'stream:started';
  data: {
    streamId: string;
    metadata: StreamMetadata;
    prompt: string;
  };
}

export interface StreamChunkEvent {
  type: 'stream:chunk';
  data: StreamChunk;
}

export interface StreamCompletedEvent {
  type: 'stream:completed';
  data: StreamResult;
}

export interface StreamErrorEvent {
  type: 'stream:error';
  data: {
    streamId: string;
    error: {
      message: string;
      code?: string;
      details?: unknown;
    };
    metadata: StreamMetadata;
  };
}

export interface StreamCancelledEvent {
  type: 'stream:cancelled';
  data: {
    streamId: string;
    metadata: StreamMetadata;
    reason?: string;
  };
}

export interface DebugCommandEvent {
  type: 'debug:command';
  data: {
    command: string;
    args?: string[];
    timestamp: Date;
  };
}

export interface DebugOutputEvent {
  type: 'debug:output';
  data: {
    content: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    timestamp: Date;
    source?: string;
  };
}

// Union type for all stream events
export type StreamEvent =
  | StreamStartedEvent
  | StreamChunkEvent
  | StreamCompletedEvent
  | StreamErrorEvent
  | StreamCancelledEvent
  | DebugCommandEvent
  | DebugOutputEvent;

// Event listener type
export type StreamEventListener<T extends StreamEvent = StreamEvent> = (
  event: T,
) => void;

// Event filter types
export interface EventFilter {
  streamId?: string;
  context?: StreamContext;
  eventTypes?: StreamEvent['type'][];
}

// Stream request interface
export interface StreamRequest {
  model: string;
  prompt: string;
  context: StreamContext;
  userPrompt?: string;
  contextData?: Record<string, unknown>;
  options?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
    stop?: string[];
  };
}
