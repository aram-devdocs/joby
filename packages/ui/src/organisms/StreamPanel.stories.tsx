import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { StreamPanel } from './StreamPanel';
import type {
  StreamContext,
  StreamFilter,
  StreamEvent,
} from '../types/terminal';

const meta = {
  title: 'Organisms/StreamPanel',
  component: StreamPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete stream monitoring panel with header, filters, and event viewer. Handles event display, filtering, and export functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    context: {
      control: 'object',
      description: 'Stream context with events and connection state',
    },
    filters: {
      control: 'object',
      description: 'Active filters for the stream',
    },
    onFiltersChange: {
      action: 'filters-changed',
      description: 'Callback when filters are modified',
    },
    onEventToggle: {
      action: 'event-toggled',
      description: 'Callback when event is expanded/collapsed',
    },
  },
} satisfies Meta<typeof StreamPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const createMockEvents = (
  count: number,
  includeErrors = true,
): StreamEvent[] => {
  const types = includeErrors
    ? (['request', 'response', 'error', 'info'] as const)
    : (['request', 'response', 'info'] as const);
  const sources = [
    'api-gateway',
    'user-service',
    'database',
    'cache-service',
    'analytics',
  ];
  const baseTime = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];

    return {
      id: `event-${i}`,
      timestamp: baseTime - (count - i) * 1000 * (Math.random() * 5 + 1),
      type,
      source,
      data: {
        url:
          type === 'info'
            ? undefined
            : `https://api.example.com/v1/${Math.random() > 0.5 ? 'users' : 'orders'}/${Math.floor(Math.random() * 1000)}`,
        method:
          type === 'request'
            ? Math.random() > 0.5
              ? 'GET'
              : 'POST'
            : undefined,
        status:
          type === 'response'
            ? Math.random() > 0.9
              ? 500
              : Math.random() > 0.8
                ? 404
                : 200
            : type === 'error'
              ? 500
              : undefined,
        message:
          type === 'info'
            ? `System notification ${i + 1}`
            : type === 'error'
              ? `Error: ${['Connection timeout', 'Invalid request', 'Server overload'][Math.floor(Math.random() * 3)]}`
              : undefined,
        error:
          type === 'error'
            ? `Detailed error message for event ${i + 1}`
            : undefined,
        headers:
          type !== 'info'
            ? {
                'content-type': 'application/json',
                'x-request-id': `req-${Math.random().toString(36).substr(2, 9)}`,
                'x-response-time':
                  type === 'response'
                    ? `${Math.floor(Math.random() * 200 + 50)}ms`
                    : undefined,
              }
            : undefined,
        body:
          type !== 'info' && Math.random() > 0.4
            ? {
                data: `Sample data for event ${i + 1}`,
                timestamp: new Date(
                  baseTime - (count - i) * 1000,
                ).toISOString(),
                metadata: {
                  processed: true,
                  version: '1.0',
                  userId: Math.floor(Math.random() * 1000),
                },
                ...(type === 'error' && {
                  stack: `Error stack trace line 1\n  at function1 (file.js:10:5)\n  at function2 (file.js:20:10)`,
                }),
              }
            : undefined,
        payload:
          type === 'info'
            ? {
                level: 'info',
                service: source,
                details: `Information payload for ${source}`,
              }
            : undefined,
      },
    };
  });
};

const mockContext: StreamContext = {
  sessionId: 'session-12345678',
  events: createMockEvents(25),
  isConnected: true,
  lastActivity: Date.now() - 30000,
};

const defaultFilters: StreamFilter = {
  search: '',
  types: [],
  sources: [],
  dateRange: {},
  showOnlyErrors: false,
};

export const Default: Story = {
  args: {
    context: mockContext,
    filters: defaultFilters,
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export const InteractiveDemo: Story = {
  render: () => {
    const [context, setContext] = useState<StreamContext>(mockContext);
    const [filters, setFilters] = useState<StreamFilter>(defaultFilters);

    const handleFiltersChange = (newFilters: Partial<StreamFilter>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    // Simulate live events
    React.useEffect(() => {
      if (!context.isConnected) return;

      const interval = setInterval(() => {
        const newEvent: StreamEvent = {
          id: `live-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          type:
            Math.random() > 0.85
              ? 'error'
              : Math.random() > 0.6
                ? 'response'
                : Math.random() > 0.3
                  ? 'request'
                  : 'info',
          source: ['api-gateway', 'user-service', 'database'][
            Math.floor(Math.random() * 3)
          ],
          data: {
            url: `https://api.example.com/live/${Math.floor(Math.random() * 100)}`,
            method: Math.random() > 0.5 ? 'GET' : 'POST',
            status: Math.random() > 0.9 ? 500 : 200,
            message:
              Math.random() > 0.5
                ? `Live event at ${new Date().toLocaleTimeString()}`
                : undefined,
            body:
              Math.random() > 0.5
                ? { live: true, timestamp: Date.now() }
                : undefined,
          },
        };

        setContext((prev) => ({
          ...prev,
          events: [...prev.events, newEvent],
          lastActivity: Date.now(),
        }));
      }, 2000);

      return () => clearInterval(interval);
    }, [context.isConnected]);

    return (
      <div
        style={{ height: '600px', padding: '20px', backgroundColor: '#f8fafc' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h3>Interactive Stream Panel</h3>
          <p>
            New events arrive every 2 seconds. Try filtering, expanding events,
            or using the header controls.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={() =>
                setContext((prev) => ({
                  ...prev,
                  isConnected: !prev.isConnected,
                }))
              }
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: context.isConnected ? '#fef2f2' : '#f0fdf4',
                color: context.isConnected ? '#dc2626' : '#16a34a',
              }}
            >
              {context.isConnected ? 'Disconnect' : 'Connect'}
            </button>
            <button
              onClick={() => setContext((prev) => ({ ...prev, events: [] }))}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f9fafb',
              }}
            >
              Clear Events
            </button>
          </div>
        </div>
        <StreamPanel
          context={context}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>
    );
  },
};

export const WithActiveFilters: Story = {
  args: {
    context: mockContext,
    filters: {
      search: 'user',
      types: ['request', 'error'],
      sources: ['api-gateway', 'user-service'],
      dateRange: {},
      showOnlyErrors: false,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export const ErrorsOnly: Story = {
  args: {
    context: {
      ...mockContext,
      events: [
        ...createMockEvents(5, false),
        ...Array.from({ length: 8 }, (_, i) => ({
          id: `error-${i}`,
          timestamp: Date.now() - i * 2000,
          type: 'error' as const,
          source: ['database', 'api-gateway', 'cache-service'][
            Math.floor(Math.random() * 3)
          ],
          data: {
            error: [
              'Database connection timeout',
              'Authentication failed',
              'Rate limit exceeded',
              'Invalid request format',
              'Service temporarily unavailable',
            ][Math.floor(Math.random() * 5)],
            status: [500, 503, 429, 400, 401][Math.floor(Math.random() * 5)],
            url: `https://api.example.com/endpoint/${i}`,
            method: 'POST',
            payload: {
              query: 'SELECT * FROM users WHERE active = true',
              timeout: 5000,
              retryCount: i,
            },
          },
        })),
      ],
    },
    filters: {
      ...defaultFilters,
      showOnlyErrors: true,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export const ManyEvents: Story = {
  args: {
    context: {
      ...mockContext,
      events: createMockEvents(200), // Large dataset for virtualization
    },
    filters: defaultFilters,
  },
  decorators: [
    (Story) => (
      <div
        style={{ height: '600px', padding: '20px', backgroundColor: '#f8fafc' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <p>
            Stream panel with 200 events demonstrating virtual scrolling
            performance.
          </p>
        </div>
        <div style={{ height: '500px' }}>
          <Story />
        </div>
      </div>
    ),
  ],
};

export const DisconnectedState: Story = {
  args: {
    context: {
      ...mockContext,
      isConnected: false,
    },
    filters: defaultFilters,
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export const EmptyStream: Story = {
  args: {
    context: {
      sessionId: 'session-empty',
      events: [],
      isConnected: true,
      lastActivity: 0,
    },
    filters: defaultFilters,
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export const FilteredEmpty: Story = {
  args: {
    context: mockContext,
    filters: {
      search: 'nonexistent search term',
      types: [],
      sources: [],
      dateRange: {},
      showOnlyErrors: false,
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{ height: '600px', padding: '20px', backgroundColor: '#f8fafc' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <p>All events are filtered out by the current search term.</p>
        </div>
        <div style={{ height: '500px' }}>
          <Story />
        </div>
      </div>
    ),
  ],
};

export const APIResponseScenario: Story = {
  args: {
    context: {
      sessionId: 'session-api',
      events: [
        {
          id: 'api-req-1',
          timestamp: Date.now() - 5000,
          type: 'request',
          source: 'api-client',
          data: {
            method: 'POST',
            url: 'https://api.example.com/v1/users',
            headers: {
              'content-type': 'application/json',
              authorization: 'Bearer eyJhbGciOiJIUzI1NiIs...',
              'x-request-id': 'req-create-user-001',
            },
            body: {
              name: 'Alice Johnson',
              email: 'alice@example.com',
              role: 'user',
              preferences: {
                theme: 'dark',
                notifications: {
                  email: true,
                  push: false,
                  sms: true,
                },
              },
            },
          },
        },
        {
          id: 'api-res-1',
          timestamp: Date.now() - 4800,
          type: 'response',
          source: 'api-server',
          data: {
            status: 201,
            url: 'https://api.example.com/v1/users',
            headers: {
              'content-type': 'application/json',
              'x-response-time': '156ms',
              'x-request-id': 'req-create-user-001',
            },
            body: {
              id: 12345,
              name: 'Alice Johnson',
              email: 'alice@example.com',
              role: 'user',
              createdAt: '2024-01-15T10:30:00Z',
              preferences: {
                theme: 'dark',
                notifications: {
                  email: true,
                  push: false,
                  sms: true,
                },
              },
            },
          },
        },
      ],
      isConnected: true,
      lastActivity: Date.now() - 4800,
    },
    filters: defaultFilters,
  },
  decorators: [
    (Story) => (
      <div
        style={{ height: '600px', padding: '20px', backgroundColor: '#f8fafc' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <p>
            Typical API request/response scenario with detailed JSON payloads.
          </p>
        </div>
        <div style={{ height: '500px' }}>
          <Story />
        </div>
      </div>
    ),
  ],
};
