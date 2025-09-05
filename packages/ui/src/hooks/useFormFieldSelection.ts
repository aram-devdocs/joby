import { useState, useCallback, useEffect } from 'react';
import { useBrowserContext } from '../contexts/browser/BrowserContext';
import type { FormField } from '../types/form';

export interface UseFormFieldSelectionOptions {
  onSelectionChange?: (fieldId: string | null) => void;
  autoFocusOnSelect?: boolean;
}

export function useFormFieldSelection(
  options: UseFormFieldSelectionOptions = {},
) {
  const { onSelectionChange, autoFocusOnSelect = true } = options;
  const { interactiveFields, setFieldEditing, browserAPI } =
    useBrowserContext();
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Handle field selection
  const selectField = useCallback(
    async (fieldId: string) => {
      const field = interactiveFields.get(fieldId);
      if (!field) return;

      setSelectedFieldId(fieldId);
      setFieldEditing(fieldId, true);
      onSelectionChange?.(fieldId);

      // Auto-focus the field in the browser if enabled
      if (autoFocusOnSelect && browserAPI?.executeScript) {
        try {
          // Check if electronAPI is available
          if (typeof window === 'undefined' || !window.electronAPI) {
            // Fallback: focus directly
            const focusScript = `
              (function() {
                const element = document.querySelector('${field.selector}');
                if (element) {
                  element.focus();
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  return { success: true };
                }
                return { success: false, error: 'Element not found' };
              })()
            `;
            await browserAPI.executeScript(focusScript);
            return;
          }
          const { script } = await window.electronAPI.form.focusField(field);
          await browserAPI.executeScript(script);
        } catch {
          // Failed to focus field in browser
        }
      }
    },
    [
      interactiveFields,
      setFieldEditing,
      browserAPI,
      autoFocusOnSelect,
      onSelectionChange,
    ],
  );

  // Handle field deselection
  const deselectField = useCallback(() => {
    if (selectedFieldId) {
      setFieldEditing(selectedFieldId, false);
      setSelectedFieldId(null);
      onSelectionChange?.(null);
    }
  }, [selectedFieldId, setFieldEditing, onSelectionChange]);

  // Toggle field selection
  const toggleFieldSelection = useCallback(
    (fieldId: string) => {
      if (selectedFieldId === fieldId) {
        deselectField();
      } else {
        selectField(fieldId);
      }
    },
    [selectedFieldId, selectField, deselectField],
  );

  // Enable selection mode
  const startSelectionMode = useCallback(() => {
    setIsSelecting(true);
  }, []);

  // Disable selection mode
  const endSelectionMode = useCallback(() => {
    setIsSelecting(false);
    deselectField();
  }, [deselectField]);

  // Get field by coordinates (for click selection in form analysis panel)
  const getFieldAtPosition = useCallback(
    (x: number, y: number): FormField | null => {
      for (const [_, field] of interactiveFields) {
        if (field.position) {
          const { position } = field;
          if (
            x >= position.x &&
            x <= position.x + position.width &&
            y >= position.y &&
            y <= position.y + position.height
          ) {
            return field;
          }
        }
      }
      return null;
    },
    [interactiveFields],
  );

  // Highlight field in browser
  const highlightField = useCallback(
    async (fieldId: string, highlight = true) => {
      const field = interactiveFields.get(fieldId);
      if (!field || !browserAPI?.executeScript) return;

      const script = `
        (function() {
          const selector = ${JSON.stringify(field.selector || '')};
          const element = document.querySelector(selector);
          if (element) {
            if (${highlight}) {
              element.style.outline = '2px solid #3B82F6';
              element.style.outlineOffset = '2px';
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              element.style.outline = '';
              element.style.outlineOffset = '';
            }
          }
        })();
      `;

      try {
        await browserAPI.executeScript(script);
      } catch {
        // Failed to highlight field
      }
    },
    [interactiveFields, browserAPI],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (selectedFieldId) {
        setFieldEditing(selectedFieldId, false);
      }
    };
  }, [selectedFieldId, setFieldEditing]);

  return {
    selectedFieldId,
    isSelecting,
    selectField,
    deselectField,
    toggleFieldSelection,
    startSelectionMode,
    endSelectionMode,
    getFieldAtPosition,
    highlightField,
  };
}
