import React from 'react';
import { cn } from '../lib/utils';
import { Button } from '../atoms/button';
import { FilterChip } from '../atoms/FilterChip';
import type { TabSystemProps } from '../types/terminal';

export const TabSystem = React.forwardRef<HTMLDivElement, TabSystemProps>(
  (
    { tabs, activeTab, onTabChange, onTabClose, onTabAdd, className, ...props },
    ref,
  ) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [showScrollButtons, setShowScrollButtons] = React.useState(false);

    React.useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const checkScroll = () => {
        setShowScrollButtons(container.scrollWidth > container.clientWidth);
      };

      checkScroll();
      window.addEventListener('resize', checkScroll);
      return () => window.removeEventListener('resize', checkScroll);
    }, [tabs.length]);

    const scrollTabs = (direction: 'left' | 'right') => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    };

    const getActiveFiltersCount = (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return 0;

      let count = 0;
      if (tab.filters.search) count++;
      if (tab.filters.types.length > 0) count++;
      if (tab.filters.sources.length > 0) count++;
      if (tab.filters.showOnlyErrors) count++;
      if (tab.filters.dateRange.start || tab.filters.dateRange.end) count++;

      return count;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center border-b border-border bg-background',
          'overflow-hidden',
          className,
        )}
        {...props}
      >
        {/* Left scroll button */}
        {showScrollButtons && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0 rounded-none border-r border-border"
            onClick={() => scrollTabs('left')}
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
        )}

        {/* Tabs container */}
        <div
          ref={scrollContainerRef}
          className="flex flex-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const filtersCount = getActiveFiltersCount(tab.id);
            const eventCount = tab.context.events.length;
            const unreadCount = tab.context.events.filter(
              (e) => e.timestamp > (tab.context.lastActivity || 0),
            ).length;

            return (
              <div
                key={tab.id}
                className={cn(
                  'flex items-center border-r border-border bg-background',
                  'min-w-0 relative group',
                  isActive && 'bg-muted',
                )}
              >
                <button
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium',
                    'hover:bg-muted transition-colors duration-150',
                    'min-w-0 flex-1 text-left',
                    isActive
                      ? 'text-foreground border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => onTabChange(tab.id)}
                >
                  {/* Connection status indicator */}
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      tab.context.isConnected ? 'bg-green-500' : 'bg-gray-400',
                    )}
                  />

                  {/* Tab label */}
                  <span className="truncate min-w-0">{tab.label}</span>

                  {/* Event count badge */}
                  {eventCount > 0 && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 text-xs rounded-full font-mono flex-shrink-0',
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
                      )}
                    >
                      {eventCount > 999 ? '999+' : eventCount}
                    </span>
                  )}

                  {/* Unread indicator */}
                  {unreadCount > 0 && !isActive && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  )}
                </button>

                {/* Active filters indicator */}
                {filtersCount > 0 && (
                  <div className="px-1">
                    <FilterChip
                      label=""
                      value={filtersCount.toString()}
                      variant="default"
                      className="h-5 text-xs"
                    />
                  </div>
                )}

                {/* Close button */}
                {onTabClose && tabs.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-6 w-6 p-0 rounded-full',
                      'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                      'hover:bg-destructive hover:text-destructive-foreground',
                      'mr-2',
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose(tab.id);
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right scroll button */}
        {showScrollButtons && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0 rounded-none border-l border-border"
            onClick={() => scrollTabs('right')}
          >
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        )}

        {/* Add tab button */}
        {onTabAdd && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0 rounded-none border-l border-border"
            onClick={onTabAdd}
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Button>
        )}
      </div>
    );
  },
);

TabSystem.displayName = 'TabSystem';
