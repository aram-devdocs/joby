import type { Meta, StoryObj } from '@storybook/react';
import { StreamEntry } from './StreamEntry';
import type { StreamEvent } from '../types/terminal';

const meta = {
  title: 'Atoms/StreamEntry',
  component: StreamEntry,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Individual stream event display with expandable JSON content and syntax highlighting.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    event: {
      control: 'object',
      description: 'Stream event data',
    },
    expanded: {
      control: 'boolean',
      description: 'Whether the entry starts expanded',
    },
    onToggle: {
      action: 'toggled',
      description: 'Callback when entry is expanded/collapsed',
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '800px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StreamEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseTimestamp = Date.now() - 5 * 60 * 1000; // 5 minutes ago

const requestEvent: StreamEvent = {
  id: 'req-001',
  timestamp: baseTimestamp,
  type: 'request',
  source: 'api-gateway',
  data: {
    method: 'POST',
    url: 'https://api.example.com/users/create',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer token123',
      'x-request-id': 'req-12345',
    },
    body: {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      preferences: {
        theme: 'dark',
        notifications: true,
      },
    },
  },
};

const responseEvent: StreamEvent = {
  id: 'res-001',
  timestamp: baseTimestamp + 150,
  type: 'response',
  source: 'user-service',
  data: {
    status: 201,
    url: 'https://api.example.com/users/create',
    headers: {
      'content-type': 'application/json',
      'x-response-time': '145ms',
    },
    body: {
      id: 12345,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: '2024-01-15T10:30:00Z',
    },
  },
};

const errorEvent: StreamEvent = {
  id: 'err-001',
  timestamp: baseTimestamp + 300,
  type: 'error',
  source: 'database',
  data: {
    error: 'Connection timeout after 5000ms',
    status: 500,
    url: 'https://api.example.com/users/12345',
    method: 'GET',
    payload: {
      query: 'SELECT * FROM users WHERE id = $1',
      params: [12345],
      timeout: 5000,
    },
  },
};

const infoEvent: StreamEvent = {
  id: 'info-001',
  timestamp: baseTimestamp + 450,
  type: 'info',
  source: 'cache-service',
  data: {
    message: 'Cache warmed for user profile data',
    payload: {
      cacheKey: 'user:12345:profile',
      ttl: 3600,
      size: '2.4KB',
    },
  },
};

export const Default: Story = {
  args: {
    event: requestEvent,
  },
};

export const Expanded: Story = {
  args: {
    event: requestEvent,
    expanded: true,
  },
};

export const RequestEvent: Story = {
  args: {
    event: requestEvent,
    expanded: true,
  },
};

export const ResponseEvent: Story = {
  args: {
    event: responseEvent,
    expanded: true,
  },
};

export const ErrorEvent: Story = {
  args: {
    event: errorEvent,
    expanded: true,
  },
};

export const InfoEvent: Story = {
  args: {
    event: infoEvent,
    expanded: true,
  },
};

export const AllEventTypes: Story = {
  render: () => (
    <div
      style={{
        width: '800px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <StreamEntry event={requestEvent} />
      <StreamEntry event={responseEvent} />
      <StreamEntry event={errorEvent} />
      <StreamEntry event={infoEvent} />
    </div>
  ),
};

export const WithLongURL: Story = {
  args: {
    event: {
      ...requestEvent,
      data: {
        ...requestEvent.data,
        url: 'https://api.example.com/v1/users/12345/profile/preferences/notifications/email/settings?include=metadata&expand=permissions&format=json&version=2.1',
      },
    },
    expanded: true,
  },
};

export const WithComplexPayload: Story = {
  args: {
    event: {
      id: 'complex-001',
      timestamp: baseTimestamp,
      type: 'response',
      source: 'analytics-service',
      data: {
        status: 200,
        url: 'https://api.example.com/analytics/report',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-processing-time': '2.34s',
        },
        body: {
          report: {
            id: 'rpt_12345',
            type: 'user_activity',
            dateRange: {
              start: '2024-01-01T00:00:00Z',
              end: '2024-01-31T23:59:59Z',
            },
            metrics: [
              { name: 'page_views', value: 12450, change: '+12.3%' },
              { name: 'unique_users', value: 3421, change: '+8.7%' },
              {
                name: 'session_duration',
                value: 245.6,
                unit: 'seconds',
                change: '-2.1%',
              },
            ],
            breakdowns: {
              byDevice: {
                desktop: 0.65,
                mobile: 0.28,
                tablet: 0.07,
              },
              byCountry: {
                US: 0.45,
                GB: 0.12,
                DE: 0.08,
                FR: 0.07,
                other: 0.28,
              },
            },
          },
          metadata: {
            generated_at: '2024-01-15T10:30:00Z',
            version: '2.1',
            format: 'json',
          },
        },
      },
    },
    expanded: true,
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const events = [requestEvent, responseEvent, errorEvent, infoEvent];

    return (
      <div style={{ width: '800px' }}>
        <div
          style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            Click the arrows to expand/collapse entries and explore the JSON
            data.
          </p>
        </div>
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {events.map((event) => (
            <StreamEntry key={event.id} event={event} />
          ))}
        </div>
      </div>
    );
  },
};

export const DarkTheme: Story = {
  args: {
    event: requestEvent,
    expanded: true,
  },
  decorators: [
    (Story) => (
      <div
        className="dark"
        style={{ backgroundColor: '#1a1a1a', padding: '2rem' }}
      >
        <div
          style={{
            width: '800px',
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
