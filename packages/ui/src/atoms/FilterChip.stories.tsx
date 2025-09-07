import type { Meta, StoryObj } from '@storybook/react';
import { FilterChip } from './FilterChip';

const meta = {
  title: 'Atoms/FilterChip',
  component: FilterChip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A chip component for displaying active filters with removal functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label prefix for the chip',
    },
    value: {
      control: 'text',
      description: 'Value to display',
    },
    variant: {
      control: 'select',
      options: ['default', 'type', 'source', 'error'],
      description: 'Visual variant of the chip',
    },
    onRemove: {
      action: 'removed',
      description: 'Callback when chip is removed',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Filter',
    value: 'example',
  },
};

export const WithoutLabel: Story = {
  args: {
    value: 'no label',
  },
};

export const Removable: Story = {
  args: {
    label: 'Search',
    value: 'user query',
    onRemove: undefined, // Will use action from argTypes
  },
};

export const TypeVariant: Story = {
  args: {
    label: 'Type',
    value: 'request',
    variant: 'type',
    onRemove: undefined,
  },
};

export const SourceVariant: Story = {
  args: {
    label: 'Source',
    value: 'api-server',
    variant: 'source',
    onRemove: undefined,
  },
};

export const ErrorVariant: Story = {
  args: {
    label: 'Status',
    value: 'error',
    variant: 'error',
    onRemove: undefined,
  },
};

export const LongValue: Story = {
  args: {
    label: 'Search',
    value: 'this is a very long search query that might overflow',
    onRemove: undefined,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'flex-start',
      }}
    >
      <FilterChip label="Default" value="filter" variant="default" />
      <FilterChip label="Type" value="request" variant="type" />
      <FilterChip label="Source" value="api-server" variant="source" />
      <FilterChip label="Status" value="error" variant="error" />
    </div>
  ),
};

export const WithRemoveHandlers: Story = {
  render: () => {
    const handleRemove = (value: string) => {
      // In a real app, this would update state
      window.dispatchEvent(
        new CustomEvent('filter-removed', { detail: { value } }),
      );
    };

    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'flex-start',
        }}
      >
        <FilterChip
          label="Search"
          value="user query"
          variant="default"
          onRemove={handleRemove}
        />
        <FilterChip
          label="Type"
          value="response"
          variant="type"
          onRemove={handleRemove}
        />
        <FilterChip
          label="Source"
          value="database"
          variant="source"
          onRemove={handleRemove}
        />
        <FilterChip
          label="Status"
          value="timeout"
          variant="error"
          onRemove={handleRemove}
        />
      </div>
    );
  },
};

export const ActiveFilters: Story = {
  render: () => {
    const handleRemove = (value: string) => {
      window.dispatchEvent(
        new CustomEvent('filter-removed', { detail: { value } }),
      );
    };

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'flex-start',
        }}
      >
        <h3>Active Filters Example</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <FilterChip
            label="Search"
            value="login"
            variant="default"
            onRemove={handleRemove}
          />
          <FilterChip
            label="Type"
            value="request"
            variant="type"
            onRemove={handleRemove}
          />
          <FilterChip
            label="Type"
            value="error"
            variant="type"
            onRemove={handleRemove}
          />
          <FilterChip
            label="Source"
            value="auth-service"
            variant="source"
            onRemove={handleRemove}
          />
          <FilterChip
            label="Source"
            value="user-service"
            variant="source"
            onRemove={handleRemove}
          />
          <FilterChip
            label="Option"
            value="Errors only"
            variant="error"
            onRemove={handleRemove}
          />
        </div>
      </div>
    );
  },
};

export const DarkTheme: Story = {
  args: {
    label: 'Type',
    value: 'request',
    variant: 'type',
    onRemove: undefined,
  },
  decorators: [
    (Story) => (
      <div
        className="dark"
        style={{ padding: '2rem', backgroundColor: '#1a1a1a' }}
      >
        <Story />
      </div>
    ),
  ],
};
