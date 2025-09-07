import type { LogEntry, LoggerTransport } from '../types';

export class ConsoleTransport implements LoggerTransport {
  name = 'console';
  isEnabled = true;

  constructor(private options?: { colors?: boolean; timestamp?: boolean }) {}

  log(entry: LogEntry): void {
    if (typeof console === 'undefined') return;

    const timestamp =
      this.options?.timestamp === true
        ? `[${new Date(entry.timestamp).toISOString()}]`
        : '';

    const prefix =
      `${timestamp}[${entry.source}][${entry.level.toUpperCase()}]`.trim();
    const message = `${prefix} ${entry.message}`;

    const args: unknown[] = [message];
    if (entry.context !== undefined) {
      args.push(entry.context);
    }

    switch (entry.level) {
      case 'trace':
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(...args);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(...args);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(...args);
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(...args);
        if (entry.stack !== undefined) {
          // eslint-disable-next-line no-console
          console.error(entry.stack);
        }
        break;
    }
  }
}
