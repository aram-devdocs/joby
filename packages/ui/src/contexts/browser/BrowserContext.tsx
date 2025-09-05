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
      // Get current field state to avoid stale closures
      let field: InteractiveFormField | undefined;
      setInteractiveFields((prev) => {
        field = prev.get(fieldId);
        return prev;
      });

      if (!field || !browserAPI?.executeScript) {
        return;
      }
      if (!field.selector) {
        // Field has no selector, can't sync
        return;
      }

      // Only sync if the value has actually changed
      if (field.uiValue === field.browserValue) {
        return;
      }

      // Set syncing status immediately
      setInteractiveFields((prev) => {
        const newMap = new Map(prev);
        const f = newMap.get(fieldId);
        if (f) {
          newMap.set(fieldId, { ...f, syncStatus: 'syncing' });
        }
        return newMap;
      });

      try {
        // Check if window.electronAPI is available (in Electron context)
        if (
          typeof window !== 'undefined' &&
          window.electronAPI?.form?.updateField
        ) {
          // Convert InteractiveFormField to FormField format for IPC
          const formField: FormField = {
            type: field.type,
            required: field.required || false,
            ...(field.id && { id: field.id }),
            ...(field.name && { name: field.name }),
            ...(field.label && { label: field.label }),
            ...(field.placeholder && { placeholder: field.placeholder }),
            ...(field.value && { value: field.value }),
            ...(field.selector && { selector: field.selector }),
            ...(field.xpath && { xpath: field.xpath }),
            ...(field.position && { position: field.position }),
            ...(field.attributes && { attributes: field.attributes }),
          };

          // Use the FormInteractionService through IPC for better typing simulation
          const result = await window.electronAPI.form.updateField(
            formField,
            field.uiValue || '',
            {
              minDelay: 50,
              maxDelay: 150,
              clearFirst: true,
              simulateFocus: true,
              simulateBlur: true,
            },
          );

          // Execute the generated script from FormInteractionService
          if (result.script) {
            await browserAPI.executeScript(result.script);
          }
        } else {
          // Fallback to direct script execution if electronAPI is not available
          const script = `
            (function() {
              const field = document.querySelector('${field.selector}');
              if (field) {
                field.value = '${(field.uiValue || '').replace(/'/g, "\\'")}';
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
              }
            })();
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

        // Reset sync status after a longer delay for better visual feedback
        setTimeout(() => {
          setInteractiveFields((prev) => {
            const newMap = new Map(prev);
            const f = newMap.get(fieldId);
            if (f && f.syncStatus === 'synced') {
              newMap.set(fieldId, { ...f, syncStatus: 'idle' });
            }
            return newMap;
          });
        }, 3000);
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

        // Reset error status after delay
        setTimeout(() => {
          setInteractiveFields((prev) => {
            const newMap = new Map(prev);
            const f = newMap.get(fieldId);
            if (f && f.syncStatus === 'error') {
              newMap.set(fieldId, { ...f, syncStatus: 'idle' });
            }
            return newMap;
          });
        }, 3000);
      }
    },
    [browserAPI],
  );

  const syncAllFields = useCallback(async () => {
    // Get the latest state to avoid stale closures
    let fieldsToSync: Array<[string, InteractiveFormField]> = [];

    setInteractiveFields((prev) => {
      fieldsToSync = Array.from(prev.entries()).filter(
        ([_, field]) => field.uiValue && field.uiValue !== field.browserValue,
      );
      return prev;
    });

    // Sync fields sequentially with small delays to avoid overwhelming the page
    for (const [fieldId] of fieldsToSync) {
      await syncField(fieldId);
      // Small delay between syncs
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }, [syncField]);

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
