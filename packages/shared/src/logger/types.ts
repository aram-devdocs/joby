export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  source: string;
  context?: Record<string, unknown>;
  error?: Error;
  stack?: string;
}

export interface LoggerTransport {
  name: string;
  isEnabled: boolean;
  log(entry: LogEntry): void | Promise<void>;
  flush?(): void | Promise<void>;
}

export interface LoggerConfig {
  level: LogLevel;
  transports: LoggerTransport[];
  context?: Record<string, unknown>;
  source?: string;
}

export const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};
