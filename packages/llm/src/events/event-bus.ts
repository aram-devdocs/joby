/**
 * Centralized event management system for stream events
 * Provides type-safe event emission and subscription with filtering capabilities
 */

import type {
  StreamEvent,
  StreamEventListener,
  EventFilter,
} from './stream-events';

export class EventBus {
  private listeners = new Map<string, Set<StreamEventListener>>();
  private globalListeners = new Set<StreamEventListener>();

  /**
   * Subscribe to all events
   */
  subscribe(listener: StreamEventListener): () => void {
    this.globalListeners.add(listener);
    return () => this.globalListeners.delete(listener);
  }

  /**
   * Subscribe to specific event types
   */
  subscribeToTypes(
    eventTypes: StreamEvent['type'][],
    listener: StreamEventListener,
  ): () => void {
    const unsubscribeFunctions: Array<() => void> = [];

    for (const eventType of eventTypes) {
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, new Set());
      }
      const typeListeners = this.listeners.get(eventType);
      if (!typeListeners) {
        continue;
      }
      typeListeners.add(listener);

      unsubscribeFunctions.push(() => {
        typeListeners.delete(listener);
        if (typeListeners.size === 0) {
          this.listeners.delete(eventType);
        }
      });
    }

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }

  /**
   * Subscribe with filter criteria
   */
  subscribeWithFilter(
    filter: EventFilter,
    listener: StreamEventListener,
  ): () => void {
    const filteredListener: StreamEventListener = (event) => {
      if (!this.eventMatchesFilter(event, filter)) {
        return;
      }
      listener(event);
    };

    if (filter.eventTypes && filter.eventTypes.length > 0) {
      return this.subscribeToTypes(filter.eventTypes, filteredListener);
    }

    return this.subscribe(filteredListener);
  }

  /**
   * Emit an event to all relevant listeners
   */
  emit<T extends StreamEvent>(event: T): void {
    // Emit to global listeners
    for (const listener of this.globalListeners) {
      try {
        listener(event);
      } catch (error) {
        // Prevent listener errors from affecting other listeners
        this.emitDebugError('Event listener error', error);
      }
    }

    // Emit to type-specific listeners
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      for (const listener of typeListeners) {
        try {
          listener(event);
        } catch (error) {
          this.emitDebugError('Event listener error', error);
        }
      }
    }
  }

  /**
   * Get current listener count for debugging
   */
  getListenerCounts(): Record<string, number> {
    const counts: Record<string, number> = {
      global: this.globalListeners.size,
    };

    for (const [eventType, listeners] of this.listeners) {
      counts[eventType] = listeners.size;
    }

    return counts;
  }

  /**
   * Clear all listeners (useful for testing)
   */
  clearAll(): void {
    this.globalListeners.clear();
    this.listeners.clear();
  }

  /**
   * Clear listeners for specific event types
   */
  clearEventTypes(eventTypes: StreamEvent['type'][]): void {
    for (const eventType of eventTypes) {
      this.listeners.delete(eventType);
    }
  }

  private eventMatchesFilter(event: StreamEvent, filter: EventFilter): boolean {
    // Check event type filter
    if (filter.eventTypes && !filter.eventTypes.includes(event.type)) {
      return false;
    }

    // Check streamId filter
    if (filter.streamId) {
      const eventWithStreamId = event as { data: { streamId?: string } };
      if (eventWithStreamId.data?.streamId !== filter.streamId) {
        return false;
      }
    }

    // Check context filter
    if (filter.context) {
      const eventWithMetadata = event as {
        data: { metadata?: { context?: string } };
      };
      if (eventWithMetadata.data?.metadata?.context !== filter.context) {
        return false;
      }
    }

    return true;
  }

  private emitDebugError(message: string, error: unknown): void {
    // Emit a debug error event, but avoid recursion
    const debugEvent: StreamEvent = {
      type: 'debug:output',
      data: {
        content: `${message}: ${error instanceof Error ? error.message : String(error)}`,
        level: 'error',
        timestamp: new Date(),
        source: 'EventBus',
      },
    };

    // Only emit to global listeners to prevent recursion
    for (const listener of this.globalListeners) {
      try {
        listener(debugEvent);
      } catch {
        // Ignore errors in error handling to prevent infinite recursion
      }
    }
  }
}

// Singleton instance
export const eventBus = new EventBus();
