import type { Meta, StoryObj } from '@storybook/react';
import { StreamHeader } from './StreamHeader';
import type { StreamContext, StreamEvent } from '../types/terminal';

const meta = {
  title: 'Molecules/StreamHeader',
  component: StreamHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A header component for stream viewers displaying connection status, event statistics, and control actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onClear: { action: 'cleared' },
    onExport: { action: 'exported' },
    onPause: { action: 'pause-toggled' },
    isPaused: {
      control: 'boolean',
      description: 'Whether the stream is currently paused',
    },
  },
} satisfies Meta<typeof StreamHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const generateEvents = (counts: {
  requests: number;
  responses: number;
  errors: number;
  info: number;
}): StreamEvent[] => {
  const events: StreamEvent[] = [];
  let timestamp = Date.now() - 60000;

  for (let i = 0; i < counts.requests; i++) {
    events.push({
      id: `req-${i}`,
      timestamp: (timestamp += 1000),
      type: 'request',
      source: 'browser',
      data: { message: `Request ${i + 1}` },
    });
  }

  for (let i = 0; i < counts.responses; i++) {
    events.push({
      id: `res-${i}`,
      timestamp: (timestamp += 1000),
      type: 'response',
      source: 'browser',
      data: { message: `Response ${i + 1}` },
    });
  }

  for (let i = 0; i < counts.errors; i++) {
    events.push({
      id: `err-${i}`,
      timestamp: (timestamp += 1000),
      type: 'error',
      source: 'system',
      data: { message: `Error ${i + 1}` },
    });
  }

  for (let i = 0; i < counts.info; i++) {
    events.push({
      id: `info-${i}`,
      timestamp: (timestamp += 1000),
      type: 'info',
      source: 'llm',
      data: { message: `Info ${i + 1}` },
    });
  }

  return events;
};

const defaultContext: StreamContext = {
  sessionId: 'abc123def456ghi789',
  isConnected: true,
  events: generateEvents({ requests: 5, responses: 4, errors: 1, info: 2 }),
};

export const Default: Story = {
  args: {
    context: defaultContext,
    isPaused: false,
  },
};

export const Disconnected: Story = {
  args: {
    context: {
      ...defaultContext,
      isConnected: false,
    },
    isPaused: false,
  },
};

export const Paused: Story = {
  args: {
    context: defaultContext,
    isPaused: true,
  },
};

export const NoEvents: Story = {
  args: {
    context: {
      sessionId: 'empty-session-123',
      isConnected: true,
      events: [],
    },
    isPaused: false,
  },
};

export const ManyErrors: Story = {
  args: {
    context: {
      ...defaultContext,
      events: generateEvents({
        requests: 10,
        responses: 8,
        errors: 15,
        info: 3,
      }),
    },
    isPaused: false,
  },
};

export const LargeNumbers: Story = {
  args: {
    context: {
      ...defaultContext,
      events: generateEvents({
        requests: 250,
        responses: 245,
        errors: 5,
        info: 100,
      }),
    },
    isPaused: false,
  },
};

export const RecentActivity: Story = {
  args: {
    context: {
      ...defaultContext,
      events: [
        ...defaultContext.events,
        {
          id: 'recent-1',
          timestamp: Date.now() - 2000,
          type: 'info',
          source: 'system',
          data: { message: 'Very recent event' },
        },
      ],
    },
    isPaused: false,
  },
};

export const WithoutActions: Story = {
  args: {
    context: defaultContext,
    isPaused: false,
    onClear: undefined,
    onExport: undefined,
    onPause: undefined,
  },
};

export const MinimalSetup: Story = {
  args: {
    context: {
      sessionId: 'minimal-123',
      isConnected: true,
      events: generateEvents({ requests: 1, responses: 1, errors: 0, info: 0 }),
    },
    isPaused: false,
    onClear: undefined,
    onExport: undefined,
  },
};

export const AllEventTypes: Story = {
  args: {
    context: {
      sessionId: 'all-types-session',
      isConnected: true,
      events: [
        {
          id: 'req-detailed',
          timestamp: Date.now() - 5000,
          type: 'request',
          source: 'browser',
          data: {
            message: 'POST request',
            url: 'https://api.example.com/data',
            method: 'POST',
            body: { user: 'test' },
          },
        },
        {
          id: 'res-detailed',
          timestamp: Date.now() - 4000,
          type: 'response',
          source: 'browser',
          data: {
            message: 'Success response',
            status: 200,
            body: { success: true },
          },
        },
        {
          id: 'err-detailed',
          timestamp: Date.now() - 3000,
          type: 'error',
          source: 'llm',
          data: {
            message: 'Processing error',
            error: 'Invalid input format',
          },
        },
        {
          id: 'info-detailed',
          timestamp: Date.now() - 2000,
          type: 'info',
          source: 'system',
          data: {
            message: 'Cache cleared successfully',
          },
        },
      ],
    },
    isPaused: false,
  },
};
