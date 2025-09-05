import type { LogEntry, LoggerTransport } from '../types';

interface LocalStorageTransportOptions {
  key?: string;
  maxEntries?: number;
  persist?: boolean;
}

export class LocalStorageTransport implements LoggerTransport {
  name = 'localStorage';
  isEnabled = true;
  private key: string;
  private maxEntries: number;
  private persist: boolean;
  private buffer: LogEntry[] = [];

  constructor(options?: LocalStorageTransportOptions) {
    this.key = options?.key || 'joby-logs';
    this.maxEntries = options?.maxEntries || 1000;
    this.persist = options?.persist ?? true;

    if (this.persist) {
      this.loadFromStorage();
    }
  }

  log(entry: LogEntry): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    this.buffer.push(entry);

    // Trim buffer if needed
    if (this.buffer.length > this.maxEntries) {
      this.buffer = this.buffer.slice(-this.maxEntries);
    }

    if (this.persist) {
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const stored = window.localStorage.getItem(this.key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.buffer = parsed;
        }
      }
    } catch {
      // Silently fail if storage is corrupted
      this.buffer = [];
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      window.localStorage.setItem(this.key, JSON.stringify(this.buffer));
    } catch (error) {
      // Handle quota exceeded or other errors
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Clear old entries and try again
        this.buffer = this.buffer.slice(-Math.floor(this.maxEntries / 2));
        try {
          window.localStorage.setItem(this.key, JSON.stringify(this.buffer));
        } catch {
          // Give up if still failing
        }
      }
    }
  }

  getLogs(): LogEntry[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer = [];
    if (this.persist && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.key);
    }
  }

  async flush(): Promise<void> {
    if (this.persist) {
      this.saveToStorage();
    }
  }
}
