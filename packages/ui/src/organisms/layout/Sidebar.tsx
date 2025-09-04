import React from 'react';
import { cn } from '../../lib/utils';
import {
  Globe,
  MessageSquare,
  Briefcase,
  Settings,
  FileText,
  Home,
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  items?: SidebarItem[];
  activeItem?: string;
  onItemClick?: (item: SidebarItem) => void;
  className?: string;
}

const defaultItems: SidebarItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <Home className="h-5 w-5" />,
    path: '/',
  },
  {
    id: 'browser',
    label: 'Browser',
    icon: <Globe className="h-5 w-5" />,
    path: '/browser',
  },
  {
    id: 'ollama',
    label: 'AI Assistant',
    icon: <MessageSquare className="h-5 w-5" />,
    path: '/ollama',
  },
  {
    id: 'applications',
    label: 'Applications',
    icon: <Briefcase className="h-5 w-5" />,
    path: '/applications',
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

export function Sidebar({
  items = defaultItems,
  activeItem,
  onItemClick,
  className,
}: SidebarProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-full bg-gray-900 text-white w-64',
        className,
      )}
    >
      {/* Logo/Header */}
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-blue-400" />
          Joby
        </h1>
        <p className="text-xs text-gray-400 mt-1">Job Application Assistant</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onItemClick?.(item)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  'hover:bg-gray-800',
                  activeItem === item.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-300 hover:text-white',
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User</p>
            <p className="text-xs text-gray-400 truncate">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
