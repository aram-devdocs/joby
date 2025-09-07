import type { Meta, StoryObj } from '@storybook/react';
import { FieldStatusIndicator } from './FieldStatusIndicator';

const meta = {
  title: 'Atoms/FieldStatusIndicator',
  component: FieldStatusIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A status indicator component for displaying field synchronization states with optional messages.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['idle', 'syncing', 'synced', 'error'],
      description: 'Current status of the field',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the indicator',
    },
    message: {
      control: 'text',
      description: 'Optional status message',
    },
  },
} satisfies Meta<typeof FieldStatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'idle',
    size: 'md',
  },
};

export const Idle: Story = {
  args: {
    status: 'idle',
    size: 'md',
  },
};

export const Syncing: Story = {
  args: {
    status: 'syncing',
    size: 'md',
  },
};

export const Synced: Story = {
  args: {
    status: 'synced',
    size: 'md',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    size: 'md',
  },
};

export const WithMessage: Story = {
  args: {
    status: 'syncing',
    message: 'Updating field value...',
    size: 'md',
  },
};

export const SmallSize: Story = {
  args: {
    status: 'synced',
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    status: 'error',
    size: 'lg',
  },
};

export const CustomMessages: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <FieldStatusIndicator
        status="idle"
        message="Waiting for changes"
        size="md"
      />
      <FieldStatusIndicator
        status="syncing"
        message="Saving to database..."
        size="md"
      />
      <FieldStatusIndicator
        status="synced"
        message="Successfully saved!"
        size="md"
      />
      <FieldStatusIndicator
        status="error"
        message="Failed to save changes"
        size="md"
      />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ width: '60px', fontSize: '12px' }}>Small:</span>
        <FieldStatusIndicator status="idle" size="sm" />
        <FieldStatusIndicator status="syncing" size="sm" />
        <FieldStatusIndicator status="synced" size="sm" />
        <FieldStatusIndicator status="error" size="sm" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ width: '60px', fontSize: '12px' }}>Medium:</span>
        <FieldStatusIndicator status="idle" size="md" />
        <FieldStatusIndicator status="syncing" size="md" />
        <FieldStatusIndicator status="synced" size="md" />
        <FieldStatusIndicator status="error" size="md" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ width: '60px', fontSize: '12px' }}>Large:</span>
        <FieldStatusIndicator status="idle" size="lg" />
        <FieldStatusIndicator status="syncing" size="lg" />
        <FieldStatusIndicator status="synced" size="lg" />
        <FieldStatusIndicator status="error" size="lg" />
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <FieldStatusIndicator status="idle" size="lg" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Idle</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <FieldStatusIndicator status="syncing" size="lg" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Syncing</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <FieldStatusIndicator status="synced" size="lg" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Synced</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <FieldStatusIndicator status="error" size="lg" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Error</p>
      </div>
    </div>
  ),
};

export const RealTimeSimulation: Story = {
  render: () => {
    const [status, setStatus] = React.useState<
      'idle' | 'syncing' | 'synced' | 'error'
    >('idle');
    const [message, setMessage] = React.useState('Ready');

    const simulateSync = () => {
      setStatus('syncing');
      setMessage('Saving changes...');

      setTimeout(() => {
        const success = Math.random() > 0.3;
        if (success) {
          setStatus('synced');
          setMessage('Changes saved successfully!');
          setTimeout(() => {
            setStatus('idle');
            setMessage('Ready');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Failed to save changes');
          setTimeout(() => {
            setStatus('idle');
            setMessage('Ready');
          }, 3000);
        }
      }, 2000);
    };

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <FieldStatusIndicator status={status} message={message} size="lg" />
        <button
          onClick={simulateSync}
          disabled={status === 'syncing'}
          style={{
            padding: '8px 16px',
            background: status === 'syncing' ? '#e2e8f0' : '#3b82f6',
            color: status === 'syncing' ? '#64748b' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: status === 'syncing' ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'syncing' ? 'Syncing...' : 'Simulate Sync'}
        </button>
      </div>
    );
  },
};

// Add React import for the simulation story
import React from 'react';
