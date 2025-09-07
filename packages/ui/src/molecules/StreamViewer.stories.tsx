import type { Meta, StoryObj } from '@storybook/react';
import { StreamViewer } from './StreamViewer';
import type { StreamEvent } from '../types/terminal';
import { useState } from 'react';

const meta = {
  title: 'Molecules/StreamViewer',
  component: StreamViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A virtualized stream viewer component for displaying and filtering log events with optimal performance.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onEventToggle: { action: 'event-toggled' },
    virtualizeThreshold: {
      control: { type: 'number', min: 10, max: 500, step: 10 },
      description: 'Number of events before virtualization kicks in',
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{ height: '600px', display: 'flex', flexDirection: 'column' }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StreamViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

const generateEvents = (count: number): StreamEvent[] => {
  const types: StreamEvent['type'][] = ['request', 'response', 'error', 'info'];
  const sources = ['browser', 'llm', 'system', 'network'];

  return Array.from({ length: count }, (_, i) => ({
    id: `event-${i}`,
    timestamp: Date.now() - (count - i) * 1000,
    type: types[i % types.length],
    source: sources[i % sources.length],
    data: {
      message: `Event message ${i + 1}`,
      url: i % 3 === 0 ? `https://api.example.com/endpoint/${i}` : undefined,
      method: i % 3 === 0 ? (i % 2 === 0 ? 'GET' : 'POST') : undefined,
      status: i % 3 === 1 ? 200 + (i % 5) * 100 : undefined,
      error: i % 4 === 2 ? `Error occurred in event ${i}` : undefined,
      body:
        i % 2 === 0 ? { key: `value_${i}`, nested: { data: i } } : undefined,
    },
  }));
};

const defaultFilters = {
  search: '',
  types: [],
  sources: [],
  showOnlyErrors: false,
  dateRange: {
    start: null,
    end: null,
  },
};

export const Default: Story = {
  args: {
    events: generateEvents(10),
    filters: defaultFilters,
  },
};

export const EmptyState: Story = {
  args: {
    events: [],
    filters: defaultFilters,
  },
};

export const FilteredEmpty: Story = {
  args: {
    events: generateEvents(20),
    filters: {
      ...defaultFilters,
      search: 'nonexistent',
    },
  },
};

export const WithSearchFilter: Story = {
  args: {
    events: generateEvents(50),
    filters: {
      ...defaultFilters,
      search: 'endpoint',
    },
  },
};

export const ErrorsOnly: Story = {
  args: {
    events: generateEvents(30),
    filters: {
      ...defaultFilters,
      showOnlyErrors: true,
    },
  },
};

export const TypeFiltered: Story = {
  args: {
    events: generateEvents(40),
    filters: {
      ...defaultFilters,
      types: ['request', 'response'],
    },
  },
};

export const VirtualizedLarge: Story = {
  args: {
    events: generateEvents(500),
    filters: defaultFilters,
    virtualizeThreshold: 50,
  },
};

export const RealTimeUpdates: Story = {
  render: () => {
    const [events, setEvents] = useState<StreamEvent[]>(generateEvents(5));
    const [isStreaming, setIsStreaming] = useState(false);

    const startStreaming = () => {
      setIsStreaming(true);
      const interval = setInterval(() => {
        setEvents((prev) => {
          const newEvent: StreamEvent = {
            id: `event-${Date.now()}`,
            timestamp: Date.now(),
            type: ['request', 'response', 'error', 'info'][
              Math.floor(Math.random() * 4)
            ] as StreamEvent['type'],
            source: ['browser', 'llm', 'system'][Math.floor(Math.random() * 3)],
            data: {
              message: `Real-time event at ${new Date().toLocaleTimeString()}`,
            },
          };
          return [...prev, newEvent];
        });
      }, 2000);

      setTimeout(() => {
        clearInterval(interval);
        setIsStreaming(false);
      }, 20000);
    };

    return (
      <div
        style={{ height: '600px', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
          <button
            onClick={startStreaming}
            disabled={isStreaming}
            style={{
              padding: '4px 12px',
              background: isStreaming ? '#e2e8f0' : '#3b82f6',
              color: isStreaming ? '#64748b' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isStreaming ? 'not-allowed' : 'pointer',
            }}
          >
            {isStreaming ? 'Streaming...' : 'Start Real-time Stream'}
          </button>
        </div>
        <StreamViewer
          events={events}
          filters={defaultFilters}
          virtualizeThreshold={100}
        />
      </div>
    );
  },
};

export const MixedContent: Story = {
  args: {
    events: [
      {
        id: 'req-1',
        timestamp: Date.now() - 10000,
        type: 'request',
        source: 'browser',
        data: {
          message: 'GET request to API',
          url: 'https://api.example.com/users',
          method: 'GET',
        },
      },
      {
        id: 'res-1',
        timestamp: Date.now() - 9000,
        type: 'response',
        source: 'browser',
        data: {
          message: 'Response received',
          status: 200,
          body: { users: ['Alice', 'Bob', 'Charlie'] },
        },
      },
      {
        id: 'err-1',
        timestamp: Date.now() - 8000,
        type: 'error',
        source: 'llm',
        data: {
          message: 'LLM processing failed',
          error: 'Token limit exceeded',
        },
      },
      {
        id: 'info-1',
        timestamp: Date.now() - 7000,
        type: 'info',
        source: 'system',
        data: {
          message: 'System checkpoint saved',
        },
      },
    ],
    filters: defaultFilters,
  },
};
