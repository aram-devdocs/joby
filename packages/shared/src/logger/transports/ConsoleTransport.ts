import type { LogEntry, LoggerTransport } from '../types';

export class ConsoleTransport implements LoggerTransport {
  name = 'console';
  isEnabled = true;

  constructor(private options?: { colors?: boolean; timestamp?: boolean }) {}

  log(entry: LogEntry): void {
    if (typeof console === 'undefined') return;

    const timestamp = this.options?.timestamp
      ? `[${new Date(entry.timestamp).toISOString()}]`
      : '';

    const prefix =
      `${timestamp}[${entry.source}][${entry.level.toUpperCase()}]`.trim();
    const message = `${prefix} ${entry.message}`;

    const args: unknown[] = [message];
    if (entry.context) {
      args.push(entry.context);
    }

    switch (entry.level) {
      case 'trace':
      case 'debug':
        console.debug(...args);
        break;
      case 'info':
        console.info(...args);
        break;
      case 'warn':
        console.warn(...args);
        break;
      case 'error':
        console.error(...args);
        if (entry.stack) {
          console.error(entry.stack);
        }
        break;
    }
  }
}
