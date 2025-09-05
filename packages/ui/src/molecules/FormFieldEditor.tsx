import React, { useCallback } from 'react';
import { InteractiveFormInput } from '../atoms/InteractiveFormInput';
import { FieldStatusIndicator } from '../atoms/FieldStatusIndicator';
import { Button } from '../atoms/button';
import type { InteractiveFormField } from '../types/form';

export interface FormFieldEditorProps {
  field: InteractiveFormField;
  onValueChange: (fieldId: string, value: string) => void;
  onEditToggle: (fieldId: string) => void;
  onSync: (fieldId: string) => void;
  className?: string;
}

export const FormFieldEditor: React.FC<FormFieldEditorProps> = ({
  field,
  onValueChange,
  onEditToggle,
  onSync,
  className = '',
}) => {
  const fieldId = field.id || field.name || '';

  const handleValueChange = useCallback(
    (value: string) => {
      onValueChange(fieldId, value);
    },
    [fieldId, onValueChange],
  );

  const handleEditToggle = useCallback(() => {
    onEditToggle(fieldId);
  }, [fieldId, onEditToggle]);

  const handleSync = useCallback(() => {
    onSync(fieldId);
  }, [fieldId, onSync]);

  const getFieldLabel = () => {
    if (field.label) return field.label;
    if (field.placeholder) return field.placeholder;
    if (field.name) return field.name;
    return 'Field';
  };

  const hasUnsyncedChanges =
    field.isEditing && field.uiValue !== field.browserValue;

  return (
    <div
      className={`group rounded-lg border bg-white p-3 transition-shadow hover:shadow-md ${
        field.isEditing ? 'border-blue-300 shadow-md' : 'border-gray-200'
      } ${className}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 truncate">
            {getFieldLabel()}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {field.type && <span>Type: {field.type}</span>}
            {field.name && (
              <>
                {field.type && <span>•</span>}
                <span className="truncate">Name: {field.name}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <FieldStatusIndicator status={field.syncStatus} size="sm" />
          <Button
            variant={field.isEditing ? 'secondary' : 'ghost'}
            size="sm"
            onClick={handleEditToggle}
            className="h-7 px-2 text-xs"
          >
            {field.isEditing ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>

      {field.isEditing ? (
        <div className="space-y-2">
          <InteractiveFormInput
            field={field}
            value={field.uiValue}
            onChange={handleValueChange}
            syncStatus={field.syncStatus}
          />
          {hasUnsyncedChanges && (
            <div className="flex items-center justify-between rounded bg-yellow-50 px-2 py-1">
              <span className="text-xs text-yellow-700">Unsynced changes</span>
              <Button
                variant="default"
                size="sm"
                onClick={handleSync}
                disabled={field.syncStatus === 'syncing'}
                className="h-6 px-2 text-xs"
              >
                Sync
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded border border-gray-100 bg-gray-50 px-2 py-1.5 text-sm text-gray-700">
          {field.browserValue || field.value || (
            <span className="italic text-gray-400">Empty</span>
          )}
        </div>
      )}
    </div>
  );
};
