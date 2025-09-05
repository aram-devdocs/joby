/**
 * Stream logging and persistence for AI debugging terminal
 * Provides structured logging and history management for stream events
 */

import type { StreamEvent, StreamContext } from '../events';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: 'stream' | 'system' | 'user' | 'debug';
  message: string;
  data?: unknown;
  streamId?: string;
  context?: StreamContext;
}

export interface StreamSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  entries: LogEntry[];
  metadata: {
    totalStreams: number;
    contexts: StreamContext[];
    models: string[];
  };
}

export class StreamLogger {
  private entries: LogEntry[] = [];
  private sessions: StreamSession[] = [];
  private currentSession: StreamSession | null = null;
  private maxEntries: number;
  private maxSessions: number;

  constructor(options: { maxEntries?: number; maxSessions?: number } = {}) {
    this.maxEntries = options.maxEntries || 1000;
    this.maxSessions = options.maxSessions || 10;
    this.startNewSession();
  }

  /**
   * Log a stream event
   */
  logEvent(event: StreamEvent): void {
    const entry = this.createLogEntryFromEvent(event);
    this.addLogEntry(entry);
  }

  /**
   * Log a custom message
   */
  log(
    level: LogEntry['level'],
    category: LogEntry['category'],
    message: string,
    data?: unknown,
    streamId?: string,
    context?: StreamContext,
  ): void {
    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      ...(streamId && { streamId }),
      ...(context && { context }),
    };

    this.addLogEntry(entry);
  }

  /**
   * Get all log entries
   */
  getAllEntries(): LogEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries by stream ID
   */
  getEntriesByStreamId(streamId: string): LogEntry[] {
    return this.entries.filter((entry) => entry.streamId === streamId);
  }

  /**
   * Get entries by context
   */
  getEntriesByContext(context: StreamContext): LogEntry[] {
    return this.entries.filter((entry) => entry.context === context);
  }

  /**
   * Get entries by level
   */
  getEntriesByLevel(level: LogEntry['level']): LogEntry[] {
    return this.entries.filter((entry) => entry.level === level);
  }

  /**
   * Get entries within time range
   */
  getEntriesByTimeRange(start: Date, end: Date): LogEntry[] {
    return this.entries.filter(
      (entry) => entry.timestamp >= start && entry.timestamp <= end,
    );
  }

  /**
   * Get recent entries
   */
  getRecentEntries(count = 50): LogEntry[] {
    return this.entries.slice(-count);
  }

  /**
   * Search entries by message content
   */
  searchEntries(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.entries.filter((entry) =>
      entry.message.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Clear all entries
   */
  clearEntries(): void {
    this.entries = [];
    this.startNewSession();
  }

  /**
   * Get current session
   */
  getCurrentSession(): StreamSession | null {
    return this.currentSession;
  }

  /**
   * Get all sessions
   */
  getAllSessions(): StreamSession[] {
    return [...this.sessions];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(
      {
        sessions: this.sessions,
        currentSession: this.currentSession,
        entries: this.entries,
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    );
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalEntries: number;
    entriesByLevel: Record<LogEntry['level'], number>;
    entriesByCategory: Record<LogEntry['category'], number>;
    currentSessionEntries: number;
    totalSessions: number;
  } {
    const entriesByLevel: Record<LogEntry['level'], number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    };

    const entriesByCategory: Record<LogEntry['category'], number> = {
      stream: 0,
      system: 0,
      user: 0,
      debug: 0,
    };

    for (const entry of this.entries) {
      entriesByLevel[entry.level]++;
      entriesByCategory[entry.category]++;
    }

    return {
      totalEntries: this.entries.length,
      entriesByLevel,
      entriesByCategory,
      currentSessionEntries: this.currentSession?.entries.length || 0,
      totalSessions: this.sessions.length,
    };
  }

  private createLogEntryFromEvent(event: StreamEvent): LogEntry {
    const id = this.generateId();
    const timestamp = new Date();

    switch (event.type) {
      case 'stream:started':
        return {
          id,
          timestamp,
          level: 'info',
          category: 'stream',
          message: `Stream started: ${event.data.metadata.model} (${event.data.metadata.context})`,
          data: event.data,
          streamId: event.data.streamId,
          context: event.data.metadata.context,
        };

      case 'stream:chunk':
        return {
          id,
          timestamp,
          level: 'debug',
          category: 'stream',
          message: `Chunk received: ${event.data.content.length} chars (seq: ${event.data.sequence})`,
          data: event.data,
          streamId: event.data.streamId,
        };

      case 'stream:completed':
        return {
          id,
          timestamp,
          level: 'info',
          category: 'stream',
          message: `Stream completed: ${event.data.metrics?.totalChunks} chunks, ${event.data.metrics?.durationMs}ms`,
          data: event.data,
          streamId: event.data.streamId,
          context: event.data.metadata.context,
        };

      case 'stream:error':
        return {
          id,
          timestamp,
          level: 'error',
          category: 'stream',
          message: `Stream error: ${event.data.error.message}`,
          data: event.data,
          streamId: event.data.streamId,
          context: event.data.metadata.context,
        };

      case 'stream:cancelled':
        return {
          id,
          timestamp,
          level: 'warn',
          category: 'stream',
          message: `Stream cancelled: ${event.data.reason || 'No reason provided'}`,
          data: event.data,
          streamId: event.data.streamId,
          context: event.data.metadata.context,
        };

      case 'debug:command':
        return {
          id,
          timestamp,
          level: 'info',
          category: 'user',
          message: `Command: ${event.data.command} ${event.data.args?.join(' ') || ''}`,
          data: event.data,
        };

      case 'debug:output':
        return {
          id,
          timestamp,
          level: event.data.level,
          category: 'debug',
          message: event.data.content,
          data: { source: event.data.source },
        };

      default:
        return {
          id,
          timestamp,
          level: 'debug',
          category: 'system',
          message: `Unknown event: ${(event as { type: string }).type}`,
          data: event,
        };
    }
  }

  private addLogEntry(entry: LogEntry): void {
    // Add to main entries
    this.entries.push(entry);

    // Add to current session
    if (this.currentSession) {
      this.currentSession.entries.push(entry);
      this.updateSessionMetadata(entry);
    }

    // Trim entries if necessary
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  private startNewSession(): void {
    // End current session if it exists
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      this.sessions.push(this.currentSession);

      // Trim sessions if necessary
      if (this.sessions.length > this.maxSessions) {
        this.sessions = this.sessions.slice(-this.maxSessions);
      }
    }

    // Start new session
    this.currentSession = {
      sessionId: this.generateId(),
      startTime: new Date(),
      entries: [],
      metadata: {
        totalStreams: 0,
        contexts: [],
        models: [],
      },
    };
  }

  private updateSessionMetadata(entry: LogEntry): void {
    if (!this.currentSession) {
      return;
    }

    const metadata = this.currentSession.metadata;

    // Update contexts
    if (entry.context && !metadata.contexts.includes(entry.context)) {
      metadata.contexts.push(entry.context);
    }

    // Extract model from stream data if available
    if (entry.data && typeof entry.data === 'object' && entry.data !== null) {
      const data = entry.data as { metadata?: { model?: string } };
      if (
        data.metadata?.model &&
        !metadata.models.includes(data.metadata.model)
      ) {
        metadata.models.push(data.metadata.model);
      }
    }

    // Count streams
    if (entry.message.includes('Stream started')) {
      metadata.totalStreams++;
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
