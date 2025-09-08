import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { FormField, InteractiveFormField } from '../../types/form';
import { Logger } from '@packages/shared';

// Define types locally for now since they're not exported from browser package
type LLMConnectionStatus = {
  status: 'disconnected' | 'connecting' | 'connected' | 'processing' | 'error';
  message?: string;
  connectedAt?: number;
  lastError?: string;
};

type EnhancementDetails = {
  prompt?: string;
  response?: string;
  confidence?: number;
  fieldType?: string;
};

type Document = {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
};

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
  updateFieldValue: (
    fieldId: string,
    value: string,
    fieldUpdates?: Partial<InteractiveFormField>,
  ) => void;
  syncField: (fieldId: string) => Promise<void>;
  syncAllFields: () => Promise<void>;
  initializeInteractiveFields: (fields: FormField[]) => void;
  // LLM status tracking
  llmStatus: LLMConnectionStatus;
  setLLMStatus: (status: LLMConnectionStatus) => void;
  // Enhancement details tracking
  enhancementDetails: Map<string, EnhancementDetails>;
  setEnhancementDetails: (fieldId: string, details: EnhancementDetails) => void;
  getEnhancementDetails: (fieldId: string) => EnhancementDetails | undefined;
  // Field retry functionality
  retryFieldEnhancement: (fieldId: string) => Promise<void>;
  // Document management
  documents: Document[];
  addDocument: (name: string, content: string) => void;
  removeDocument: (id: string) => void;
  getDocument: (id: string) => Document | undefined;
  // AI field generation
  generateFieldValue: (fieldId: string, documentId?: string) => Promise<string>;
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
  const [llmStatus, setLLMStatus] = useState<LLMConnectionStatus>({
    status: 'disconnected',
    message: 'Not connected to Ollama',
  });
  const [enhancementDetails, setEnhancementDetailsState] = useState<
    Map<string, EnhancementDetails>
  >(new Map());
  const [documents, setDocuments] = useState<Document[]>([]);

  const clearForms = useCallback(() => {
    setDetectedForms([]);
    setInteractiveFields(new Map());
    setEnhancementDetailsState(new Map());
  }, []);

  const initializeInteractiveFields = useCallback((fields: FormField[]) => {
    const newFieldsMap = new Map<string, InteractiveFormField>();
    const newEnhancementMap = new Map<string, EnhancementDetails>();

    fields.forEach((field) => {
      const fieldId = field.id || field.name || `field-${Math.random()}`;
      newFieldsMap.set(fieldId, {
        ...field,
        isEditing: false,
        syncStatus: 'idle',
        uiValue: field.value || '',
        browserValue: field.value || '',
      });

      // Store enhancement details if present
      // Enhancement details are fetched separately, not part of field
      // if (field.enhancementDetails) {
      //   newEnhancementMap.set(fieldId, field.enhancementDetails);
      // }
    });

    setInteractiveFields(newFieldsMap);
    setEnhancementDetailsState(newEnhancementMap);
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

  const updateFieldValue = useCallback(
    (
      fieldId: string,
      value: string,
      fieldUpdates?: Partial<InteractiveFormField>,
    ) => {
      setInteractiveFields((prev) => {
        const newMap = new Map(prev);
        const field = newMap.get(fieldId);
        if (field) {
          newMap.set(fieldId, { ...field, uiValue: value, ...fieldUpdates });
        }
        return newMap;
      });
    },
    [],
  );

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
                const tagName = field.tagName.toLowerCase();
                const value = '${(field.uiValue || '').replace(/'/g, "\\'")}';
                
                // Use appropriate native setter for input or textarea
                if (tagName === 'textarea') {
                  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLTextAreaElement.prototype,
                    'value'
                  ).set;
                  nativeTextAreaValueSetter.call(field, value);
                } else {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    'value'
                  ).set;
                  nativeInputValueSetter.call(field, value);
                }
                
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

  const setEnhancementDetails = useCallback(
    (fieldId: string, details: EnhancementDetails) => {
      setEnhancementDetailsState((prev) => {
        const newMap = new Map(prev);
        newMap.set(fieldId, details);
        return newMap;
      });
    },
    [],
  );

  const getEnhancementDetails = useCallback(
    (fieldId: string) => {
      return enhancementDetails.get(fieldId);
    },
    [enhancementDetails],
  );

  const retryFieldEnhancement = useCallback(
    async (fieldId: string) => {
      const field = interactiveFields.get(fieldId);
      if (!field || !window.electronAPI?.browser) {
        return;
      }

      try {
        // Mark field as being re-enhanced
        setInteractiveFields((prev) => {
          const newMap = new Map(prev);
          const f = newMap.get(fieldId);
          if (f) {
            newMap.set(fieldId, { ...f, syncStatus: 'syncing' });
          }
          return newMap;
        });

        // Request re-enhancement through the browser service
        // This would need to be implemented in the main process
        // For now, we'll just update the status

        setInteractiveFields((prev) => {
          const newMap = new Map(prev);
          const f = newMap.get(fieldId);
          if (f) {
            newMap.set(fieldId, { ...f, syncStatus: 'synced' });
          }
          return newMap;
        });
      } catch {
        setInteractiveFields((prev) => {
          const newMap = new Map(prev);
          const f = newMap.get(fieldId);
          if (f) {
            newMap.set(fieldId, { ...f, syncStatus: 'error' });
          }
          return newMap;
        });
      }
    },
    [interactiveFields],
  );

  // Auto-connect to Ollama on mount
  useEffect(() => {
    const connectToOllama = async () => {
      // Connection is now handled automatically in main process
      // This is kept for potential manual reconnection needs
      if (window.electronAPI?.llm?.reconnect) {
        try {
          const success = await window.electronAPI.llm.reconnect();
          if (success) {
            setLLMStatus({
              status: 'connected',
              message: 'Connected to Ollama',
              connectedAt: Date.now(),
            });
          }
        } catch {
          setLLMStatus({
            status: 'error',
            message: 'Failed to connect to Ollama',
            lastError: 'Failed to connect',
          });
        }
      }
    };

    connectToOllama();

    // Poll for status updates
    const interval = setInterval(async () => {
      if (window.electronAPI?.llm?.getStatus) {
        try {
          const status = await window.electronAPI.llm.getStatus();
          setLLMStatus(status);
        } catch {
          // Ignore polling errors
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

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

  // Document management functions
  const addDocument = useCallback(
    (name: string, content: string) => {
      const newDocument: Document = {
        id: crypto.randomUUID(),
        name,
        content,
        createdAt: new Date(),
      };
      setDocuments((prev) => [...prev, newDocument]);

      // Save to localStorage for persistence
      const updatedDocuments = [...documents, newDocument];
      localStorage.setItem('joby-documents', JSON.stringify(updatedDocuments));
    },
    [documents],
  );

  const removeDocument = useCallback((id: string) => {
    setDocuments((prev) => {
      const filtered = prev.filter((doc) => doc.id !== id);
      localStorage.setItem('joby-documents', JSON.stringify(filtered));
      return filtered;
    });
  }, []);

  const getDocument = useCallback(
    (id: string) => {
      return documents.find((doc) => doc.id === id);
    },
    [documents],
  );

  const generateFieldValue = useCallback(
    async (fieldId: string, documentId?: string): Promise<string> => {
      Logger.info('[AI Generate] Starting generation for field:', { fieldId });

      const field = interactiveFields.get(fieldId);
      if (!field) {
        Logger.error(
          '[AI Generate] Field not found',
          new Error(`Field ${fieldId} not found`),
        );
        throw new Error('Field not found');
      }

      Logger.debug('[AI Generate] Field details:', {
        label: field.label,
        name: field.name,
        type: field.inputType,
        placeholder: field.placeholder,
      });

      // Use first document if none specified
      const targetDocument = documentId
        ? getDocument(documentId)
        : documents[0];

      if (!targetDocument) {
        Logger.error('[AI Generate] No document available');
        throw new Error('No document available for generation');
      }

      Logger.info('[AI Generate] Using document:', {
        id: targetDocument.id,
        name: targetDocument.name,
        contentLength: targetDocument.content.length,
      });

      // Create prompt for LLM
      const fieldLabel =
        field.label || field.name || field.placeholder || 'field';
      const fieldType = field.inputType || 'text';

      const prompt = `You are a form field extraction assistant. Extract the appropriate value from the document for the specified form field.

IMPORTANT: Return ONLY the extracted value with no explanation, no reasoning, no XML tags, and no additional text.

Document Content:
${targetDocument.content}

Field to Fill:
- Label: ${fieldLabel}
- Type: ${fieldType}
${field.placeholder ? `- Placeholder: ${field.placeholder}` : ''}
${field.required ? '- Required: Yes' : ''}

Examples:
- For "First Name" field: Return just "John" not "The first name is John"
- For "Email" field: Return just "john@example.com" not "Based on the resume, the email is john@example.com"
- For "Phone" field: Return just "555-1234" not any explanation

Return ONLY the extracted value:`;

      Logger.debug('[AI Generate] Prompt created', { length: prompt.length });

      try {
        if (window.electronAPI?.ollama?.sendPrompt) {
          Logger.debug('[AI Generate] Checking available models...');

          // Use available model - get first available one
          const models = await window.electronAPI.ollama.getModels();
          Logger.debug('[AI Generate] Available models:', { models });

          const model = models?.[0]?.name || 'llama3.2';
          Logger.info('[AI Generate] Using model:', { model });

          Logger.debug('[AI Generate] Sending prompt to Ollama...');
          const startTime = Date.now();

          const response = await window.electronAPI.ollama.sendPrompt(
            model,
            prompt,
          );

          const elapsed = Date.now() - startTime;
          Logger.info('[AI Generate] Response received', {
            elapsedMs: elapsed,
            response,
          });

          let result =
            typeof response === 'string'
              ? response.trim()
              : (response as { response?: string })?.response?.trim() || '';

          // Clean up the response - remove thinking tags and extract final answer
          // Remove <think> tags and their content
          result = result.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

          // If there are still tags or explanations, try to extract just the final value
          // Look for patterns like "the answer is X" or just take the last line
          if (
            result.includes('</') ||
            result.includes('<') ||
            result.length > 100
          ) {
            // Try to find the actual value after common phrases
            const patterns = [
              /(?:answer is|result is|value is|should be|would be|is)\s*[:\s]*([^\n.]+)/i,
              /(?:^|\n)([^\n<]+)$/, // Last line without tags
            ];

            for (const pattern of patterns) {
              const match = result.match(pattern);
              if (match && match[1]) {
                result = match[1].trim();
                break;
              }
            }

            // Final cleanup - remove any remaining tags
            result = result.replace(/<[^>]*>/g, '').trim();
          }

          // For names, capitalize properly
          if (fieldLabel.toLowerCase().includes('name') && result) {
            result = result
              .split(' ')
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
              )
              .join(' ');
          }

          Logger.info('[AI Generate] Final cleaned result:', { result });

          return result;
        }
        Logger.error(
          '[AI Generate] Ollama API not available on window.electronAPI',
        );
        throw new Error('LLM not available');
      } catch (error) {
        Logger.error(
          '[AI Generate] Error during generation',
          error instanceof Error ? error : new Error(String(error)),
        );
        throw new Error(
          `Failed to generate field value: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
    [interactiveFields, documents, getDocument],
  );

  // Load documents from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('joby-documents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        const documentsWithDates = parsed.map(
          (doc: {
            id: string;
            name: string;
            content: string;
            createdAt: string;
          }) => ({
            ...doc,
            createdAt: new Date(doc.createdAt),
          }),
        );
        setDocuments(documentsWithDates);
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

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
    llmStatus,
    setLLMStatus,
    enhancementDetails,
    setEnhancementDetails,
    getEnhancementDetails,
    retryFieldEnhancement,
    documents,
    addDocument,
    removeDocument,
    getDocument,
    generateFieldValue,
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
