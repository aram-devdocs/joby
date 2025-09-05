import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { TerminalContainer } from './TerminalContainer';
import type { TerminalState, StreamEvent } from '../types/terminal';

const meta = {
  title: 'Organisms/TerminalContainer',
  component: TerminalContainer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete terminal interface with tabs, filtering, and stream display. Chrome DevTools-inspired dark theme.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'object',
      description: 'Terminal state including tabs, filters, and settings',
    },
    onStateChange: {
      action: 'state-changed',
      description: 'Callback when terminal state changes',
    },
  },
} satisfies Meta<typeof TerminalContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const createMockEvents = (count: number): StreamEvent[] => {
  const types = ['request', 'response', 'error', 'info'] as const;
  const sources = [
    'api-gateway',
    'user-service',
    'database',
    'cache',
    'analytics',
  ];
  const baseTime = Date.now();

  return Array.from({ length: count }, (_, i) => ({
    id: `event-${i}`,
    timestamp: baseTime - (count - i) * 1000 * Math.random() * 10,
    type: types[Math.floor(Math.random() * types.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    data: {
      url: `https://api.example.com/v1/${Math.random() > 0.5 ? 'users' : 'orders'}/${Math.floor(Math.random() * 1000)}`,
      method: Math.random() > 0.5 ? 'GET' : 'POST',
      status: Math.random() > 0.8 ? 500 : Math.random() > 0.5 ? 200 : 404,
      headers: {
        'content-type': 'application/json',
        'x-request-id': `req-${Math.random().toString(36).substr(2, 9)}`,
      },
      body:
        Math.random() > 0.3
          ? {
              data: `Sample data ${i}`,
              timestamp: new Date().toISOString(),
              metadata: { processed: true, version: '1.0' },
            }
          : undefined,
    },
  }));
};

const defaultState: TerminalState = {
  activeTab: 'tab1',
  darkMode: true,
  collapsed: false,
  tabs: [
    {
      id: 'tab1',
      label: 'Main Session',
      context: {
        sessionId: 'session-main',
        events: createMockEvents(15),
        isConnected: true,
        lastActivity: Date.now() - 30000,
      },
      filters: {
        search: '',
        types: [],
        sources: [],
        dateRange: {},
        showOnlyErrors: false,
      },
    },
    {
      id: 'tab2',
      label: 'API Testing',
      context: {
        sessionId: 'session-testing',
        events: createMockEvents(8),
        isConnected: true,
        lastActivity: Date.now() - 5000,
      },
      filters: {
        search: '',
        types: [],
        sources: [],
        dateRange: {},
        showOnlyErrors: false,
      },
    },
    {
      id: 'tab3',
      label: 'Debug Session',
      context: {
        sessionId: 'session-debug',
        events: [],
        isConnected: false,
        lastActivity: 0,
      },
      filters: {
        search: '',
        types: [],
        sources: [],
        dateRange: {},
        showOnlyErrors: false,
      },
    },
  ],
};

export const Default: Story = {
  args: {
    state: defaultState,
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [state, setState] = useState<TerminalState>(defaultState);

    const handleStateChange = (changes: Partial<TerminalState>) => {
      setState((prev) => ({ ...prev, ...changes }));
    };

    // Simulate live events
    React.useEffect(() => {
      const interval = setInterval(() => {
        setState((prev) => {
          const activeTab = prev.tabs.find((tab) => tab.id === prev.activeTab);
          if (!activeTab || !activeTab.context.isConnected) return prev;

          const newEvent: StreamEvent = {
            id: `live-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            type:
              Math.random() > 0.8
                ? 'error'
                : Math.random() > 0.5
                  ? 'response'
                  : 'request',
            source: ['api-gateway', 'user-service', 'database'][
              Math.floor(Math.random() * 3)
            ],
            data: {
              url: `https://api.example.com/live/${Math.floor(Math.random() * 100)}`,
              method: Math.random() > 0.5 ? 'GET' : 'POST',
              status: Math.random() > 0.9 ? 500 : 200,
              message: `Live event at ${new Date().toLocaleTimeString()}`,
            },
          };

          const updatedTabs = prev.tabs.map((tab) =>
            tab.id === prev.activeTab
              ? {
                  ...tab,
                  context: {
                    ...tab.context,
                    events: [...tab.context.events, newEvent],
                    lastActivity: Date.now(),
                  },
                }
              : tab,
          );

          return { ...prev, tabs: updatedTabs };
        });
      }, 3000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div
        style={{ height: '600px', padding: '20px', backgroundColor: '#f8fafc' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h3>Interactive Terminal Demo</h3>
          <p>
            Try switching tabs, applying filters, or toggling dark mode. New
            events arrive every 3 seconds on connected tabs.
          </p>
        </div>
        <TerminalContainer state={state} onStateChange={handleStateChange} />
      </div>
    );
  },
};

export const CollapsedState: Story = {
  args: {
    state: {
      ...defaultState,
      collapsed: true,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', backgroundColor: '#f8fafc' }}>
        <div style={{ marginBottom: '16px' }}>
          <p>Terminal in collapsed state. Click to expand.</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const LightMode: Story = {
  args: {
    state: {
      ...defaultState,
      darkMode: false,
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{ height: '600px', padding: '20px', backgroundColor: '#f8fafc' }}
      >
        <Story />
      </div>
    ),
  ],
};

export const WithActiveFilters: Story = {
  args: {
    state: {
      ...defaultState,
      tabs: [
        {
          ...defaultState.tabs[0],
          filters: {
            search: 'user',
            types: ['request', 'error'],
            sources: ['api-gateway', 'user-service'],
            dateRange: {},
            showOnlyErrors: false,
          },
        },
        ...defaultState.tabs.slice(1),
      ],
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{ height: '600px', padding: '20px', backgroundColor: '#f8fafc' }}
      >
        <Story />
      </div>
    ),
  ],
};

export const ManyEvents: Story = {
  args: {
    state: {
      ...defaultState,
      tabs: [
        {
          ...defaultState.tabs[0],
          context: {
            ...defaultState.tabs[0].context,
            events: createMockEvents(150), // Large number of events for virtualization
          },
        },
        ...defaultState.tabs.slice(1),
      ],
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{ height: '600px', padding: '20px', backgroundColor: '#f8fafc' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <p>
            Terminal with 150 events demonstrating virtual scrolling
            performance.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const ErrorsOnly: Story = {
  args: {
    state: {
      ...defaultState,
      tabs: [
        {
          ...defaultState.tabs[0],
          context: {
            ...defaultState.tabs[0].context,
            events: defaultState.tabs[0].context.events.concat(
              Array.from({ length: 5 }, (_, i) => ({
                id: `error-${i}`,
                timestamp: Date.now() - i * 1000,
                type: 'error' as const,
                source: 'database',
                data: {
                  error: `Database connection failed: Error ${i + 1}`,
                  status: 500,
                  payload: { query: 'SELECT * FROM users', timeout: 5000 },
                },
              })),
            ),
          },
          filters: {
            search: '',
            types: [],
            sources: [],
            dateRange: {},
            showOnlyErrors: true,
          },
        },
        ...defaultState.tabs.slice(1),
      ],
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{ height: '600px', padding: '20px', backgroundColor: '#f8fafc' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <p>Terminal filtered to show only errors.</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const DisconnectedSession: Story = {
  args: {
    state: {
      ...defaultState,
      tabs: defaultState.tabs.map((tab) => ({
        ...tab,
        context: {
          ...tab.context,
          isConnected: false,
        },
      })),
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{ height: '600px', padding: '20px', backgroundColor: '#f8fafc' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <p>All sessions disconnected - no live streaming.</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const EmptyState: Story = {
  args: {
    state: {
      ...defaultState,
      tabs: [
        {
          ...defaultState.tabs[0],
          context: {
            ...defaultState.tabs[0].context,
            events: [],
          },
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{ height: '600px', padding: '20px', backgroundColor: '#f8fafc' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <p>Terminal with no events yet.</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const ResponsiveDemo: Story = {
  args: {
    state: defaultState,
  },
  decorators: [
    (Story) => (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <p>Try resizing the viewport to see responsive behavior.</p>
        </div>
        <div
          style={{
            height: '500px',
            resize: 'both',
            overflow: 'hidden',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            minWidth: '300px',
            minHeight: '200px',
          }}
        >
          <Story />
        </div>
      </div>
    ),
  ],
};
