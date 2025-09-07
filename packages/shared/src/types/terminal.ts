/**
 * Terminal-related types and interfaces
 */

/**
 * Terminal output event
 */
export interface TerminalEvent {
  type: 'output' | 'error' | 'clear' | 'input';
  data: string;
  timestamp: number;
}

/**
 * Terminal session state
 */
export interface TerminalSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  output: string[];
  status: 'active' | 'completed' | 'error';
}
