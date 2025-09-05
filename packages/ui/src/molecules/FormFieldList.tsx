import React from 'react';
import { FormFieldEditor } from './FormFieldEditor';
import type { InteractiveFormField } from '../types/form';

export interface FormFieldListProps {
  fields: InteractiveFormField[];
  onValueChange: (fieldId: string, value: string) => void;
  onEditToggle: (fieldId: string) => void;
  onSync: (fieldId: string) => void;
  onSyncAll?: (() => void) | undefined;
  className?: string;
}

export const FormFieldList: React.FC<FormFieldListProps> = ({
  fields,
  onValueChange,
  onEditToggle,
  onSync,
  onSyncAll,
  className = '',
}) => {
  const hasUnsyncedChanges = fields.some(
    (field) => field.isEditing && field.uiValue !== field.browserValue,
  );

  const editingCount = fields.filter((f) => f.isEditing).length;
  const syncingCount = fields.filter((f) => f.syncStatus === 'syncing').length;

  if (fields.length === 0) {
    return (
      <div
        className={`rounded-lg border bg-gray-50 p-8 text-center ${className}`}
      >
        <p className="text-gray-500">No form fields detected</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {(editingCount > 0 || syncingCount > 0) && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
          <div className="text-sm">
            {editingCount > 0 && (
              <span className="text-blue-700">
                {editingCount} field{editingCount !== 1 ? 's' : ''} being edited
              </span>
            )}
            {editingCount > 0 && syncingCount > 0 && (
              <span className="mx-2 text-blue-500">•</span>
            )}
            {syncingCount > 0 && (
              <span className="text-yellow-700">
                {syncingCount} field{syncingCount !== 1 ? 's' : ''} syncing
              </span>
            )}
          </div>
          {hasUnsyncedChanges && onSyncAll && (
            <button
              onClick={onSyncAll}
              className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sync All Changes
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const key = field.id || field.name || `field-${index}`;
          return (
            <FormFieldEditor
              key={key}
              field={field}
              onValueChange={onValueChange}
              onEditToggle={onEditToggle}
              onSync={onSync}
            />
          );
        })}
      </div>
    </div>
  );
};
