import type { LogEntry, LoggerTransport } from '../types';
import type { StreamEvent } from '../../types/stream-events';

interface TerminalTransportOptions {
  eventBus?: {
    emit: (event: Partial<StreamEvent>) => void;
  };
  ipcRenderer?: {
    send: (channel: string, ...args: unknown[]) => void;
  };
}

export class TerminalTransport implements LoggerTransport {
  name = 'terminal';
  isEnabled = true;

  constructor(private options: TerminalTransportOptions) {}

  log(entry: LogEntry): void {
    // Convert LogEntry to StreamEvent format
    const streamEvent: Partial<StreamEvent> = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(entry.timestamp),
      type: this.mapLogLevelToEventType(entry.level),
      data: {
        source: entry.source === 'main' ? 'system' : entry.source,
        message: entry.message,
        level: entry.level,
        ...entry.context,
      },
    };

    // Send via EventBus if available (backend)
    if (this.options.eventBus) {
      this.options.eventBus.emit(streamEvent);
    }

    // Send via IPC if available (frontend)
    if (this.options.ipcRenderer) {
      this.options.ipcRenderer.send('logger:event', streamEvent);
    }

    // If in renderer process with window.electronAPI
    if (
      typeof window !== 'undefined' &&
      (
        window as unknown as {
          electronAPI?: { logger?: { send?: (event: unknown) => void } };
        }
      ).electronAPI?.logger?.send
    ) {
      (
        window as unknown as {
          electronAPI: { logger: { send: (event: unknown) => void } };
        }
      ).electronAPI.logger.send(streamEvent);
    }
  }

  private mapLogLevelToEventType(level: string): StreamEvent['type'] {
    switch (level) {
      case 'error':
        return 'error';
      case 'warn':
        return 'warning';
      case 'info':
        return 'info';
      case 'debug':
      case 'trace':
        return 'debug:output';
      default:
        return 'info';
    }
  }
}
