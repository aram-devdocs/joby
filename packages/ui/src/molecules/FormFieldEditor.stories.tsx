import type { Meta, StoryObj } from '@storybook/react';
import { FormFieldEditor } from './FormFieldEditor';
import type { InteractiveFormField } from '../types/form';

const meta = {
  title: 'Molecules/FormFieldEditor',
  component: FormFieldEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An editor component for individual form fields with sync capabilities and enhancement display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onValueChange: { action: 'value-changed' },
    onEditToggle: { action: 'edit-toggled' },
    onSync: { action: 'synced' },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormFieldEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseField: InteractiveFormField = {
  id: 'email-field',
  name: 'email',
  type: 'email',
  label: 'Email Address',
  placeholder: 'user@example.com',
  browserValue: 'john@example.com',
  uiValue: 'john@example.com',
  required: true,
  disabled: false,
  syncStatus: 'synced',
  isEditing: false,
};

export const Default: Story = {
  args: {
    field: baseField,
  },
};

export const Editing: Story = {
  args: {
    field: {
      ...baseField,
      isEditing: true,
      uiValue: 'john.doe@example.com',
    },
  },
};

export const WithUnsyncedChanges: Story = {
  args: {
    field: {
      ...baseField,
      isEditing: true,
      browserValue: 'old@example.com',
      uiValue: 'new@example.com',
      syncStatus: 'pending',
    },
  },
};

export const Syncing: Story = {
  args: {
    field: {
      ...baseField,
      syncStatus: 'syncing',
      isEditing: true,
    },
  },
};

export const WithError: Story = {
  args: {
    field: {
      ...baseField,
      syncStatus: 'error',
      error: 'Failed to sync field value',
      isEditing: true,
    },
  },
};

export const WithEnhancement: Story = {
  args: {
    field: {
      ...baseField,
      enhancement: {
        fieldType: 'email',
        label: 'Work Email Address',
        validation: {
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          required: true,
          message: 'Please enter a valid email address',
        },
        confidence: 0.95,
        source: 'llm',
      },
    },
  },
};

export const LowConfidenceEnhancement: Story = {
  args: {
    field: {
      ...baseField,
      enhancement: {
        fieldType: 'text',
        label: 'Input Field',
        confidence: 0.3,
        source: 'pattern',
      },
    },
  },
};

export const PasswordField: Story = {
  args: {
    field: {
      id: 'password-field',
      name: 'password',
      type: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      browserValue: '',
      uiValue: '••••••••',
      required: true,
      disabled: false,
      syncStatus: 'pending',
      isEditing: true,
    },
  },
};

export const OptionalField: Story = {
  args: {
    field: {
      ...baseField,
      required: false,
      label: 'Optional Note',
      type: 'text',
    },
  },
};

export const DisabledField: Story = {
  args: {
    field: {
      ...baseField,
      disabled: true,
      browserValue: 'readonly@example.com',
      uiValue: 'readonly@example.com',
    },
  },
};

export const NoLabel: Story = {
  args: {
    field: {
      id: 'field-1',
      name: 'field_1',
      type: 'text',
      browserValue: '',
      uiValue: '',
      required: false,
      disabled: false,
      syncStatus: 'synced',
      isEditing: false,
    },
  },
};

export const ComplexField: Story = {
  args: {
    field: {
      id: 'phone-field',
      name: 'phone_number',
      type: 'tel',
      inputType: 'phone',
      label: 'Contact Phone',
      placeholder: '(555) 123-4567',
      browserValue: '555-123-4567',
      uiValue: '555-987-6543',
      required: true,
      disabled: false,
      syncStatus: 'pending',
      isEditing: true,
      enhancement: {
        fieldType: 'phone',
        label: 'Mobile Phone Number',
        validation: {
          pattern: '^\\+?[1-9]\\d{1,14}$',
          required: true,
          message: 'Please enter a valid phone number',
        },
        confidence: 0.85,
        source: 'llm',
      },
    },
  },
};
