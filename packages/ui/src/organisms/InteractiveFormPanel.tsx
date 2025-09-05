import React, { useEffect, useMemo } from 'react';
import { FormFieldList } from '../molecules/FormFieldList';
import { useBrowserContext } from '../contexts/browser/BrowserContext';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/card';
import { Badge } from '../atoms/badge';
import { ScrollArea } from '../atoms/scroll-area';

import type { FormField } from '../types/form';

export interface InteractiveFormPanelProps {
  forms: Array<{ fields: FormField[] }>;
  className?: string;
}

export const InteractiveFormPanel: React.FC<InteractiveFormPanelProps> = ({
  forms,
  className = '',
}) => {
  const {
    interactiveFields,
    setFieldEditing,
    updateFieldValue,
    syncField,
    syncAllFields,
    initializeInteractiveFields,
  } = useBrowserContext();

  // Initialize interactive fields when forms change
  useEffect(() => {
    if (forms && forms.length > 0) {
      const allFields = forms.flatMap((form) => form.fields);
      initializeInteractiveFields(allFields);
    }
  }, [forms, initializeInteractiveFields]);

  // Convert Map to array for rendering
  const fieldsArray = useMemo(() => {
    return Array.from(interactiveFields.values());
  }, [interactiveFields]);

  const handleValueChange = (fieldId: string, value: string) => {
    updateFieldValue(fieldId, value);
  };

  const handleEditToggle = (fieldId: string) => {
    const field = interactiveFields.get(fieldId);
    if (field) {
      setFieldEditing(fieldId, !field.isEditing);
    }
  };

  const handleSync = (fieldId: string) => {
    void syncField(fieldId);
  };

  const handleSyncAll = () => {
    void syncAllFields();
  };

  const totalFields = fieldsArray.length;
  const editingFields = fieldsArray.filter((f) => f.isEditing).length;
  const unsyncedFields = fieldsArray.filter(
    (f) => f.isEditing && f.uiValue !== f.browserValue,
  ).length;

  if (!forms || forms.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Form Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No forms detected on this page. Navigate to a page with forms to
            begin analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Interactive Form Fields</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{totalFields} fields</Badge>
            {editingFields > 0 && (
              <Badge variant="default">{editingFields} editing</Badge>
            )}
            {unsyncedFields > 0 && (
              <Badge variant="destructive">{unsyncedFields} unsynced</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            <FormFieldList
              fields={fieldsArray}
              onValueChange={handleValueChange}
              onEditToggle={handleEditToggle}
              onSync={handleSync}
              onSyncAll={unsyncedFields > 0 ? handleSyncAll : undefined}
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
