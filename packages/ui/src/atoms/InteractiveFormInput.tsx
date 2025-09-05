import React, { useState, useEffect, useCallback } from 'react';
import { Input } from './input';
import type { FormField } from '../types/form';

export interface InteractiveFormInputProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
  disabled?: boolean;
  className?: string;
}

export const InteractiveFormInput: React.FC<InteractiveFormInputProps> = ({
  field,
  value,
  onChange,
  onFocus,
  onBlur,
  syncStatus = 'idle',
  disabled = false,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value);
    }
  }, [value, isFocused]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const getInputType = () => {
    switch (field.type) {
      case 'email':
      case 'tel':
      case 'url':
      case 'password':
      case 'number':
      case 'date':
      case 'time':
      case 'datetime-local':
        return field.type;
      default:
        return 'text';
    }
  };

  const getSyncIndicatorColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'border-yellow-500';
      case 'synced':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      default:
        return '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        type={getInputType()}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
        className={`pr-8 transition-colors ${getSyncIndicatorColor()}`}
        name={field.name}
        id={field.id}
        aria-label={field.label || field.name}
        aria-required={field.required}
        data-field-id={field.id}
        data-field-name={field.name}
      />
      {syncStatus !== 'idle' && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {syncStatus === 'syncing' && (
            <svg
              className="h-4 w-4 animate-spin text-yellow-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {syncStatus === 'synced' && (
            <svg
              className="h-4 w-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {syncStatus === 'error' && (
            <svg
              className="h-4 w-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};
