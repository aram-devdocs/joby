import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from './Sidebar';
import {
  Home,
  Settings,
  Users,
  FileText,
  BarChart,
  Package,
} from 'lucide-react';

const meta = {
  title: 'Organisms/Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    activeItem: {
      control: 'select',
      options: [
        'home',
        'analytics',
        'users',
        'products',
        'documents',
        'settings',
      ],
    },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const customItems = [
  {
    id: 'home',
    label: 'Dashboard',
    icon: <Home className="h-5 w-5" />,
    path: '/',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart className="h-5 w-5" />,
    path: '/analytics',
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="h-5 w-5" />,
    path: '/users',
  },
  {
    id: 'products',
    label: 'Products',
    icon: <Package className="h-5 w-5" />,
    path: '/products',
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: <FileText className="h-5 w-5" />,
    path: '/documents',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    path: '/settings',
  },
];

export const Default: Story = {
  args: {},
};

export const WithActiveItem: Story = {
  args: {
    activeItem: 'analytics',
    items: customItems,
  },
};

export const CustomItems: Story = {
  args: {
    items: customItems,
    activeItem: 'home',
  },
};

export const Interactive: Story = {
  args: {
    items: customItems,
    activeItem: 'home',
    onItemClick: (item) => {
      action('item-clicked')(item);
      alert(`Navigating to: ${item.path}`);
    },
  },
};

export const CompactSidebar: Story = {
  args: {
    items: customItems.slice(0, 3),
    activeItem: 'home',
  },
};

export const WithCustomStyle: Story = {
  args: {
    items: customItems,
    activeItem: 'users',
    className: 'bg-blue-900',
  },
};
