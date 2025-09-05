import type { Meta, StoryObj } from '@storybook/react';
import { JSONFormatter } from './JSONFormatter';

const meta = {
  title: 'Atoms/JSONFormatter',
  component: JSONFormatter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A syntax-highlighted, collapsible JSON formatter with dark and light theme support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'The data to format as JSON',
    },
    collapsed: {
      control: 'boolean',
      description: 'Whether the JSON should start collapsed',
    },
    maxDepth: {
      control: { type: 'number', min: 1, max: 10, step: 1 },
      description: 'Maximum depth to expand by default',
    },
    theme: {
      control: 'select',
      options: ['dark', 'light'],
      description: 'Color theme for syntax highlighting',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '400px', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof JSONFormatter>;

export default meta;
type Story = StoryObj<typeof meta>;

const simpleObject = {
  name: 'John Doe',
  age: 30,
  active: true,
  balance: 1250.5,
  tags: null,
};

const complexObject = {
  user: {
    id: 12345,
    profile: {
      name: 'John Doe',
      email: 'john@example.com',
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          push: false,
          sms: true,
        },
      },
    },
    metadata: {
      lastLogin: '2024-01-15T10:30:00Z',
      loginCount: 142,
      features: ['premium', 'beta', 'analytics'],
    },
  },
  response: {
    status: 200,
    message: 'Success',
    data: [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 },
      { id: 3, name: 'Item 3', value: 300 },
    ],
  },
};

const arrayData = [
  'string value',
  123,
  true,
  null,
  { nested: 'object' },
  ['nested', 'array', { deep: true }],
];

export const Default: Story = {
  args: {
    data: simpleObject,
    theme: 'dark',
  },
};

export const LightTheme: Story = {
  args: {
    data: simpleObject,
    theme: 'light',
  },
};

export const Collapsed: Story = {
  args: {
    data: complexObject,
    collapsed: true,
    theme: 'dark',
  },
};

export const ComplexObject: Story = {
  args: {
    data: complexObject,
    maxDepth: 2,
    theme: 'dark',
  },
};

export const ArrayData: Story = {
  args: {
    data: arrayData,
    theme: 'dark',
  },
};

export const DeepNesting: Story = {
  args: {
    data: {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                value: 'deeply nested',
                array: [1, 2, 3, 4, 5],
              },
            },
          },
        },
      },
    },
    maxDepth: 3,
    theme: 'dark',
  },
};

export const PrimitiveValues: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <JSONFormatter data="string value" theme="dark" />
      <JSONFormatter data={42} theme="dark" />
      <JSONFormatter data={true} theme="dark" />
      <JSONFormatter data={null} theme="dark" />
      <JSONFormatter data={undefined} theme="dark" />
    </div>
  ),
};

export const APIResponse: Story = {
  args: {
    data: {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'req_1234567890',
        'x-ratelimit-remaining': '99',
      },
      body: {
        users: [
          {
            id: 1,
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'admin',
            created_at: '2024-01-01T12:00:00Z',
          },
          {
            id: 2,
            name: 'Bob Smith',
            email: 'bob@example.com',
            role: 'user',
            created_at: '2024-01-02T12:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          hasNext: true,
        },
      },
    },
    theme: 'dark',
  },
};

export const ThemeComparison: Story = {
  render: () => (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
    >
      <div>
        <h3 style={{ marginBottom: '8px' }}>Dark Theme</h3>
        <JSONFormatter data={complexObject} theme="dark" maxDepth={2} />
      </div>
      <div>
        <h3 style={{ marginBottom: '8px' }}>Light Theme</h3>
        <JSONFormatter data={complexObject} theme="light" maxDepth={2} />
      </div>
    </div>
  ),
};
