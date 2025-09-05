import React, { useState, useEffect, useRef } from 'react';
import type { InteractiveFormField, FormSelectOption } from '../types/form';
import {
  validateField,
  formatPhoneNumber,
  stripNonNumeric,
  getHTMLInputType,
  getValidationProps,
} from '../utils/formValidation';

export interface FormFieldInputProps {
  field: InteractiveFormField;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onBlur: () => void;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Select dropdown component
 */
const SelectField: React.FC<{
  field: InteractiveFormField;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onBlur: () => void;
  autoFocus?: boolean;
  className?: string;
}> = ({ field, value, onChange, onKeyDown, onBlur, autoFocus, className }) => {
  const ref = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      setTimeout(() => ref.current?.focus(), 50);
    }
  }, [autoFocus]);

  const options = field.options || [];
  const isSelectOptions = options.length > 0 && typeof options[0] === 'object';

  return (
    <select
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      className={className}
      multiple={field.multiple}
      required={field.required}
    >
      {!field.required && <option value="">-- Select --</option>}
      {isSelectOptions
        ? (options as FormSelectOption[]).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        : (options as string[]).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
    </select>
  );
};

/**
 * Radio button group component
 */
const RadioGroup: React.FC<{
  field: InteractiveFormField;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  className?: string;
}> = ({ field, value, onChange, onKeyDown, className }) => {
  const options = field.options || [];
  const isSelectOptions = options.length > 0 && typeof options[0] === 'object';

  return (
    <div className={`space-y-2 ${className}`} onKeyDown={onKeyDown}>
      {isSelectOptions
        ? (options as FormSelectOption[]).map((opt) => (
            <label
              key={opt.value}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name={field.name}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => onChange(e.target.value)}
                required={field.required}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))
        : (options as string[]).map((opt) => (
            <label
              key={opt}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name={field.name}
                value={opt}
                checked={value === opt}
                onChange={(e) => onChange(e.target.value)}
                required={field.required}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
    </div>
  );
};

/**
 * Checkbox component
 */
const CheckboxField: React.FC<{
  field: InteractiveFormField;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onBlur: () => void;
  autoFocus?: boolean;
  className?: string;
}> = ({ field, value, onChange, onKeyDown, onBlur, autoFocus }) => {
  const ref = useRef<HTMLInputElement>(null);
  const isChecked = value === 'true' || value === 'on' || value === '1';

  useEffect(() => {
    if (autoFocus && ref.current) {
      setTimeout(() => ref.current?.focus(), 50);
    }
  }, [autoFocus]);

  const label = field.label || field.placeholder || field.name || 'Checkbox';

  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        ref={ref}
        type="checkbox"
        checked={isChecked}
        onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        required={field.required}
        className="w-4 h-4 text-blue-600 rounded"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
};

/**
 * Text input with validation
 */
const TextInput: React.FC<{
  field: InteractiveFormField;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onBlur: () => void;
  autoFocus?: boolean;
  className?: string;
}> = ({ field, value, onChange, onKeyDown, onBlur, autoFocus, className }) => {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [localValue, setLocalValue] = useState(value);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref.current) {
      setTimeout(() => {
        ref.current?.focus();
        ref.current?.select();
      }, 50);
    }
  }, [autoFocus]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    let newValue = e.target.value;

    // Special handling for phone numbers - only allow numeric input
    if (field.inputType === 'tel') {
      // First strip all non-numeric characters
      const digitsOnly = stripNonNumeric(newValue);
      // Then format for display
      newValue = formatPhoneNumber(digitsOnly);
    }

    // For email, convert to lowercase for consistency
    if (field.inputType === 'email') {
      newValue = newValue.toLowerCase();
    }

    setLocalValue(newValue);
    onChange(newValue);
    setShowError(false);
  };

  const handleBlur = () => {
    const validation = validateField(field, localValue);
    if (!validation.isValid && localValue) {
      // Only show error if there's a value
      setShowError(true);
    }
    onBlur();
  };

  const validationProps = getValidationProps(field);
  const inputType = getHTMLInputType(field);
  const validation = showError
    ? validateField(field, localValue)
    : { isValid: true };

  if (field.inputType === 'textarea') {
    return (
      <div className="w-full">
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={localValue}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          onBlur={handleBlur}
          className={`${className} ${!validation.isValid ? 'border-red-500' : ''}`}
          placeholder={field.placeholder || 'Enter value...'}
          {...validationProps}
          rows={3}
        />
        {!validation.isValid && validation.error && (
          <p className="text-xs text-red-500 mt-1">{validation.error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        type={inputType}
        value={localValue}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onBlur={handleBlur}
        className={`${className} ${!validation.isValid ? 'border-red-500' : ''}`}
        placeholder={field.placeholder || 'Enter value...'}
        {...validationProps}
      />
      {!validation.isValid && validation.error && (
        <p className="text-xs text-red-500 mt-1">{validation.error}</p>
      )}
    </div>
  );
};

/**
 * Main FormFieldInput component that renders the appropriate input type
 */
export const FormFieldInput: React.FC<FormFieldInputProps> = ({
  field,
  value,
  onChange,
  onKeyDown,
  onBlur,
  autoFocus = false,
  className = 'w-full px-2 py-1.5 text-sm border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white',
}) => {
  // Render select dropdown
  if (field.inputType === 'select') {
    return (
      <SelectField
        field={field}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        autoFocus={autoFocus}
        className={className}
      />
    );
  }

  // Render radio button group
  if (
    field.inputType === 'radio' &&
    field.options &&
    field.options.length > 0
  ) {
    return (
      <RadioGroup
        field={field}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className=""
      />
    );
  }

  // Render checkbox
  if (field.inputType === 'checkbox') {
    return (
      <CheckboxField
        field={field}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        autoFocus={autoFocus}
        className={className}
      />
    );
  }

  // Check if this should be a range/color input
  if (field.type === 'range' || field.type === 'color') {
    // For range and color, use simpler inline rendering
    return (
      <input
        type={field.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        className={className}
        {...getValidationProps(field)}
        autoFocus={autoFocus}
      />
    );
  }

  // Render text input (including email, tel, url, number, date, etc.)
  return (
    <TextInput
      field={field}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      autoFocus={autoFocus}
      className={className}
    />
  );
};
