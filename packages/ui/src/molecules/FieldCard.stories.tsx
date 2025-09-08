import type { Meta, StoryObj } from '@storybook/react';
import { FieldCard } from './FieldCard';
import { useState } from 'react';
import type { InteractiveFormField } from '../types/form';

const meta = {
  title: 'Molecules/FieldCard',
  component: FieldCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A smart field card component that provides inline editing capabilities with keyboard navigation, validation, and sync status indicators. Perfect for form field management with enhanced UX.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isActive: {
      control: 'boolean',
      description: 'Whether the field is in active editing mode',
    },
    enhancement: {
      control: 'object',
      description: 'AI enhancement data for the field',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '400px', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FieldCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base field data for stories
const baseField: InteractiveFormField = {
  id: 'example-field',
  name: 'example-field',
  type: 'text',
  inputType: 'text',
  label: 'Full Name',
  placeholder: 'Enter your full name',
  required: true,
  uiValue: '',
  browserValue: '',
  syncStatus: 'idle',
  isEditing: false,
};

// Interactive wrapper component for controlled stories
const FieldCardWithState = (args: {
  field: InteractiveFormField;
  isActive?: boolean;
  enhancement?: {
    prompt?: string;
    response?: string;
    confidence?: number;
    fieldType?: string;
  };
}) => {
  const [isActive, setIsActive] = useState(args.isActive || false);
  const [field, setField] = useState<InteractiveFormField>(args.field);

  const handleEdit = () => {
    setIsActive(true);
    setField((prev) => ({ ...prev, isEditing: true }));
  };

  const handleSave = (value: string) => {
    setIsActive(false);
    setField((prev) => ({
      ...prev,
      uiValue: value,
      isEditing: false,
      syncStatus: 'synced',
    }));
  };

  const handleTabNext = (value: string) => {
    setField((prev) => ({ ...prev, uiValue: value }));
    // Log tab navigation for Storybook demo purposes
    // eslint-disable-next-line no-console
    console.log('Tab to next field with value:', value);
  };

  const handleTabPrevious = (value: string) => {
    setField((prev) => ({ ...prev, uiValue: value }));
    // Log tab navigation for Storybook demo purposes
    // eslint-disable-next-line no-console
    console.log('Tab to previous field with value:', value);
  };

  const handleCancel = () => {
    setIsActive(false);
    setField((prev) => ({ ...prev, isEditing: false }));
  };

  return (
    <FieldCard
      {...args}
      field={field}
      isActive={isActive}
      onEdit={handleEdit}
      onSave={handleSave}
      onTabNext={handleTabNext}
      onTabPrevious={handleTabPrevious}
      onCancel={handleCancel}
    />
  );
};

// Default story - most common use case
export const Default: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      uiValue: 'John Doe',
    },
  },
};

// Empty field
export const Empty: Story = {
  render: FieldCardWithState,
  args: {
    field: baseField,
  },
};

// Active editing state
export const ActiveEditing: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      uiValue: 'Jane Smith',
      isEditing: true,
    },
    isActive: true,
  },
};

// Different field types
export const EmailField: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      id: 'email-field',
      name: 'email',
      type: 'email',
      inputType: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      uiValue: 'user@example.com',
    },
  },
};

export const PhoneField: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      id: 'phone-field',
      name: 'phone',
      type: 'tel',
      inputType: 'tel',
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      uiValue: '(555) 123-4567',
    },
  },
};

export const TextAreaField: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      id: 'description-field',
      name: 'description',
      type: 'text',
      inputType: 'textarea',
      label: 'Description',
      placeholder: 'Enter a description',
      uiValue:
        'This is a longer text area field that can handle multiple lines of input.',
      required: false,
    },
  },
};

export const CheckboxField: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      id: 'agree-field',
      name: 'agree',
      type: 'checkbox',
      inputType: 'checkbox',
      label: 'I agree to the terms',
      placeholder: '',
      uiValue: 'true',
      required: false,
    },
  },
};

export const PasswordField: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      id: 'password-field',
      name: 'password',
      type: 'password',
      inputType: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      uiValue: 'secretpassword123',
    },
  },
};

// Sync status variants
export const SyncingField: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      uiValue: 'Syncing data...',
      syncStatus: 'syncing',
    },
  },
};

export const SyncedField: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      uiValue: 'Successfully synced',
      syncStatus: 'synced',
    },
  },
};

export const ErrorField: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      uiValue: 'invalid-email',
      syncStatus: 'error',
    },
  },
};

export const PendingField: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      uiValue: 'Changed value',
      browserValue: 'Original value',
      syncStatus: 'idle',
    },
  },
};

// AI Enhancement
export const WithAIEnhancement: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      uiValue: 'John Doe',
    },
    enhancement: {
      fieldType: 'PersonName',
      confidence: 0.95,
      prompt:
        'Detected a full name field based on the label "Full Name" and common naming patterns in form fields.',
      response: "This field accepts a person's full name with high confidence.",
    },
  },
};

export const WithLowConfidenceEnhancement: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      label: 'Field 1',
      uiValue: 'Some value',
    },
    enhancement: {
      fieldType: 'Text',
      confidence: 0.3,
      prompt: 'Ambiguous field with generic label "Field 1".',
      response: 'Low confidence generic text field.',
    },
  },
};

// Required vs Optional
export const OptionalField: Story = {
  render: FieldCardWithState,
  args: {
    field: {
      ...baseField,
      label: 'Middle Name',
      placeholder: 'Enter your middle name (optional)',
      required: false,
    },
  },
};

// Show all field types together
export const AllFieldTypes: Story = {
  render: () => {
    const fieldTypes = [
      {
        ...baseField,
        id: 'text-field',
        label: 'Text Field',
        inputType: 'text' as const,
        uiValue: 'John Doe',
      },
      {
        ...baseField,
        id: 'email-field',
        label: 'Email Field',
        inputType: 'email' as const,
        uiValue: 'john@example.com',
      },
      {
        ...baseField,
        id: 'phone-field',
        label: 'Phone Field',
        inputType: 'tel' as const,
        uiValue: '(555) 123-4567',
      },
      {
        ...baseField,
        id: 'checkbox-field',
        label: 'Checkbox Field',
        inputType: 'checkbox' as const,
        uiValue: 'true',
        required: false,
      },
      {
        ...baseField,
        id: 'textarea-field',
        label: 'Text Area',
        inputType: 'textarea' as const,
        uiValue: 'This is a longer text field.',
        required: false,
      },
    ];

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '500px',
        }}
      >
        {fieldTypes.map((field) => (
          <FieldCardWithState key={field.id} field={field} />
        ))}
      </div>
    );
  },
};

// Show all sync statuses
export const AllSyncStatuses: Story = {
  render: () => {
    const syncStatuses = [
      { status: 'idle', label: 'Idle' },
      { status: 'syncing', label: 'Syncing' },
      { status: 'synced', label: 'Synced' },
      { status: 'error', label: 'Error' },
    ] as const;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '500px',
        }}
      >
        {syncStatuses.map(({ status, label }) => (
          <FieldCardWithState
            key={status}
            field={{
              ...baseField,
              id: `${status}-field`,
              label: `${label} Field`,
              uiValue: `Field with ${label.toLowerCase()} status`,
              syncStatus: status,
            }}
          />
        ))}
      </div>
    );
  },
};
