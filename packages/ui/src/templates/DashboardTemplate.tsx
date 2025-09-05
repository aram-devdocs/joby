import React from 'react';
import { Sidebar, SidebarItem } from '../organisms/layout/Sidebar';
import { TerminalContainer } from '../organisms/TerminalContainer';
import { cn } from '../lib/utils';
import type { TerminalState, StreamEvent } from '../types/terminal';

interface DashboardTemplateProps {
  children: React.ReactNode;
  activeRoute?: string;
  onNavigate?: (path: string) => void;
  className?: string;
  onStreamEvent?: (callback: (event: unknown) => void) => () => void;
}

const INITIAL_TERMINAL_STATE: TerminalState = {
  activeTab: 'main',
  tabs: [
    {
      id: 'main',
      label: 'Main Stream',
      context: {
        sessionId: 'main-session',
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
  filters: {
    search: '',
    types: [],
    sources: [],
    dateRange: {},
    showOnlyErrors: false,
  },
  darkMode: true,
  collapsed: true, // Start collapsed
};

export function DashboardTemplate({
  children,
  activeRoute,
  onNavigate,
  className,
  onStreamEvent,
}: DashboardTemplateProps) {
  const [terminalState, setTerminalState] = React.useState<TerminalState>(
    () => {
      // Load from localStorage if available
      const saved = localStorage.getItem('dashboard-terminal-state');
      if (saved) {
        try {
          return { ...INITIAL_TERMINAL_STATE, ...JSON.parse(saved) };
        } catch {
          return INITIAL_TERMINAL_STATE;
        }
      }
      return INITIAL_TERMINAL_STATE;
    },
  );

  const [terminalHeight, setTerminalHeight] = React.useState(() => {
    const saved = localStorage.getItem('dashboard-terminal-height');
    return saved ? parseInt(saved, 10) : 400;
  });

  const [isResizing, setIsResizing] = React.useState(false);

  // Save terminal state to localStorage
  React.useEffect(() => {
    localStorage.setItem(
      'dashboard-terminal-state',
      JSON.stringify({
        collapsed: terminalState.collapsed,
        darkMode: terminalState.darkMode,
      }),
    );
  }, [terminalState.collapsed, terminalState.darkMode]);

  // Save terminal height to localStorage
  React.useEffect(() => {
    localStorage.setItem(
      'dashboard-terminal-height',
      terminalHeight.toString(),
    );
  }, [terminalHeight]);

  // Keyboard shortcut for terminal toggle (Ctrl/Cmd + `)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setTerminalState((prev) => ({ ...prev, collapsed: !prev.collapsed }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Connect to stream events
  React.useEffect(() => {
    if (!onStreamEvent) return;

    const cleanup = onStreamEvent((event: unknown) => {
      // Add the event to the main tab
      if (event && typeof event === 'object' && 'id' in event) {
        setTerminalState((prev) => {
          const mainTab = prev.tabs.find((tab) => tab.id === 'main');
          if (!mainTab) return prev;

          const updatedTab = {
            ...mainTab,
            context: {
              ...mainTab.context,
              events: [...mainTab.context.events, event as StreamEvent],
              isConnected: true,
              lastActivity: Date.now(),
            },
          };

          return {
            ...prev,
            tabs: prev.tabs.map((tab) =>
              tab.id === 'main' ? updatedTab : tab,
            ),
          };
        });
      }
    });

    // Mark as connected
    setTerminalState((prev) => {
      const mainTab = prev.tabs.find((tab) => tab.id === 'main');
      if (!mainTab) return prev;

      const updatedTab = {
        ...mainTab,
        context: {
          ...mainTab.context,
          isConnected: true,
        },
      };

      return {
        ...prev,
        tabs: prev.tabs.map((tab) => (tab.id === 'main' ? updatedTab : tab)),
      };
    });

    return cleanup;
  }, [onStreamEvent]);

  const handleSidebarItemClick = (item: SidebarItem) => {
    onNavigate?.(item.path);
  };

  const handleTerminalStateChange = (changes: Partial<TerminalState>) => {
    setTerminalState((prev) => ({ ...prev, ...changes }));
  };

  const handleToggleTerminal = () => {
    setTerminalState((prev) => ({ ...prev, collapsed: !prev.collapsed }));
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY;
      const minHeight = 200;
      const maxHeight = window.innerHeight * 0.7;
      setTerminalHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const mainContentHeight = terminalState.collapsed
    ? 'calc(100vh - 2rem)'
    : `calc(100vh - ${terminalHeight + 40}px)`;

  return (
    <div className={cn('flex h-screen bg-gray-50', className)}>
      <Sidebar
        {...(activeRoute && { activeItem: activeRoute })}
        onItemClick={handleSidebarItemClick}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main
          className="flex-1 overflow-auto"
          style={{ height: mainContentHeight }}
        >
          {children}
        </main>

        {/* Terminal Toggle Button - Always visible when collapsed */}
        {terminalState.collapsed && (
          <div className="p-2">
            <button
              onClick={handleToggleTerminal}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium',
                'bg-background hover:bg-muted border border-border rounded-lg',
                'transition-colors duration-150 w-full justify-between',
                'shadow-sm',
              )}
              title="Open Terminal (Ctrl/Cmd + `)"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3"
                  />
                </svg>
                <span>Terminal</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + `
              </span>
            </button>
          </div>
        )}

        {/* Terminal Panel */}
        {!terminalState.collapsed && (
          <>
            {/* Resize Handle */}
            <div
              className={cn(
                'h-2 bg-border hover:bg-border/80 cursor-ns-resize',
                'flex items-center justify-center group transition-colors',
                isResizing && 'bg-primary',
              )}
              onMouseDown={handleResizeStart}
              title="Drag to resize terminal"
            >
              <div className="w-12 h-0.5 bg-muted-foreground/50 group-hover:bg-muted-foreground rounded-full" />
            </div>

            <div
              className="bg-background border-t border-border"
              style={{ height: terminalHeight }}
            >
              <TerminalContainer
                state={terminalState}
                onStateChange={handleTerminalStateChange}
                className="h-full"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
