import React, { createContext, useContext, useState, useCallback } from 'react';
import type { FormField, InteractiveFormField } from '../../types/form';

export interface FormData {
  fields: FormField[];
}

export interface BrowserAPI {
  detectJobSite?: (url: string) => Promise<string | null>;
  executeScript?: (script: string) => Promise<unknown>;
}

interface BrowserContextValue {
  detectedForms: FormData[];
  setDetectedForms: (forms: FormData[]) => void;
  clearForms: () => void;
  browserAPI?: BrowserAPI;
  setBrowserAPI: (api: BrowserAPI) => void;
  // Interactive form fields
  interactiveFields: Map<string, InteractiveFormField>;
  setFieldEditing: (fieldId: string, isEditing: boolean) => void;
  updateFieldValue: (fieldId: string, value: string) => void;
  syncField: (fieldId: string) => Promise<void>;
  syncAllFields: () => Promise<void>;
  initializeInteractiveFields: (fields: FormField[]) => void;
}

const BrowserContext = createContext<BrowserContextValue | undefined>(
  undefined,
);

export function BrowserProvider({
  children,
  browserAPI: initialAPI,
}: {
  children: React.ReactNode;
  browserAPI?: BrowserAPI;
}) {
  const [detectedForms, setDetectedForms] = useState<FormData[]>([]);
  const [browserAPI, setBrowserAPI] = useState<BrowserAPI | undefined>(
    initialAPI,
  );
  const [interactiveFields, setInteractiveFields] = useState<
    Map<string, InteractiveFormField>
  >(new Map());

  const clearForms = useCallback(() => {
    setDetectedForms([]);
    setInteractiveFields(new Map());
  }, []);

  const initializeInteractiveFields = useCallback((fields: FormField[]) => {
    const newFieldsMap = new Map<string, InteractiveFormField>();
    fields.forEach((field) => {
      const fieldId = field.id || field.name || `field-${Math.random()}`;
      newFieldsMap.set(fieldId, {
        ...field,
        isEditing: false,
        syncStatus: 'idle',
        uiValue: field.value || '',
        browserValue: field.value || '',
      });
    });
    setInteractiveFields(newFieldsMap);
  }, []);

  const setFieldEditing = useCallback((fieldId: string, isEditing: boolean) => {
    setInteractiveFields((prev) => {
      const newMap = new Map(prev);
      const field = newMap.get(fieldId);
      if (field) {
        newMap.set(fieldId, { ...field, isEditing });
      }
      return newMap;
    });
  }, []);

  const updateFieldValue = useCallback((fieldId: string, value: string) => {
    setInteractiveFields((prev) => {
      const newMap = new Map(prev);
      const field = newMap.get(fieldId);
      if (field) {
        newMap.set(fieldId, { ...field, uiValue: value });
      }
      return newMap;
    });
  }, []);

  const syncField = useCallback(
    async (fieldId: string) => {
      const field = interactiveFields.get(fieldId);
      if (!field || !browserAPI?.executeScript) {
        return;
      }
      if (!field.selector) {
        // Field has no selector, can't sync
        return;
      }

      // Set syncing status
      setInteractiveFields((prev) => {
        const newMap = new Map(prev);
        const f = newMap.get(fieldId);
        if (f) {
          newMap.set(fieldId, { ...f, syncStatus: 'syncing' });
        }
        return newMap;
      });

      try {
        // Check if electronAPI is available
        if (typeof window !== 'undefined' && window.electronAPI) {
          // Get the update script from the backend
          const { script } = await window.electronAPI.form.updateField(
            field,
            field.uiValue,
          );

          // Execute the script in the webview
          await browserAPI.executeScript(script);
        } else {
          // Fallback: generate script directly (for testing)
          const script = `
            (function() {
              const element = document.querySelector('${field.selector}');
              if (element) {
                element.value = ${JSON.stringify(field.uiValue)};
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                return { success: true, value: element.value };
              }
              return { success: false, error: 'Element not found' };
            })()
          `;
          await browserAPI.executeScript(script);
        }

        // Update sync status
        setInteractiveFields((prev) => {
          const newMap = new Map(prev);
          const f = newMap.get(fieldId);
          if (f) {
            newMap.set(fieldId, {
              ...f,
              browserValue: f.uiValue,
              syncStatus: 'synced',
              lastSyncTime: Date.now(),
            });
          }
          return newMap;
        });

        // Reset sync status after a delay
        setTimeout(() => {
          setInteractiveFields((prev) => {
            const newMap = new Map(prev);
            const f = newMap.get(fieldId);
            if (f && f.syncStatus === 'synced') {
              newMap.set(fieldId, { ...f, syncStatus: 'idle' });
            }
            return newMap;
          });
        }, 2000);
      } catch {
        // Set error status
        setInteractiveFields((prev) => {
          const newMap = new Map(prev);
          const f = newMap.get(fieldId);
          if (f) {
            newMap.set(fieldId, { ...f, syncStatus: 'error' });
          }
          return newMap;
        });
        // Failed to sync field
      }
    },
    [interactiveFields, browserAPI],
  );

  const syncAllFields = useCallback(async () => {
    const fieldsToSync = Array.from(interactiveFields.entries()).filter(
      ([_, field]) => field.isEditing && field.uiValue !== field.browserValue,
    );

    await Promise.all(fieldsToSync.map(([fieldId]) => syncField(fieldId)));
  }, [interactiveFields, syncField]);

  const value: BrowserContextValue = {
    detectedForms,
    setDetectedForms,
    clearForms,
    ...(browserAPI && { browserAPI }),
    setBrowserAPI,
    interactiveFields,
    setFieldEditing,
    updateFieldValue,
    syncField,
    syncAllFields,
    initializeInteractiveFields,
  };

  return (
    <BrowserContext.Provider value={value}>{children}</BrowserContext.Provider>
  );
}

export function useBrowserContext() {
  const context = useContext(BrowserContext);
  if (!context) {
    throw new Error('useBrowserContext must be used within a BrowserProvider');
  }
  return context;
}
