import type { Meta, StoryObj } from '@storybook/react';
import { StreamTimestamp } from './StreamTimestamp';

const meta = {
  title: 'Atoms/StreamTimestamp',
  component: StreamTimestamp,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A timestamp display component with multiple format options. Automatically updates relative timestamps.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    timestamp: {
      control: 'number',
      description: 'Unix timestamp in milliseconds',
    },
    format: {
      control: 'select',
      options: ['relative', 'absolute', 'time'],
      description: 'Format for displaying the timestamp',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', backgroundColor: '#f3f4f6' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StreamTimestamp>;

export default meta;
type Story = StoryObj<typeof meta>;

// Current time for consistent examples
const now = Date.now();
const oneMinuteAgo = now - 60 * 1000;
const oneHourAgo = now - 60 * 60 * 1000;
const oneDayAgo = now - 24 * 60 * 60 * 1000;

export const Default: Story = {
  args: {
    timestamp: oneMinuteAgo,
    format: 'relative',
  },
};

export const RelativeFormat: Story = {
  args: {
    timestamp: oneHourAgo,
    format: 'relative',
  },
};

export const AbsoluteFormat: Story = {
  args: {
    timestamp: now,
    format: 'absolute',
  },
};

export const TimeFormat: Story = {
  args: {
    timestamp: now,
    format: 'time',
  },
};

export const AllFormats: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ minWidth: '80px', fontSize: '14px', fontWeight: 500 }}>
          Now:
        </span>
        <StreamTimestamp timestamp={now} format="relative" />
        <StreamTimestamp timestamp={now} format="absolute" />
        <StreamTimestamp timestamp={now} format="time" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ minWidth: '80px', fontSize: '14px', fontWeight: 500 }}>
          1min ago:
        </span>
        <StreamTimestamp timestamp={oneMinuteAgo} format="relative" />
        <StreamTimestamp timestamp={oneMinuteAgo} format="absolute" />
        <StreamTimestamp timestamp={oneMinuteAgo} format="time" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ minWidth: '80px', fontSize: '14px', fontWeight: 500 }}>
          1hr ago:
        </span>
        <StreamTimestamp timestamp={oneHourAgo} format="relative" />
        <StreamTimestamp timestamp={oneHourAgo} format="absolute" />
        <StreamTimestamp timestamp={oneHourAgo} format="time" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ minWidth: '80px', fontSize: '14px', fontWeight: 500 }}>
          1day ago:
        </span>
        <StreamTimestamp timestamp={oneDayAgo} format="relative" />
        <StreamTimestamp timestamp={oneDayAgo} format="absolute" />
        <StreamTimestamp timestamp={oneDayAgo} format="time" />
      </div>
    </div>
  ),
};

export const DarkTheme: Story = {
  args: {
    timestamp: oneHourAgo,
    format: 'relative',
  },
  decorators: [
    (Story) => (
      <div
        className="dark"
        style={{ padding: '2rem', backgroundColor: '#1a1a1a', color: 'white' }}
      >
        <Story />
      </div>
    ),
  ],
};
