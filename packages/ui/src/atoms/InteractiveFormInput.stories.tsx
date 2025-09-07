import type { Meta, StoryObj } from '@storybook/react';
import { InteractiveFormInput } from './InteractiveFormInput';
import { useState } from 'react';
import type { ComponentProps } from 'react';

const meta = {
  title: 'Atoms/InteractiveFormInput',
  component: InteractiveFormInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An interactive input component with sync status indicators and field type support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    syncStatus: {
      control: 'select',
      options: ['idle', 'syncing', 'synced', 'error'],
      description: 'Current synchronization status',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    onChange: { action: 'changed' },
    onFocus: { action: 'focused' },
    onBlur: { action: 'blurred' },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InteractiveFormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper for controlled component
const InputWithState = (args: ComponentProps<typeof InteractiveFormInput>) => {
  const [value, setValue] = useState(args.value || '');
  return <InteractiveFormInput {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: InputWithState,
  args: {
    field: {
      id: 'text-field',
      name: 'textField',
      type: 'text',
      placeholder: 'Enter text...',
    },
    value: '',
    syncStatus: 'idle',
  },
};

export const EmailField: Story = {
  render: InputWithState,
  args: {
    field: {
      id: 'email',
      name: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'user@example.com',
      required: true,
    },
    value: '',
    syncStatus: 'idle',
  },
};

export const PasswordField: Story = {
  render: InputWithState,
  args: {
    field: {
      id: 'password',
      name: 'password',
      type: 'password',
      label: 'Password',
      placeholder: 'Enter password',
      required: true,
    },
    value: '',
    syncStatus: 'idle',
  },
};

export const Syncing: Story = {
  render: InputWithState,
  args: {
    field: {
      id: 'username',
      name: 'username',
      type: 'text',
      placeholder: 'Username',
    },
    value: 'johndoe',
    syncStatus: 'syncing',
  },
};

export const Synced: Story = {
  render: InputWithState,
  args: {
    field: {
      id: 'phone',
      name: 'phone',
      type: 'tel',
      placeholder: '(555) 123-4567',
    },
    value: '555-123-4567',
    syncStatus: 'synced',
  },
};

export const Error: Story = {
  render: InputWithState,
  args: {
    field: {
      id: 'url',
      name: 'website',
      type: 'url',
      placeholder: 'https://example.com',
    },
    value: 'invalid-url',
    syncStatus: 'error',
  },
};

export const Disabled: Story = {
  render: InputWithState,
  args: {
    field: {
      id: 'readonly',
      name: 'readonly',
      type: 'text',
      placeholder: 'Cannot edit',
    },
    value: 'Read-only value',
    syncStatus: 'idle',
    disabled: true,
  },
};

export const RequiredField: Story = {
  render: InputWithState,
  args: {
    field: {
      id: 'required-field',
      name: 'requiredField',
      type: 'text',
      label: 'Required Field',
      placeholder: 'This field is required',
      required: true,
    },
    value: '',
    syncStatus: 'idle',
  },
};

export const NumberField: Story = {
  render: InputWithState,
  args: {
    field: {
      id: 'age',
      name: 'age',
      type: 'number',
      label: 'Age',
      placeholder: 'Enter your age',
    },
    value: '',
    syncStatus: 'idle',
  },
};

export const DateField: Story = {
  render: InputWithState,
  args: {
    field: {
      id: 'birthdate',
      name: 'birthdate',
      type: 'date',
      label: 'Birth Date',
    },
    value: '',
    syncStatus: 'idle',
  },
};

export const AllFieldTypes: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, string>>({
      text: 'Sample text',
      email: 'user@example.com',
      password: 'secret123',
      tel: '555-0123',
      url: 'https://example.com',
      number: '42',
      date: '2024-01-01',
      time: '14:30',
      datetime: '2024-01-01T14:30',
    });

    const handleChange = (fieldName: string) => (value: string) => {
      setValues((prev) => ({ ...prev, [fieldName]: value }));
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <InteractiveFormInput
          field={{ id: 'text', name: 'text', type: 'text', label: 'Text' }}
          value={values.text}
          onChange={handleChange('text')}
          syncStatus="idle"
        />
        <InteractiveFormInput
          field={{ id: 'email', name: 'email', type: 'email', label: 'Email' }}
          value={values.email}
          onChange={handleChange('email')}
          syncStatus="synced"
        />
        <InteractiveFormInput
          field={{
            id: 'password',
            name: 'password',
            type: 'password',
            label: 'Password',
          }}
          value={values.password}
          onChange={handleChange('password')}
          syncStatus="idle"
        />
        <InteractiveFormInput
          field={{ id: 'tel', name: 'tel', type: 'tel', label: 'Phone' }}
          value={values.tel}
          onChange={handleChange('tel')}
          syncStatus="syncing"
        />
        <InteractiveFormInput
          field={{ id: 'url', name: 'url', type: 'url', label: 'URL' }}
          value={values.url}
          onChange={handleChange('url')}
          syncStatus="error"
        />
        <InteractiveFormInput
          field={{
            id: 'number',
            name: 'number',
            type: 'number',
            label: 'Number',
          }}
          value={values.number}
          onChange={handleChange('number')}
          syncStatus="idle"
        />
        <InteractiveFormInput
          field={{ id: 'date', name: 'date', type: 'date', label: 'Date' }}
          value={values.date}
          onChange={handleChange('date')}
          syncStatus="synced"
        />
        <InteractiveFormInput
          field={{ id: 'time', name: 'time', type: 'time', label: 'Time' }}
          value={values.time}
          onChange={handleChange('time')}
          syncStatus="idle"
        />
        <InteractiveFormInput
          field={{
            id: 'datetime',
            name: 'datetime',
            type: 'datetime-local',
            label: 'Date & Time',
          }}
          value={values.datetime}
          onChange={handleChange('datetime')}
          syncStatus="idle"
        />
      </div>
    );
  },
};
