import { useState, useCallback, useEffect, useRef } from 'react';
import { useBrowserContext } from '../contexts/browser/BrowserContext';

export interface UseFieldSyncOptions {
  debounceMs?: number;
  autoSync?: boolean;
  onSyncStart?: (fieldId: string) => void;
  onSyncComplete?: (fieldId: string, success: boolean) => void;
  onSyncError?: (fieldId: string, error: Error) => void;
}

export function useFieldSync(options: UseFieldSyncOptions = {}) {
  const {
    debounceMs = 300,
    autoSync = true,
    onSyncStart,
    onSyncComplete,
    onSyncError,
  } = options;

  const {
    interactiveFields,
    updateFieldValue,
    syncField,
    syncAllFields,
    browserAPI,
  } = useBrowserContext();

  const [syncQueue, setSyncQueue] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Update field value with debounced sync
  const updateValueWithSync = useCallback(
    (fieldId: string, value: string) => {
      // Update the value immediately
      updateFieldValue(fieldId, value);

      if (!autoSync) return;

      // Clear existing timer for this field
      const existingTimer = debounceTimers.current.get(fieldId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounce timer
      const timer = setTimeout(() => {
        setSyncQueue((prev) => new Set(prev).add(fieldId));
        debounceTimers.current.delete(fieldId);
      }, debounceMs);

      debounceTimers.current.set(fieldId, timer);
    },
    [updateFieldValue, autoSync, debounceMs],
  );

  // Process sync queue
  useEffect(() => {
    if (syncQueue.size === 0 || isSyncing) return;

    const processSyncQueue = async () => {
      setIsSyncing(true);
      const fieldsToSync = Array.from(syncQueue);
      setSyncQueue(new Set());

      for (const fieldId of fieldsToSync) {
        try {
          onSyncStart?.(fieldId);
          await syncField(fieldId);
          onSyncComplete?.(fieldId, true);
        } catch {
          // Failed to sync field
          onSyncError?.(fieldId, new Error('Sync failed'));
          onSyncComplete?.(fieldId, false);
        }
      }

      setIsSyncing(false);
    };

    processSyncQueue();
  }, [
    syncQueue,
    isSyncing,
    syncField,
    onSyncStart,
    onSyncComplete,
    onSyncError,
  ]);

  // Sync single field immediately
  const syncFieldNow = useCallback(
    async (fieldId: string) => {
      // Cancel any pending debounce
      const timer = debounceTimers.current.get(fieldId);
      if (timer) {
        clearTimeout(timer);
        debounceTimers.current.delete(fieldId);
      }

      // Remove from queue if present
      setSyncQueue((prev) => {
        const newQueue = new Set(prev);
        newQueue.delete(fieldId);
        return newQueue;
      });

      try {
        onSyncStart?.(fieldId);
        await syncField(fieldId);
        onSyncComplete?.(fieldId, true);
      } catch {
        // Failed to sync field
        onSyncError?.(fieldId, new Error('Sync failed'));
        onSyncComplete?.(fieldId, false);
      }
    },
    [syncField, onSyncStart, onSyncComplete, onSyncError],
  );

  // Sync all modified fields
  const syncAllFieldsNow = useCallback(async () => {
    // Clear all pending timers
    for (const timer of debounceTimers.current.values()) {
      clearTimeout(timer);
    }
    debounceTimers.current.clear();
    setSyncQueue(new Set());

    try {
      setIsSyncing(true);
      await syncAllFields();
    } finally {
      setIsSyncing(false);
    }
  }, [syncAllFields]);

  // Monitor field changes from browser
  const monitorBrowserChanges = useCallback(async () => {
    if (!browserAPI?.executeScript) return;

    const fields = Array.from(interactiveFields.values());
    if (fields.length === 0) return;

    try {
      // Check if electronAPI is available
      if (typeof window === 'undefined' || !window.electronAPI) {
        return;
      }
      const { script } = await window.electronAPI.form.monitorFields(fields);
      const fieldStates = (await browserAPI.executeScript(script)) as Record<
        string,
        { value: string }
      >;

      // Update browser values if they've changed
      for (const [selector, state] of Object.entries(fieldStates)) {
        const field = fields.find((f) => f.selector === selector);
        if (field && field.browserValue !== state.value) {
          // Field value changed in browser, update our state
          updateFieldValue(field.id || field.name || '', state.value);
        }
      }
    } catch {
      // Failed to monitor browser changes
    }
  }, [interactiveFields, browserAPI, updateFieldValue]);

  // Set up periodic monitoring
  useEffect(() => {
    if (!autoSync) return;

    const interval = setInterval(monitorBrowserChanges, 2000);
    return () => clearInterval(interval);
  }, [monitorBrowserChanges, autoSync]);

  // Clean up timers on unmount
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  // Get sync status for a field
  const getFieldSyncStatus = useCallback(
    (fieldId: string) => {
      const field = interactiveFields.get(fieldId);
      if (!field) return 'idle';

      if (syncQueue.has(fieldId)) return 'pending';
      if (field.syncStatus === 'syncing') return 'syncing';
      if (field.uiValue !== field.browserValue) return 'unsynced';

      return field.syncStatus;
    },
    [interactiveFields, syncQueue],
  );

  // Check if any fields need syncing
  const hasUnsyncedChanges = useCallback(() => {
    for (const field of interactiveFields.values()) {
      if (field.isEditing && field.uiValue !== field.browserValue) {
        return true;
      }
    }
    return false;
  }, [interactiveFields]);

  return {
    updateValueWithSync,
    syncFieldNow,
    syncAllFieldsNow,
    monitorBrowserChanges,
    getFieldSyncStatus,
    hasUnsyncedChanges,
    isSyncing,
    syncQueueSize: syncQueue.size,
  };
}
