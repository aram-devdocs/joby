import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '../atoms/badge';
import { Button } from '../atoms/button';
import { AlertCircle, Sparkles, Wand2, Loader2 } from 'lucide-react';
import type { InteractiveFormField } from '../types/form';
import { FormFieldInput } from './FormFieldInput';
import { validateField } from '../utils/formValidation';
import { useBrowserContext } from '../contexts/browser/BrowserContext';

interface QuickEditFieldProps {
  field: InteractiveFormField;
  onSave: (value: string) => void;
  onCancel: () => void;
  onTabNext: (value: string) => void;
  onTabPrevious: (value: string) => void;
  autoFocus?: boolean;
}

const QuickEditField: React.FC<QuickEditFieldProps> = ({
  field,
  onSave,
  onCancel,
  onTabNext,
  onTabPrevious,
  autoFocus = false,
}) => {
  const [value, setValue] = useState(field.uiValue || field.browserValue || '');
  const isTabbing = useRef(false);

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

export interface FieldCardProps {
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
  className?: string;
}

export const FieldCard: React.FC<FieldCardProps> = ({
  field,
  onEdit,
  onSave,
  onTabNext,
  onTabPrevious,
  onCancel,
  isActive,
  enhancement,
  className = '',
}) => {
  const { documents, generateFieldValue } = useBrowserContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const displayLabel =
    field.label || field.placeholder || field.name || 'Field';
  const hasValue = field.uiValue || field.browserValue || field.value;

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
  const validation = validateField(field, field.uiValue || '');

  const handleAIGenerate = async () => {
    if (!documents.length || isGenerating) return;

    setIsGenerating(true);
    try {
      const fieldId = field.id || field.name || '';
      const generatedValue = await generateFieldValue(fieldId);
      if (generatedValue) {
        onSave(generatedValue);
      }
    } catch {
      // Silent error handling - errors will be visible through loading states
    } finally {
      setIsGenerating(false);
    }
  };

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
        ${className}
      `}
    >
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
            {documents.length > 0 && !isActive && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAIGenerate();
                }}
                size="sm"
                variant="ghost"
                disabled={isGenerating}
                className="ml-2 h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Wand2 className="w-3 h-3 mr-1" />
                )}
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
            )}
          </div>
        </div>
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

      {isActive && (
        <div className="mt-1 text-xs text-gray-500">
          Enter: Save • Tab: Next • Shift+Tab: Previous • Esc: Cancel
        </div>
      )}
    </div>
  );
};
