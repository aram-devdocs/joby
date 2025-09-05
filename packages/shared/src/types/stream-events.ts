/**
 * Stream event types for terminal output
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

export interface StreamEvent {
  id: string;
  type: StreamEventType;
  timestamp?: Date;
  data?: unknown;
}
