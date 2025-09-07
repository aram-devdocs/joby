import type { Meta, StoryObj } from '@storybook/react';
import { FormFieldList } from './FormFieldList';
import type { InteractiveFormField } from '../types/form';

const meta = {
  title: 'Molecules/FormFieldList',
  component: FormFieldList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A list component for managing and displaying interactive form fields with sync capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onValueChange: { action: 'value-changed' },
    onEditToggle: { action: 'edit-toggled' },
    onSync: { action: 'field-synced' },
    onSyncAll: { action: 'sync-all' },
  },
} satisfies Meta<typeof FormFieldList>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleFields: InteractiveFormField[] = [
  {
    id: 'email-field',
    name: 'email',
    type: 'email',
    label: 'Email Address',
    placeholder: 'user@example.com',
    browserValue: 'john.doe@example.com',
    uiValue: 'john.doe@example.com',
    required: true,
    disabled: false,
    syncStatus: 'synced',
    isEditing: false,
  },
  {
    id: 'password-field',
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Enter password',
    browserValue: '',
    uiValue: '',
    required: true,
    disabled: false,
    syncStatus: 'pending',
    isEditing: false,
  },
  {
    id: 'username-field',
    name: 'username',
    type: 'text',
    label: 'Username',
    placeholder: 'johndoe',
    browserValue: 'johndoe',
    uiValue: 'johndoe_updated',
    required: false,
    disabled: false,
    syncStatus: 'syncing',
    isEditing: true,
  },
];

export const Default: Story = {
  args: {
    fields: sampleFields,
  },
};

export const EmptyState: Story = {
  args: {
    fields: [],
  },
};

export const SingleField: Story = {
  args: {
    fields: [sampleFields[0]],
  },
};

export const WithEditingFields: Story = {
  args: {
    fields: [
      ...sampleFields,
      {
        id: 'phone-field',
        name: 'phone',
        type: 'tel',
        label: 'Phone Number',
        browserValue: '555-1234',
        uiValue: '555-5678',
        required: false,
        disabled: false,
        syncStatus: 'pending',
        isEditing: true,
      },
    ],
  },
};

export const AllSyncing: Story = {
  args: {
    fields: sampleFields.map((field) => ({
      ...field,
      syncStatus: 'syncing',
      isEditing: true,
    })),
  },
};

export const WithErrors: Story = {
  args: {
    fields: [
      {
        id: 'error-field',
        name: 'errorField',
        type: 'text',
        label: 'Field with Error',
        browserValue: 'old value',
        uiValue: 'new value',
        required: true,
        disabled: false,
        syncStatus: 'error',
        isEditing: true,
        error: 'Failed to sync field',
      },
      ...sampleFields,
    ],
  },
};

export const ManyFields: Story = {
  args: {
    fields: Array.from({ length: 20 }, (_, i) => ({
      id: `field-${i}`,
      name: `field_${i}`,
      type: i % 3 === 0 ? 'email' : i % 2 === 0 ? 'password' : 'text',
      label: `Field ${i + 1}`,
      placeholder: `Enter value for field ${i + 1}`,
      browserValue: `value_${i}`,
      uiValue: i % 4 === 0 ? `updated_value_${i}` : `value_${i}`,
      required: i % 2 === 0,
      disabled: false,
      syncStatus: i % 4 === 0 ? 'syncing' : i % 3 === 0 ? 'pending' : 'synced',
      isEditing: i % 4 === 0,
    })),
  },
};
