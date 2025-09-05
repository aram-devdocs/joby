import { useEffect, useState, useCallback, useRef } from 'react';
import type { StreamEvent, StreamContext } from '../types/terminal';

// Type for future streaming API (when implemented)
interface StreamingOllamaAPI {
  streamEvents: (sessionId: string) => void;
  stopStreamEvents: (sessionId: string) => void;
  on: (event: string, callback: (arg?: unknown) => void) => void;
  removeAllListeners: (event: string) => void;
}

interface StreamDataOptions {
  maxEvents?: number;
  deduplicationWindow?: number; // ms
  autoConnect?: boolean;
}

interface StreamDataReturn {
  context: StreamContext;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  clearEvents: () => void;
  exportEvents: () => StreamEvent[];
}

const DEFAULT_OPTIONS: Required<StreamDataOptions> = {
  maxEvents: 1000,
  deduplicationWindow: 100,
  autoConnect: true,
};

export function useStreamData(
  sessionId: string,
  options: StreamDataOptions = {},
): StreamDataReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [context, setContext] = useState<StreamContext>({
    sessionId,
    events: [],
    isConnected: false,
    lastActivity: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid stale closures in event handlers
  const contextRef = useRef(context);
  const deduplicationRef = useRef<Map<string, number>>(new Map());

  contextRef.current = context;

  // Event deduplication helper
  const isDuplicateEvent = useCallback(
    (event: StreamEvent): boolean => {
      const now = Date.now();
      const eventKey = `${event.type}:${event.source}:${JSON.stringify(event.data)}`;
      const lastSeen = deduplicationRef.current.get(eventKey);

      if (lastSeen && now - lastSeen < opts.deduplicationWindow) {
        return true;
      }

      deduplicationRef.current.set(eventKey, now);

      // Clean up old entries to prevent memory leaks
      if (deduplicationRef.current.size > 100) {
        const cutoff = now - opts.deduplicationWindow * 10;
        for (const [key, timestamp] of deduplicationRef.current.entries()) {
          if (timestamp < cutoff) {
            deduplicationRef.current.delete(key);
          }
        }
      }

      return false;
    },
    [opts.deduplicationWindow],
  );

  // Add event with proper ordering and deduplication
  const addEvent = useCallback(
    (event: StreamEvent) => {
      if (isDuplicateEvent(event)) {
        return;
      }

      setContext((prev) => {
        const newEvents = [...prev.events, event];

        // Sort by timestamp to maintain order
        newEvents.sort((a, b) => a.timestamp - b.timestamp);

        // Trim to max events if needed
        if (newEvents.length > opts.maxEvents) {
          newEvents.splice(0, newEvents.length - opts.maxEvents);
        }

        return {
          ...prev,
          events: newEvents,
          lastActivity: Date.now(),
        };
      });
    },
    [isDuplicateEvent, opts.maxEvents],
  );

  // IPC event handlers
  const handleStreamEvent = useCallback(
    (event: StreamEvent) => {
      addEvent(event);
    },
    [addEvent],
  );

  const handleConnectionStatus = useCallback((connected: boolean) => {
    setContext((prev) => ({ ...prev, isConnected: connected }));
    if (connected) {
      setError(null);
    }
  }, []);

  const handleStreamError = useCallback(
    (errorMessage: string) => {
      setError(errorMessage);
      setContext((prev) => ({ ...prev, isConnected: false }));

      // Add error event to stream
      const errorEvent: StreamEvent = {
        id: `error-${Date.now()}`,
        timestamp: Date.now(),
        type: 'error',
        source: 'stream',
        data: {
          error: errorMessage,
          message: 'Stream connection error',
        },
      };
      addEvent(errorEvent);
    },
    [addEvent],
  );

  // Connection management
  const connect = useCallback(() => {
    // Check if streaming API exists (future implementation)
    // Use type assertion to unknown first to avoid TypeScript strict type checking
    const streamingAPI = (
      window.electronAPI as unknown as { ollama?: StreamingOllamaAPI }
    )?.ollama;
    if (!streamingAPI?.streamEvents) {
      setError('Streaming API not yet implemented');
      // For now, simulate connection for development
      setTimeout(() => {
        handleConnectionStatus(false);
        setError(
          'Streaming will be available when backend integration is complete',
        );
      }, 100);
      return;
    }

    try {
      // Remove existing listeners to prevent duplicates
      streamingAPI.removeAllListeners?.('stream-event');
      streamingAPI.removeAllListeners?.('stream-connected');
      streamingAPI.removeAllListeners?.('stream-disconnected');
      streamingAPI.removeAllListeners?.('stream-error');

      // Set up event listeners
      streamingAPI.on?.('stream-event', (event) => {
        if (event && typeof event === 'object' && 'id' in event) {
          handleStreamEvent(event as StreamEvent);
        }
      });
      streamingAPI.on?.('stream-connected', () => handleConnectionStatus(true));
      streamingAPI.on?.('stream-disconnected', () =>
        handleConnectionStatus(false),
      );
      streamingAPI.on?.('stream-error', (error) => {
        if (typeof error === 'string') {
          handleStreamError(error);
        }
      });

      // Start streaming
      streamingAPI.streamEvents(sessionId);

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown connection error';
      setError(errorMessage);
    }
  }, [sessionId, handleStreamEvent, handleConnectionStatus, handleStreamError]);

  const disconnect = useCallback(() => {
    try {
      const streamingAPI = (
        window.electronAPI as unknown as { ollama?: StreamingOllamaAPI }
      )?.ollama;

      // Remove listeners
      streamingAPI?.removeAllListeners?.('stream-event');
      streamingAPI?.removeAllListeners?.('stream-connected');
      streamingAPI?.removeAllListeners?.('stream-disconnected');
      streamingAPI?.removeAllListeners?.('stream-error');

      // Stop streaming
      streamingAPI?.stopStreamEvents?.(sessionId);

      setContext((prev) => ({ ...prev, isConnected: false }));
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown disconnection error';
      setError(errorMessage);
    }
  }, [sessionId]);

  const clearEvents = useCallback(() => {
    setContext((prev) => ({
      ...prev,
      events: [],
      lastActivity: Date.now(),
    }));
    deduplicationRef.current.clear();
  }, []);

  const exportEvents = useCallback((): StreamEvent[] => {
    return [...contextRef.current.events];
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (opts.autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, opts.autoConnect]);

  // Update sessionId when it changes
  useEffect(() => {
    setContext((prev) => ({ ...prev, sessionId }));
  }, [sessionId]);

  return {
    context,
    isConnected: context.isConnected,
    error,
    connect,
    disconnect,
    clearEvents,
    exportEvents,
  };
}
