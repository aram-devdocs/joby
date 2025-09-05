import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from 'react';
import { useBrowserContext } from '../contexts/browser/BrowserContext';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/card';
import { Badge } from '../atoms/badge';
import { ScrollArea } from '../atoms/scroll-area';
import {
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Loader2,
  WifiOff,
} from 'lucide-react';
import type { FormField, InteractiveFormField } from '../types/form';
import { FormFieldInput } from '../molecules/FormFieldInput';
import { validateField } from '../utils/formValidation';
import { SectionSkeleton } from '../atoms/skeleton';

export interface InteractiveFormPanelProps {
  forms: Array<{ fields: FormField[] }>;
  className?: string;
  onGetLLMStatus?:
    | (() => Promise<{
        status:
          | 'disconnected'
          | 'connecting'
          | 'connected'
          | 'processing'
          | 'error';
        message?: string;
      }>)
    | undefined;
  onGetEnhancementDetails?:
    | ((fieldId: string) => Promise<
        | {
            prompt?: string;
            response?: string;
            confidence?: number;
            fieldType?: string;
          }
        | undefined
      >)
    | undefined;
}

interface FieldGroup {
  section: string;
  fields: InteractiveFormField[];
  isExpanded: boolean;
}

const QuickEditField: React.FC<{
  field: InteractiveFormField;
  onSave: (value: string) => void;
  onCancel: () => void;
  onTabNext: (value: string) => void;
  onTabPrevious: (value: string) => void;
  autoFocus?: boolean;
}> = ({
  field,
  onSave,
  onCancel,
  onTabNext,
  onTabPrevious,
  autoFocus = false,
}) => {
  const [value, setValue] = useState(field.uiValue || field.browserValue || '');
  const isTabbing = useRef(false);

  // Update local value when field value changes
  useEffect(() => {
    setValue(field.uiValue || field.browserValue || '');
  }, [field.uiValue, field.browserValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && field.inputType !== 'textarea') {
      e.preventDefault();
      isTabbing.current = false;
      onSave(value);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      isTabbing.current = true;
      if (e.shiftKey) {
        onTabPrevious(value);
      } else {
        onTabNext(value);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      isTabbing.current = false;
      onCancel();
    }
  };

  const handleBlur = () => {
    // Don't save on blur if we're tabbing to another field
    if (!isTabbing.current) {
      onSave(value);
    }
    isTabbing.current = false;
  };

  return (
    <FormFieldInput
      field={field}
      value={value}
      onChange={setValue}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      autoFocus={autoFocus}
    />
  );
};

const FieldCard: React.FC<{
  field: InteractiveFormField;
  onEdit: () => void;
  onSave: (value: string) => void;
  onTabNext: (value: string) => void;
  onTabPrevious: (value: string) => void;
  onCancel: () => void;
  isActive: boolean;
  enhancement?:
    | {
        prompt?: string;
        response?: string;
        confidence?: number;
        fieldType?: string;
      }
    | undefined;
}> = ({
  field,
  onEdit,
  onSave,
  onTabNext,
  onTabPrevious,
  onCancel,
  isActive,
  enhancement,
}) => {
  const displayLabel =
    field.label || field.placeholder || field.name || 'Field';
  const hasValue = field.uiValue || field.browserValue || field.value;

  // Get field type display name
  const getFieldTypeDisplay = () => {
    switch (field.inputType) {
      case 'email':
        return 'Email';
      case 'tel':
        return 'Phone';
      case 'url':
        return 'URL';
      case 'number':
        return 'Number';
      case 'date':
        return 'Date';
      case 'textarea':
        return 'Text Area';
      case 'select':
        return 'Dropdown';
      case 'radio':
        return 'Radio';
      case 'checkbox':
        return 'Checkbox';
      case 'password':
        return 'Password';
      default:
        return 'Text';
    }
  };

  const fieldType = getFieldTypeDisplay();

  // Validate the current value
  const validation = validateField(field, field.uiValue || '');

  return (
    <div
      onClick={onEdit}
      className={`
        group relative cursor-pointer rounded-lg border p-3 transition-all
        ${
          isActive
            ? 'border-blue-400 bg-blue-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      {/* Field Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900 truncate">
              {displayLabel}
            </span>
            {field.required && (
              <span className="text-red-500 text-xs">Required</span>
            )}
            {enhancement && (
              <div className="group relative inline-block">
                <Sparkles className="w-3 h-3 text-blue-500 cursor-help" />
                <div className="invisible group-hover:visible absolute left-0 top-5 z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                  <div className="font-semibold mb-1">AI Enhancement</div>
                  {enhancement.fieldType && (
                    <div>Type: {enhancement.fieldType}</div>
                  )}
                  {enhancement.confidence && (
                    <div>
                      Confidence: {Math.round(enhancement.confidence * 100)}%
                    </div>
                  )}
                  {enhancement.prompt && (
                    <div className="mt-1 pt-1 border-t border-gray-700">
                      <div className="font-semibold">Analyzed:</div>
                      <div className="text-xs opacity-90">
                        {enhancement.prompt.substring(0, 100)}...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-xs py-0 px-1">
              {fieldType}
            </Badge>
            {!validation.isValid && field.uiValue && (
              <Badge variant="destructive" className="text-xs py-0 px-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                Invalid
              </Badge>
            )}
            {field.name && (
              <span className="text-xs text-gray-500 truncate">
                {field.name}
              </span>
            )}
          </div>
        </div>
        {/* Sync status indicators with better visual feedback */}
        {field.syncStatus === 'syncing' && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-blue-600">Syncing...</span>
          </div>
        )}
        {field.syncStatus === 'synced' && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-green-600">Synced</span>
          </div>
        )}
        {field.syncStatus === 'error' && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-xs text-red-600">Error</span>
          </div>
        )}
        {field.syncStatus === 'idle' &&
          field.uiValue !== field.browserValue &&
          field.uiValue && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="text-xs text-orange-600">Pending</span>
            </div>
          )}
      </div>

      {/* Field Value */}
      {isActive ? (
        <QuickEditField
          field={field}
          onSave={onSave}
          onCancel={onCancel}
          onTabNext={onTabNext}
          onTabPrevious={onTabPrevious}
          autoFocus={true}
        />
      ) : (
        <div className="text-sm">
          {hasValue ? (
            <div>
              <span className="text-gray-700">
                {field.inputType === 'checkbox'
                  ? field.uiValue === 'true' || field.uiValue === 'on'
                    ? '✓ Checked'
                    : '☐ Unchecked'
                  : field.inputType === 'password'
                    ? '••••••••'
                    : field.uiValue || field.browserValue || field.value}
              </span>
              {!validation.isValid && field.uiValue && validation.error && (
                <p className="text-xs text-red-500 mt-1">{validation.error}</p>
              )}
            </div>
          ) : (
            <span className="text-gray-400 italic">Click to enter value</span>
          )}
        </div>
      )}

      {/* Quick hints */}
      {isActive && (
        <div className="mt-1 text-xs text-gray-500">
          Enter: Save • Tab: Next • Shift+Tab: Previous • Esc: Cancel
        </div>
      )}
    </div>
  );
};

export const InteractiveFormPanel: React.FC<InteractiveFormPanelProps> = ({
  forms,
  className = '',
  onGetLLMStatus,
  onGetEnhancementDetails,
}) => {
  const {
    interactiveFields,
    updateFieldValue,
    syncField,
    syncAllFields,
    initializeInteractiveFields,
  } = useBrowserContext();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [llmStatus, setLlmStatus] = useState<{
    status:
      | 'disconnected'
      | 'connecting'
      | 'connected'
      | 'processing'
      | 'error';
    message?: string;
  }>({ status: 'disconnected' });
  const [isProcessingFields, setIsProcessingFields] = useState(false);
  const [fieldEnhancements, setFieldEnhancements] = useState<
    Map<
      string,
      {
        prompt?: string;
        response?: string;
        confidence?: number;
        fieldType?: string;
      }
    >
  >(new Map());

  // Initialize interactive fields when forms change
  useEffect(() => {
    if (forms && forms.length > 0) {
      const allFields = forms.flatMap((form) => form.fields);
      initializeInteractiveFields(allFields);

      // Auto-expand all sections initially
      const sections = new Set(
        allFields.map((f) => f.section || 'Fields').filter(Boolean),
      );
      setExpandedSections(sections);

      // Check if LLM is processing
      setIsProcessingFields(true);

      // Fetch enhancement details for all fields
      if (onGetEnhancementDetails) {
        Promise.all(
          allFields.map(async (field) => {
            const fieldId = field.id || field.name || '';
            const details = await onGetEnhancementDetails(fieldId);
            if (details) {
              return { fieldId, details };
            }
            return null;
          }),
        ).then((results) => {
          const enhancementsMap = new Map();
          results.forEach((result) => {
            if (result) {
              enhancementsMap.set(result.fieldId, result.details);
            }
          });
          setFieldEnhancements(enhancementsMap);
          setIsProcessingFields(false);
        });
      } else {
        setIsProcessingFields(false);
      }
    }
  }, [forms, initializeInteractiveFields, onGetEnhancementDetails]);

  // Poll for LLM status
  useEffect(() => {
    if (onGetLLMStatus) {
      // Initial fetch
      onGetLLMStatus()
        .then(setLlmStatus)
        .catch(() => {
          setLlmStatus({
            status: 'error',
            message: 'Failed to get LLM status',
          });
        });

      // Poll every 3 seconds
      const interval = setInterval(() => {
        onGetLLMStatus()
          .then(setLlmStatus)
          .catch(() => {
            setLlmStatus({
              status: 'error',
              message: 'Failed to get LLM status',
            });
          });
      }, 3000);

      return () => clearInterval(interval);
    }
    // Return empty cleanup if no handler
    return undefined;
  }, [onGetLLMStatus]);

  // Group fields by section from HTML
  const fieldGroups = useMemo(() => {
    const groups = new Map<string, InteractiveFormField[]>();

    Array.from(interactiveFields.values()).forEach((field) => {
      // Use section from HTML, or group as "Fields" if no section detected
      const section = field.section || 'Fields';
      if (!groups.has(section)) {
        groups.set(section, []);
      }
      const groupFields = groups.get(section);
      if (groupFields) {
        groupFields.push(field);
      }
    });

    // Convert to array, maintaining the order they appear in HTML
    const sortedGroups: FieldGroup[] = [];
    groups.forEach((fields, section) => {
      sortedGroups.push({
        section,
        fields,
        isExpanded: expandedSections.has(section),
      });
    });

    return sortedGroups;
  }, [interactiveFields, expandedSections]);

  const handleFieldEdit = useCallback((fieldId: string) => {
    setActiveFieldId(fieldId);
  }, []);

  const handleFieldSave = useCallback(
    async (fieldId: string, value: string) => {
      const field = interactiveFields.get(fieldId);
      if (!field) return;

      // Validate BEFORE saving or syncing
      const validation = validateField(field, value);

      if (!validation.isValid && value) {
        // Update UI value but mark as invalid - DO NOT sync to browser
        const updatedField: Partial<InteractiveFormField> = {
          isValid: false,
          syncStatus: 'error',
        };
        if (validation.error) {
          updatedField.validationError = validation.error;
        }
        updateFieldValue(fieldId, value, updatedField);

        // Keep field active to show error
        // User needs to fix the value before we clear the active state
        return; // Exit early - don't sync invalid data
      } else {
        // Valid value - update and mark as valid
        const updatedField: Partial<InteractiveFormField> = {
          isValid: true,
          syncStatus: 'idle',
        };
        // Note: validationError will be omitted from updatedField,
        // which allows the field to clear its error naturally
        updateFieldValue(fieldId, value, updatedField);

        // Clear active field to show we're done editing
        setActiveFieldId(null);

        // Sync to browser in background - only valid data
        // Small delay to ensure state update is processed
        setTimeout(() => {
          syncField(fieldId).catch(() => {
            // Error is handled in syncField by setting error status
          });
        }, 50);
      }
    },
    [interactiveFields, updateFieldValue, syncField],
  );

  const handleTabNext = useCallback(
    async (fieldId: string, value: string) => {
      const field = interactiveFields.get(fieldId);
      if (!field) return;

      // Validate before saving and moving to next field
      const validation = validateField(field, value);

      if (!validation.isValid && value) {
        // Invalid value - update UI but don't sync
        const updatedField: Partial<InteractiveFormField> = {
          isValid: false,
          syncStatus: 'error',
        };
        if (validation.error) {
          updatedField.validationError = validation.error;
        }
        updateFieldValue(fieldId, value, updatedField);

        // Stay on current field to fix the error
        return; // Don't move to next field if current is invalid
      }

      // Valid value - save and sync
      updateFieldValue(fieldId, value);

      // Start sync in background with small delay (only for valid data)
      setTimeout(() => {
        syncField(fieldId).catch(() => {
          // Error is handled in syncField by setting error status
        });
      }, 50);

      // Move to next field
      const allFields = Array.from(interactiveFields.values());
      const currentIndex = allFields.findIndex(
        (f) => (f.id || f.name) === fieldId,
      );
      if (currentIndex < allFields.length - 1) {
        const nextField = allFields[currentIndex + 1];
        if (nextField) {
          const nextFieldId = nextField.id || nextField.name || '';
          // Use setTimeout to ensure state updates properly
          setTimeout(() => {
            setActiveFieldId(nextFieldId);
          }, 10);
        }
      } else {
        setActiveFieldId(null);
      }
    },
    [interactiveFields, updateFieldValue, syncField],
  );

  const handleTabPrevious = useCallback(
    async (fieldId: string, value: string) => {
      const field = interactiveFields.get(fieldId);
      if (!field) return;

      // Validate before saving and moving to previous field
      const validation = validateField(field, value);

      if (!validation.isValid && value) {
        // Invalid value - update UI but don't sync
        const updatedField: Partial<InteractiveFormField> = {
          isValid: false,
          syncStatus: 'error',
        };
        if (validation.error) {
          updatedField.validationError = validation.error;
        }
        updateFieldValue(fieldId, value, updatedField);

        // Stay on current field to fix the error
        return; // Don't move to previous field if current is invalid
      }

      // Valid value - save and sync
      updateFieldValue(fieldId, value);

      // Start sync in background with small delay (only for valid data)
      setTimeout(() => {
        syncField(fieldId).catch(() => {
          // Error is handled in syncField by setting error status
        });
      }, 50);

      // Move to previous field
      const allFields = Array.from(interactiveFields.values());
      const currentIndex = allFields.findIndex(
        (f) => (f.id || f.name) === fieldId,
      );
      if (currentIndex > 0) {
        const prevField = allFields[currentIndex - 1];
        if (prevField) {
          const prevFieldId = prevField.id || prevField.name || '';
          // Use setTimeout to ensure state updates properly
          setTimeout(() => {
            setActiveFieldId(prevFieldId);
          }, 10);
        }
      } else {
        setActiveFieldId(null);
      }
    },
    [interactiveFields, updateFieldValue, syncField],
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const totalFields = Array.from(interactiveFields.values()).length;
  const filledFields = Array.from(interactiveFields.values()).filter(
    (f) => f.uiValue || f.browserValue || f.value,
  ).length;
  const unsyncedFields = Array.from(interactiveFields.values()).filter(
    (f) => f.uiValue && f.uiValue !== f.browserValue,
  ).length;

  // Show skeleton loading state when no forms detected yet but LLM is processing
  if (
    (!forms || forms.length === 0) &&
    (llmStatus.status === 'processing' || llmStatus.status === 'connecting')
  ) {
    return (
      <Card className={`flex flex-col h-full overflow-hidden ${className}`}>
        <CardHeader className="flex-shrink-0 pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Form Fields</CardTitle>
              <Badge
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                {llmStatus.status === 'connecting'
                  ? 'Connecting...'
                  : 'Detecting fields...'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full w-full">
            <div className="p-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">
                    AI is analyzing the page for form fields...
                  </span>
                </div>
              </div>
              <SectionSkeleton fieldCount={4} />
              <SectionSkeleton fieldCount={3} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Form Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No forms detected. Navigate to a page with forms to begin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col h-full overflow-hidden ${className}`}>
      <CardHeader className="flex-shrink-0 pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Form Fields</CardTitle>
            {/* LLM Status Indicator */}
            {llmStatus.status === 'connected' && (
              <Badge
                variant="default"
                className="text-xs flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                AI Active
              </Badge>
            )}
            {llmStatus.status === 'processing' && (
              <Badge
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Analyzing...
              </Badge>
            )}
            {llmStatus.status === 'connecting' && (
              <Badge
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Connecting...
              </Badge>
            )}
            {llmStatus.status === 'disconnected' && (
              <Badge
                variant="outline"
                className="text-xs flex items-center gap-1"
              >
                <WifiOff className="w-3 h-3" />
                AI Offline
              </Badge>
            )}
            {llmStatus.status === 'error' && (
              <Badge
                variant="destructive"
                className="text-xs flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                Error
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {filledFields}/{totalFields} filled
            </Badge>
            {unsyncedFields > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unsyncedFields} unsynced
              </Badge>
            )}
            {unsyncedFields > 0 && (
              <button
                onClick={async (e) => {
                  // Disable button during sync
                  const button = e.currentTarget;
                  button.disabled = true;
                  const originalText = button.textContent;
                  button.textContent = 'Syncing...';

                  try {
                    await syncAllFields();
                  } finally {
                    button.disabled = false;
                    button.textContent = originalText;
                  }
                }}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Sync All
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full w-full">
          <div className="p-4 space-y-4">
            {/* Show processing state when fields are detected but AI is still enhancing */}
            {isProcessingFields && fieldGroups.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">
                    AI is enhancing field detection and analysis...
                  </span>
                </div>
              </div>
            )}

            {/* Show field-level skeletons while fields are being processed but not yet shown */}
            {isProcessingFields &&
              fieldGroups.length === 0 &&
              forms &&
              forms.length > 0 && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-700">
                        AI is processing {forms.flatMap((f) => f.fields).length}{' '}
                        detected fields...
                      </span>
                    </div>
                  </div>
                  <SectionSkeleton
                    fieldCount={Math.min(
                      forms.flatMap((f) => f.fields).length,
                      6,
                    )}
                  />
                  {forms.flatMap((f) => f.fields).length > 6 && (
                    <SectionSkeleton
                      fieldCount={Math.min(
                        forms.flatMap((f) => f.fields).length - 6,
                        4,
                      )}
                    />
                  )}
                </>
              )}
            {fieldGroups.map((group) => (
              <div key={group.section} className="space-y-2">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(group.section)}
                  className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {group.isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="font-medium text-sm text-gray-700">
                      {group.section}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {group.fields.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {group.fields.filter((f) => f.uiValue).length > 0 && (
                      <span className="text-xs text-green-600">
                        {group.fields.filter((f) => f.uiValue).length} filled
                      </span>
                    )}
                  </div>
                </button>

                {/* Section Fields */}
                {group.isExpanded && (
                  <div className="space-y-2 pl-6">
                    {group.fields.map((field) => {
                      const fieldId = field.id || field.name || '';
                      return (
                        <FieldCard
                          key={fieldId}
                          field={field}
                          onEdit={() => handleFieldEdit(fieldId)}
                          onSave={(value) => handleFieldSave(fieldId, value)}
                          onTabNext={(value) => handleTabNext(fieldId, value)}
                          onTabPrevious={(value) =>
                            handleTabPrevious(fieldId, value)
                          }
                          onCancel={() => setActiveFieldId(null)}
                          isActive={activeFieldId === fieldId}
                          enhancement={fieldEnhancements.get(fieldId)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
