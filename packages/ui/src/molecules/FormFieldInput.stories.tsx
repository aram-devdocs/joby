import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FormFieldInput } from './FormFieldInput';
import type { InteractiveFormField } from '../types/form';

const meta = {
  title: 'Molecules/FormFieldInput',
  component: FormFieldInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The input component used within InteractiveFormPanel for inline field editing. Features blue border when active, validation, and support for various field types including text, email, phone, select, checkbox, radio, and textarea.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
    onKeyDown: { action: 'keyDown' },
    onBlur: { action: 'blurred' },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '400px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormFieldInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper for stateful behavior
const FormFieldInputWithState = (
  args: Omit<
    React.ComponentProps<typeof FormFieldInput>,
    'onChange' | 'onKeyDown' | 'onBlur'
  >,
) => {
  const [value, setValue] = useState(args.value);
  const [message, setMessage] = useState<string>('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key;
    if (key === 'Enter' && !e.shiftKey) {
      setMessage('Enter pressed - would save');
    } else if (key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      setMessage('Shift+Tab pressed - would go to previous field');
    } else if (key === 'Tab') {
      e.preventDefault();
      setMessage('Tab pressed - would go to next field');
    } else if (key === 'Escape') {
      setMessage('Escape pressed - would cancel');
    }
  };

  const handleBlur = () => {
    setMessage('Field blurred - would save');
  };

  return (
    <div>
      <FormFieldInput
        {...args}
        value={value}
        onChange={setValue}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      {message && (
        <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          {message}
        </p>
      )}
      <p style={{ marginTop: '10px', fontSize: '11px', color: '#999' }}>
        Enter: Save • Tab: Next • Shift+Tab: Previous • Esc: Cancel
      </p>
    </div>
  );
};

// Basic text field
const textField: InteractiveFormField = {
  id: 'firstName',
  name: 'firstName',
  type: 'text',
  inputType: 'text',
  label: 'First Name',
  placeholder: 'John',
  required: true,
  syncStatus: 'idle',
};

export const Default: Story = {
  render: FormFieldInputWithState,
  args: {
    field: textField,
    value: '',
    autoFocus: true,
  },
};

export const WithValue: Story = {
  render: FormFieldInputWithState,
  args: {
    field: textField,
    value: 'John Doe',
    autoFocus: true,
  },
};

export const EmailField: Story = {
  render: FormFieldInputWithState,
  args: {
    field: {
      id: 'email',
      name: 'email',
      type: 'email',
      inputType: 'email',
      label: 'Email',
      placeholder: 'user@example.com',
      required: true,
      pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
      syncStatus: 'idle',
    },
    value: '',
    autoFocus: true,
  },
};

export const PhoneField: Story = {
  render: FormFieldInputWithState,
  args: {
    field: {
      id: 'phone',
      name: 'phone',
      type: 'tel',
      inputType: 'tel',
      label: 'Phone',
      placeholder: '(555) 123-4567',
      required: false,
      pattern: '^\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$',
      syncStatus: 'idle',
    },
    value: '',
    autoFocus: true,
  },
};

export const SelectField: Story = {
  render: FormFieldInputWithState,
  args: {
    field: {
      id: 'state',
      name: 'state',
      type: 'select',
      inputType: 'select',
      label: 'State',
      options: ['NY', 'CA', 'TX', 'FL', 'IL'],
      required: true,
      syncStatus: 'idle',
    },
    value: '',
    autoFocus: true,
  },
};

export const CheckboxField: Story = {
  render: FormFieldInputWithState,
  args: {
    field: {
      id: 'newsletter',
      name: 'newsletter',
      type: 'checkbox',
      inputType: 'checkbox',
      label: 'Subscribe to newsletter',
      required: false,
      syncStatus: 'idle',
    },
    value: 'false',
    autoFocus: true,
  },
};

export const TextareaField: Story = {
  render: FormFieldInputWithState,
  args: {
    field: {
      id: 'comments',
      name: 'comments',
      type: 'textarea',
      inputType: 'textarea',
      label: 'Comments',
      placeholder: 'Enter your comments...',
      required: false,
      minLength: 10,
      maxLength: 500,
      syncStatus: 'idle',
    },
    value: '',
    autoFocus: true,
  },
};

export const RadioField: Story = {
  render: FormFieldInputWithState,
  args: {
    field: {
      id: 'gender',
      name: 'gender',
      type: 'radio',
      inputType: 'radio',
      label: 'Gender',
      options: ['Male', 'Female', 'Other'],
      required: true,
      syncStatus: 'idle',
    },
    value: '',
    autoFocus: false,
  },
};

export const NumberField: Story = {
  render: FormFieldInputWithState,
  args: {
    field: {
      id: 'age',
      name: 'age',
      type: 'number',
      inputType: 'number',
      label: 'Age',
      placeholder: '25',
      min: '18',
      max: '120',
      required: true,
      syncStatus: 'idle',
    },
    value: '',
    autoFocus: true,
  },
};

export const DateField: Story = {
  render: FormFieldInputWithState,
  args: {
    field: {
      id: 'birthdate',
      name: 'birthdate',
      type: 'date',
      inputType: 'date',
      label: 'Date of Birth',
      required: true,
      syncStatus: 'idle',
    },
    value: '',
    autoFocus: true,
  },
};

export const URLField: Story = {
  render: FormFieldInputWithState,
  args: {
    field: {
      id: 'website',
      name: 'website',
      type: 'url',
      inputType: 'url',
      label: 'Website',
      placeholder: 'https://example.com',
      pattern: '^https://.*',
      required: false,
      syncStatus: 'idle',
    },
    value: '',
    autoFocus: true,
  },
};

export const WithValidationError: Story = {
  render: FormFieldInputWithState,
  args: {
    field: {
      id: 'email',
      name: 'email',
      type: 'email',
      inputType: 'email',
      label: 'Email',
      placeholder: 'user@example.com',
      required: true,
      pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
      syncStatus: 'idle',
    },
    value: 'invalid-email',
    autoFocus: true,
  },
};

// Show multiple field types in a grid
export const AllFieldTypes: Story = {
  render: () => {
    const fields: InteractiveFormField[] = [
      {
        id: 'text',
        name: 'text',
        type: 'text',
        inputType: 'text',
        label: 'Text Field',
        placeholder: 'Enter text',
        syncStatus: 'idle',
      },
      {
        id: 'email',
        name: 'email',
        type: 'email',
        inputType: 'email',
        label: 'Email Field',
        placeholder: 'user@example.com',
        syncStatus: 'idle',
      },
      {
        id: 'tel',
        name: 'tel',
        type: 'tel',
        inputType: 'tel',
        label: 'Phone Field',
        placeholder: '(555) 123-4567',
        syncStatus: 'idle',
      },
      {
        id: 'number',
        name: 'number',
        type: 'number',
        inputType: 'number',
        label: 'Number Field',
        placeholder: '100',
        syncStatus: 'idle',
      },
      {
        id: 'date',
        name: 'date',
        type: 'date',
        inputType: 'date',
        label: 'Date Field',
        syncStatus: 'idle',
      },
      {
        id: 'url',
        name: 'url',
        type: 'url',
        inputType: 'url',
        label: 'URL Field',
        placeholder: 'https://example.com',
        syncStatus: 'idle',
      },
    ];

    const [values, setValues] = useState<Record<string, string>>({});

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
        }}
      >
        {fields.map((field) => (
          <div
            key={field.id}
            style={{
              padding: '10px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {field.label}
            </label>
            <FormFieldInput
              field={field}
              value={values[field.id || ''] || ''}
              onChange={(value) =>
                setValues((prev) => ({ ...prev, [field.id || '']: value }))
              }
              onKeyDown={() => {
                // No-op for display purposes
              }}
              onBlur={() => {
                // No-op for display purposes
              }}
            />
          </div>
        ))}
      </div>
    );
  },
};
