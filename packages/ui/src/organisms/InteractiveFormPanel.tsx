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
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { FormField, InteractiveFormField } from '../types/form';

export interface InteractiveFormPanelProps {
  forms: Array<{ fields: FormField[] }>;
  className?: string;
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
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const isTabbing = useRef(false);

  // Update local value when field value changes
  useEffect(() => {
    setValue(field.uiValue || field.browserValue || '');
  }, [field.uiValue, field.browserValue]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Small delay to ensure the element is properly rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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

  const InputComponent = field.type === 'textarea' ? 'textarea' : 'input';

  return (
    <InputComponent
      ref={
        inputRef as React.RefObject<HTMLInputElement> &
          React.RefObject<HTMLTextAreaElement>
      }
      type={field.type !== 'textarea' ? field.type : undefined}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="w-full px-2 py-1.5 text-sm border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      placeholder={field.placeholder || 'Enter value...'}
    />
  );
};

const FieldCard: React.FC<{
  field: InteractiveFormField;
  onEdit: () => void;
  onSave: (value: string) => void;
  onTabNext: (value: string) => void;
  onTabPrevious: (value: string) => void;
  isActive: boolean;
}> = ({ field, onEdit, onSave, onTabNext, onTabPrevious, isActive }) => {
  const displayLabel =
    field.label || field.placeholder || field.name || 'Field';
  const hasValue = field.uiValue || field.browserValue || field.value;
  const fieldType =
    field.type === 'email'
      ? 'Email'
      : field.type === 'tel'
        ? 'Phone'
        : field.type === 'url'
          ? 'URL'
          : field.type === 'number'
            ? 'Number'
            : field.type === 'date'
              ? 'Date'
              : field.type === 'textarea'
                ? 'Text Area'
                : 'Text';

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
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-xs py-0 px-1">
              {fieldType}
            </Badge>
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
          onCancel={() => {
            // Reset to original value when cancelled
          }}
          onTabNext={onTabNext}
          onTabPrevious={onTabPrevious}
          autoFocus={true}
        />
      ) : (
        <div className="text-sm">
          {hasValue ? (
            <span className="text-gray-700">
              {field.uiValue || field.browserValue || field.value}
            </span>
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
    }
  }, [forms, initializeInteractiveFields]);

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
      // Update the value immediately for instant feedback
      updateFieldValue(fieldId, value);

      // Clear active field to show we're done editing
      setActiveFieldId(null);

      // Sync to browser in background - this will show visual feedback
      // Small delay to ensure state update is processed
      setTimeout(() => {
        syncField(fieldId).catch(() => {
          // Error is handled in syncField by setting error status
        });
      }, 50);
    },
    [updateFieldValue, syncField],
  );

  const handleTabNext = useCallback(
    async (fieldId: string, value: string) => {
      // Save the current field value
      updateFieldValue(fieldId, value);

      // Start sync in background with small delay
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
      // Save the current field value
      updateFieldValue(fieldId, value);

      // Start sync in background with small delay
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
          <CardTitle className="text-lg">Form Fields</CardTitle>
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
                          isActive={activeFieldId === fieldId}
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
