import React, { useState } from 'react';
import { FieldCard } from './FieldCard';
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
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
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
    <div className={`${className}`}>
      {(editingCount > 0 || syncingCount > 0 || hasUnsyncedChanges) && (
        <div className="sticky top-0 z-10 mb-3 rounded-lg border border-blue-200 bg-blue-50 p-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
              {editingCount > 0 && (
                <span className="flex items-center gap-1 text-blue-700">
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  {editingCount} editing
                </span>
              )}
              {syncingCount > 0 && (
                <span className="flex items-center gap-1 text-yellow-700">
                  <span className="h-2 w-2 rounded-full bg-yellow-600 animate-pulse"></span>
                  {syncingCount} syncing
                </span>
              )}
              {hasUnsyncedChanges && !syncingCount && (
                <span className="flex items-center gap-1 text-orange-700">
                  <span className="h-2 w-2 rounded-full bg-orange-600"></span>
                  Changes pending
                </span>
              )}
            </div>
            {hasUnsyncedChanges && onSyncAll && (
              <button
                onClick={onSyncAll}
                className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Sync All
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => {
          const fieldId = field.id || field.name || `field-${index}`;
          return (
            <FieldCard
              key={fieldId}
              field={field}
              onEdit={() => {
                setActiveFieldId(fieldId);
                onEditToggle(fieldId);
              }}
              onSave={(value) => {
                onValueChange(fieldId, value);
                setActiveFieldId(null);
                onSync(fieldId);
              }}
              onTabNext={(value) => {
                onValueChange(fieldId, value);
                onSync(fieldId);
                const currentIndex = fields.findIndex(
                  (f) =>
                    (f.id || f.name || `field-${fields.indexOf(f)}`) ===
                    fieldId,
                );
                if (currentIndex < fields.length - 1) {
                  const nextField = fields[currentIndex + 1];
                  if (nextField) {
                    const nextFieldId =
                      nextField.id ||
                      nextField.name ||
                      `field-${currentIndex + 1}`;
                    setActiveFieldId(nextFieldId);
                    onEditToggle(nextFieldId);
                  }
                } else {
                  setActiveFieldId(null);
                }
              }}
              onTabPrevious={(value) => {
                onValueChange(fieldId, value);
                onSync(fieldId);
                const currentIndex = fields.findIndex(
                  (f) =>
                    (f.id || f.name || `field-${fields.indexOf(f)}`) ===
                    fieldId,
                );
                if (currentIndex > 0) {
                  const prevField = fields[currentIndex - 1];
                  if (prevField) {
                    const prevFieldId =
                      prevField.id ||
                      prevField.name ||
                      `field-${currentIndex - 1}`;
                    setActiveFieldId(prevFieldId);
                    onEditToggle(prevFieldId);
                  }
                } else {
                  setActiveFieldId(null);
                }
              }}
              onCancel={() => {
                setActiveFieldId(null);
                onEditToggle(fieldId);
              }}
              isActive={activeFieldId === fieldId}
            />
          );
        })}
      </div>
    </div>
  );
};
