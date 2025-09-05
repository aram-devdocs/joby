import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterControls } from './FilterControls';
import type { StreamFilter } from '../types/terminal';

const meta = {
  title: 'Molecules/FilterControls',
  component: FilterControls,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Filter controls panel with search, type filtering, source filtering, and options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    filters: {
      control: 'object',
      description: 'Current filter state',
    },
    availableSources: {
      control: 'object',
      description: 'Array of available source names',
    },
    collapsed: {
      control: 'boolean',
      description: 'Whether the filter panel is collapsed',
    },
    onFiltersChange: {
      action: 'filters-changed',
      description: 'Callback when filters change',
    },
    onToggleCollapse: {
      action: 'collapse-toggled',
      description: 'Callback when collapse state changes',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterControls>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultFilters: StreamFilter = {
  search: '',
  types: [],
  sources: [],
  dateRange: {},
  showOnlyErrors: false,
};

const activeFilters: StreamFilter = {
  search: 'login',
  types: ['request', 'error'],
  sources: ['auth-service', 'user-service'],
  dateRange: {},
  showOnlyErrors: false,
};

const availableSources = [
  'api-gateway',
  'auth-service',
  'user-service',
  'database',
  'cache-service',
  'analytics',
];

export const Default: Story = {
  args: {
    filters: defaultFilters,
    availableSources,
  },
};

export const Collapsed: Story = {
  args: {
    filters: activeFilters,
    availableSources,
    collapsed: true,
  },
};

export const WithActiveFilters: Story = {
  args: {
    filters: activeFilters,
    availableSources,
  },
};

export const ErrorsOnly: Story = {
  args: {
    filters: {
      ...defaultFilters,
      showOnlyErrors: true,
      types: ['error'],
    },
    availableSources,
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [filters, setFilters] = useState<StreamFilter>(defaultFilters);
    const [collapsed, setCollapsed] = useState(false);

    const handleFiltersChange = (newFilters: Partial<StreamFilter>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    return (
      <div
        style={{
          width: '400px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
        }}
      >
        <FilterControls
          filters={filters}
          availableSources={availableSources}
          onFiltersChange={handleFiltersChange}
          collapsed={collapsed}
          onToggleCollapse={setCollapsed}
        />
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <h4 style={{ margin: '0 0 8px 0' }}>Current Filters:</h4>
          <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};

export const ManySourcesDemo: Story = {
  args: {
    filters: {
      ...defaultFilters,
      sources: ['api-gateway', 'user-service', 'analytics'],
    },
    availableSources: [
      'api-gateway',
      'auth-service',
      'user-service',
      'payment-service',
      'notification-service',
      'database-primary',
      'database-read-replica',
      'cache-redis',
      'cache-memcached',
      'analytics',
      'logging-service',
      'monitoring',
      'message-queue',
      'file-storage',
      'cdn',
    ],
  },
};

export const WithSearchQuery: Story = {
  args: {
    filters: {
      ...defaultFilters,
      search: 'user authentication failed',
    },
    availableSources,
  },
};

export const AllFiltersActive: Story = {
  args: {
    filters: {
      search: 'payment processing',
      types: ['request', 'response', 'error'],
      sources: ['payment-service', 'database', 'cache-service'],
      dateRange: {
        start: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
        end: Date.now(),
      },
      showOnlyErrors: false,
    },
    availableSources: [
      'payment-service',
      'user-service',
      'database',
      'cache-service',
      'notification-service',
    ],
  },
};

export const CollapsedWithActiveFilters: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(true);
    const filters = {
      search: 'error',
      types: ['error'] as const,
      sources: ['api-gateway', 'database'],
      dateRange: {},
      showOnlyErrors: true,
    };

    return (
      <div style={{ width: '400px' }}>
        <div
          style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '6px',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
            Notice the filter count indicator when collapsed with active
            filters.
          </p>
        </div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <FilterControls
            filters={filters}
            availableSources={availableSources}
            onFiltersChange={() => {
              // Storybook demo - no-op
            }}
            collapsed={collapsed}
            onToggleCollapse={setCollapsed}
          />
        </div>
      </div>
    );
  },
};

export const EmptySources: Story = {
  args: {
    filters: defaultFilters,
    availableSources: [],
  },
};

export const DarkTheme: Story = {
  args: {
    filters: activeFilters,
    availableSources,
  },
  decorators: [
    (Story) => (
      <div
        className="dark"
        style={{ backgroundColor: '#1a1a1a', padding: '2rem' }}
      >
        <div
          style={{
            width: '400px',
            border: '1px solid #374151',
            borderRadius: '8px',
          }}
        >
          <Story />
        </div>
      </div>
    ),
  ],
};
