import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TabSystem } from './TabSystem';
import type { TerminalTab } from '../types/terminal';

const meta = {
  title: 'Molecules/TabSystem',
  component: TabSystem,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Chrome DevTools-style tab system with scrolling, close buttons, and connection status indicators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tabs: {
      control: 'object',
      description: 'Array of terminal tabs',
    },
    activeTab: {
      control: 'text',
      description: 'ID of the currently active tab',
    },
    onTabChange: {
      action: 'tab-changed',
      description: 'Callback when tab is changed',
    },
    onTabClose: {
      action: 'tab-closed',
      description: 'Callback when tab is closed',
    },
    onTabAdd: {
      action: 'tab-added',
      description: 'Callback when new tab is requested',
    },
  },
} satisfies Meta<typeof TabSystem>;

export default meta;
type Story = StoryObj<typeof meta>;

const createMockTab = (
  id: string,
  label: string,
  isConnected: boolean,
  eventCount: number,
): TerminalTab => ({
  id,
  label,
  context: {
    sessionId: `session-${id}`,
    events: Array(eventCount)
      .fill(null)
      .map((_, i) => ({
        id: `event-${i}`,
        timestamp: Date.now() - i * 1000,
        type: (['request', 'response', 'error', 'info'] as const)[
          Math.floor(Math.random() * 4)
        ],
        source: 'api',
        data: {},
      })),
    isConnected,
    lastActivity: Date.now() - Math.random() * 60000,
  },
  filters: {
    search: '',
    types: [],
    sources: [],
    dateRange: {},
    showOnlyErrors: false,
  },
});

const basicTabs: TerminalTab[] = [
  createMockTab('tab1', 'Main Session', true, 25),
  createMockTab('tab2', 'API Testing', true, 8),
  createMockTab('tab3', 'Debug Session', false, 0),
];

export const Default: Story = {
  args: {
    tabs: basicTabs,
    activeTab: 'tab1',
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [tabs, setTabs] = useState(basicTabs);
    const [activeTab, setActiveTab] = useState('tab1');

    const handleTabAdd = () => {
      const newId = `tab-${Date.now()}`;
      const newTab = createMockTab(newId, `Tab ${tabs.length + 1}`, false, 0);
      setTabs([...tabs, newTab]);
      setActiveTab(newId);
    };

    const handleTabClose = (tabId: string) => {
      const newTabs = tabs.filter((tab) => tab.id !== tabId);
      setTabs(newTabs);
      if (tabId === activeTab && newTabs.length > 0) {
        setActiveTab(newTabs[0].id);
      }
    };

    return (
      <div style={{ height: '200px', border: '1px solid #e2e8f0' }}>
        <TabSystem
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onTabClose={tabs.length > 1 ? handleTabClose : undefined}
          onTabAdd={handleTabAdd}
        />
        <div style={{ padding: '20px', backgroundColor: '#f8fafc' }}>
          <h3>Active Tab: {tabs.find((t) => t.id === activeTab)?.label}</h3>
          <p>Click tabs to switch, close tabs with X, or add new tabs with +</p>
        </div>
      </div>
    );
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      createMockTab('tab1', 'Main Session', true, 45),
      createMockTab('tab2', 'API Testing', true, 12),
      createMockTab('tab3', 'Debug Session', false, 0),
      createMockTab('tab4', 'Load Testing', true, 234),
      createMockTab('tab5', 'Integration Tests', true, 67),
      createMockTab('tab6', 'Performance Monitor', true, 89),
      createMockTab('tab7', 'Error Analysis', false, 5),
      createMockTab('tab8', 'User Simulation', true, 156),
    ],
    activeTab: 'tab4',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', border: '1px solid #e2e8f0' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithActiveFilters: Story = {
  args: {
    tabs: [
      {
        ...createMockTab('tab1', 'Filtered Session', true, 25),
        filters: {
          search: 'error',
          types: ['error', 'request'],
          sources: ['api', 'database'],
          dateRange: {},
          showOnlyErrors: true,
        },
      },
      createMockTab('tab2', 'Clean Session', true, 8),
      {
        ...createMockTab('tab3', 'Heavy Filters', false, 0),
        filters: {
          search: 'user login',
          types: ['request', 'response'],
          sources: ['auth-service', 'user-service', 'session-service'],
          dateRange: { start: Date.now() - 86400000 },
          showOnlyErrors: false,
        },
      },
    ],
    activeTab: 'tab1',
  },
};

export const ConnectionStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h3>Connected Tabs</h3>
        <div style={{ border: '1px solid #e2e8f0' }}>
          <TabSystem
            tabs={[
              createMockTab('connected1', 'Active Stream', true, 45),
              createMockTab('connected2', 'Live Updates', true, 12),
            ]}
            activeTab="connected1"
            onTabChange={() => {
              // Storybook demo - no-op
            }}
          />
        </div>
      </div>
      <div>
        <h3>Disconnected Tabs</h3>
        <div style={{ border: '1px solid #e2e8f0' }}>
          <TabSystem
            tabs={[
              createMockTab('disconnected1', 'Offline Session', false, 0),
              createMockTab('disconnected2', 'Connection Lost', false, 25),
            ]}
            activeTab="disconnected1"
            onTabChange={() => {
              // Storybook demo - no-op
            }}
          />
        </div>
      </div>
    </div>
  ),
};

export const LongTabNames: Story = {
  args: {
    tabs: [
      createMockTab(
        'tab1',
        'Very Long Tab Name That Should Be Truncated',
        true,
        25,
      ),
      createMockTab(
        'tab2',
        'Production API Gateway Health Check Monitor',
        true,
        156,
      ),
      createMockTab(
        'tab3',
        'User Authentication Service Debug Session',
        false,
        0,
      ),
    ],
    activeTab: 'tab1',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px', border: '1px solid #e2e8f0' }}>
        <Story />
      </div>
    ),
  ],
};

export const EmptyState: Story = {
  args: {
    tabs: [],
    activeTab: '',
  },
};

export const SingleTab: Story = {
  args: {
    tabs: [createMockTab('only', 'Only Tab', true, 10)],
    activeTab: 'only',
    // No close button for single tab
    onTabClose: undefined,
  },
};

export const DarkTheme: Story = {
  args: {
    tabs: basicTabs,
    activeTab: 'tab2',
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ backgroundColor: '#1a1a1a' }}>
        <div style={{ border: '1px solid #374151' }}>
          <Story />
        </div>
      </div>
    ),
  ],
};
