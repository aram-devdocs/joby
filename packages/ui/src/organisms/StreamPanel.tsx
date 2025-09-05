import React from 'react';
import { cn } from '../lib/utils';
import { StreamHeader } from '../molecules/StreamHeader';
import { FilterControls } from '../molecules/FilterControls';
import { StreamViewer } from '../molecules/StreamViewer';
import type { StreamPanelProps } from '../types/terminal';

export const StreamPanel = React.forwardRef<HTMLDivElement, StreamPanelProps>(
  (
    { context, filters, onFiltersChange, onEventToggle, className, ...props },
    ref,
  ) => {
    const [filtersCollapsed, setFiltersCollapsed] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(false);

    // Get available sources from events
    const availableSources = React.useMemo(() => {
      const sources = new Set<string>();
      context.events.forEach((event) => {
        if (event.source) {
          sources.add(event.source);
        }
      });
      return Array.from(sources).sort();
    }, [context.events]);

    const handleClearEvents = () => {
      // This would typically clear events in the parent component
      // For now, we'll just emit an event that parent can handle
      const event = new CustomEvent('stream-clear', {
        detail: { sessionId: context.sessionId },
      });
      window.dispatchEvent(event);
    };

    const handleExportEvents = () => {
      try {
        const exportData = {
          sessionId: context.sessionId,
          exportedAt: new Date().toISOString(),
          events: context.events,
          metadata: {
            totalEvents: context.events.length,
            timeRange: {
              start: Math.min(...context.events.map((e) => e.timestamp)),
              end: Math.max(...context.events.map((e) => e.timestamp)),
            },
          },
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stream-events-${context.sessionId.slice(-8)}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        // Handle export error silently or show user notification
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const event = new CustomEvent('export-error', {
          detail: { error: errorMessage },
        });
        window.dispatchEvent(event);
      }
    };

    const handlePauseToggle = () => {
      setIsPaused(!isPaused);
      // Emit pause/resume event that parent can handle
      const event = new CustomEvent('stream-pause', {
        detail: {
          sessionId: context.sessionId,
          paused: !isPaused,
        },
      });
      window.dispatchEvent(event);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full bg-background text-foreground',
          'border border-border rounded-lg overflow-hidden',
          className,
        )}
        {...props}
      >
        {/* Header */}
        <StreamHeader
          context={context}
          onClear={context.events.length > 0 ? handleClearEvents : undefined}
          onExport={context.events.length > 0 ? handleExportEvents : undefined}
          onPause={context.isConnected ? handlePauseToggle : undefined}
          isPaused={isPaused}
        />

        {/* Filter Controls */}
        <FilterControls
          filters={filters}
          availableSources={availableSources}
          onFiltersChange={onFiltersChange}
          collapsed={filtersCollapsed}
          onToggleCollapse={setFiltersCollapsed}
        />

        {/* Stream Viewer */}
        <StreamViewer
          events={context.events}
          filters={filters}
          onEventToggle={onEventToggle}
          className="flex-1"
        />

        {/* Status footer for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="border-t border-border px-3 py-1 text-xs text-muted-foreground bg-muted/50">
            <div className="flex items-center justify-between">
              <span>
                Events: {context.events.length} | Connected:{' '}
                {context.isConnected ? 'Yes' : 'No'} | Session:{' '}
                {context.sessionId.slice(-8)}
              </span>
              <span>
                Filters:{' '}
                {[
                  filters.search && 'search',
                  filters.types.length > 0 && `types(${filters.types.length})`,
                  filters.sources.length > 0 &&
                    `sources(${filters.sources.length})`,
                  filters.showOnlyErrors && 'errors-only',
                ]
                  .filter(Boolean)
                  .join(', ') || 'none'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  },
);

StreamPanel.displayName = 'StreamPanel';
