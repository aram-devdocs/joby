import React from 'react';
import { cn } from '../lib/utils';
import { TabSystem } from '../molecules/TabSystem';
import { StreamPanel } from './StreamPanel';
import type {
  TerminalContainerProps,
  TerminalTab,
  StreamFilter,
} from '../types/terminal';

export const TerminalContainer = React.forwardRef<
  HTMLDivElement,
  TerminalContainerProps
>(({ state, onStateChange, className, ...props }, ref) => {
  const activeTab = React.useMemo(
    () => state.tabs.find((tab) => tab.id === state.activeTab),
    [state.tabs, state.activeTab],
  );

  const handleTabChange = (tabId: string) => {
    onStateChange({ activeTab: tabId });
  };

  const handleTabClose = (tabId: string) => {
    if (state.tabs.length <= 1) return; // Don't close the last tab

    const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
    const newTabs = state.tabs.filter((tab) => tab.id !== tabId);

    let newActiveTab = state.activeTab;
    if (tabId === state.activeTab) {
      // If closing the active tab, switch to the next available tab
      if (tabIndex < newTabs.length && newTabs[tabIndex]) {
        newActiveTab = newTabs[tabIndex].id;
      } else if (newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        if (lastTab) {
          newActiveTab = lastTab.id;
        }
      }
    }

    onStateChange({
      tabs: newTabs,
      activeTab: newActiveTab,
    });
  };

  const handleTabAdd = () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: TerminalTab = {
      id: newTabId,
      label: `Stream ${state.tabs.length + 1}`,
      context: {
        sessionId: `session-${Date.now()}`,
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
    };

    onStateChange({
      tabs: [...state.tabs, newTab],
      activeTab: newTabId,
    });
  };

  const handleFiltersChange = (filters: Partial<StreamFilter>) => {
    if (!activeTab) return;

    const updatedTabs = state.tabs.map((tab) =>
      tab.id === activeTab.id
        ? { ...tab, filters: { ...tab.filters, ...filters } }
        : tab,
    );

    onStateChange({ tabs: updatedTabs });
  };

  const handleEventToggle = (eventId: string, expanded: boolean) => {
    // This could be used to track expanded events per tab
    // For now, we'll let the StreamViewer handle its own expansion state
    // Emit event for potential logging or analytics
    const event = new CustomEvent('stream-event-toggle', {
      detail: { eventId, expanded },
    });
    window.dispatchEvent(event);
  };

  const handleToggleCollapse = () => {
    onStateChange({ collapsed: !state.collapsed });
  };

  const handleToggleDarkMode = () => {
    onStateChange({ darkMode: !state.darkMode });
  };

  if (state.collapsed) {
    return (
      <div className={state.darkMode ? 'dark' : ''}>
        <div
          ref={ref}
          className={cn(
            'h-8 bg-background text-foreground border border-border rounded-lg',
            'flex items-center px-3 cursor-pointer hover:bg-muted',
            'transition-colors duration-150',
            className,
          )}
          onClick={handleToggleCollapse}
          {...props}
        >
          <div className="flex items-center gap-2 flex-1">
            <svg
              className="h-3 w-3"
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
            <span className="text-sm font-medium">Terminal</span>
            {activeTab && activeTab.context.events.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                {activeTab.context.events.length}
              </span>
            )}
          </div>
          <button
            className="p-1 hover:bg-background rounded"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleDarkMode();
            }}
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  state.darkMode
                    ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707'
                    : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                }
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (!activeTab) {
    return (
      <div className={state.darkMode ? 'dark' : ''}>
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-center h-96',
            'bg-background text-foreground border border-border rounded-lg',
            className,
          )}
          {...props}
        >
          <div className="text-center">
            <svg
              className="h-12 w-12 mx-auto mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
            <p className="text-sm">No terminal tabs available</p>
            <button
              className="mt-2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
              onClick={handleTabAdd}
            >
              Create Tab
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={state.darkMode ? 'dark' : ''}>
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full bg-background text-foreground',
          'border border-border rounded-lg overflow-hidden',
          'min-h-96',
          className,
        )}
        {...props}
      >
        {/* Header with collapse, dark mode, and settings */}
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-2 py-1">
          <div className="flex items-center gap-1">
            <button
              className="p-1 hover:bg-background rounded text-xs"
              onClick={handleToggleCollapse}
              title="Collapse terminal"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7-7-7 7"
                />
              </svg>
            </button>
            <span className="text-xs font-medium text-muted-foreground">
              Terminal
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              className={cn(
                'p-1 hover:bg-background rounded text-xs',
                state.darkMode && 'bg-background',
              )}
              onClick={handleToggleDarkMode}
              title={
                state.darkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    state.darkMode
                      ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707'
                      : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab System */}
        <TabSystem
          tabs={state.tabs}
          activeTab={state.activeTab}
          onTabChange={handleTabChange}
          onTabClose={state.tabs.length > 1 ? handleTabClose : undefined}
          onTabAdd={handleTabAdd}
        />

        {/* Stream Panel */}
        <StreamPanel
          context={activeTab.context}
          filters={activeTab.filters}
          onFiltersChange={handleFiltersChange}
          onEventToggle={handleEventToggle}
          className="flex-1"
        />
      </div>
    </div>
  );
});

TerminalContainer.displayName = 'TerminalContainer';
