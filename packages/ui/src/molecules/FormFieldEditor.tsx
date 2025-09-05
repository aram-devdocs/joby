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
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-2 flex items-start justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            {getFieldLabel()}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          {field.type && (
            <span className="text-xs text-gray-500">Type: {field.type}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <FieldStatusIndicator status={field.syncStatus} size="sm" />
          <Button
            variant={field.isEditing ? 'secondary' : 'default'}
            size="sm"
            onClick={handleEditToggle}
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
            <div className="flex items-center justify-between text-xs">
              <span className="text-yellow-600">Unsynced changes</span>
              <Button
                variant="default"
                size="sm"
                onClick={handleSync}
                disabled={field.syncStatus === 'syncing'}
              >
                Sync Now
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-2">
          <div className="rounded border bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {field.browserValue || field.value || (
              <span className="italic text-gray-400">Empty</span>
            )}
          </div>
        </div>
      )}

      {field.name && (
        <div className="mt-2 text-xs text-gray-500">
          Name: {field.name}
          {field.id && field.id !== field.name && (
            <span className="ml-2">ID: {field.id}</span>
          )}
        </div>
      )}
    </div>
  );
};
