import React from 'react';
import { cn } from '../lib/utils';
import { Button } from '../atoms/button';
import { StreamEntry } from '../atoms/StreamEntry';
import type { StreamViewerProps, StreamEvent } from '../types/terminal';

const ITEM_HEIGHT = 80; // Approximate height per stream entry
const BUFFER_SIZE = 5; // Extra items to render outside viewport

const filterEvents = (
  events: StreamEvent[],
  filters: StreamViewerProps['filters'],
): StreamEvent[] => {
  return events.filter((event) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableText = [
        event.data.url,
        event.data.message,
        event.data.error,
        event.source,
        JSON.stringify(event.data.body),
      ]
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }

    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(event.type)) {
      return false;
    }

    // Source filter
    if (filters.sources.length > 0 && !filters.sources.includes(event.source)) {
      return false;
    }

    // Error only filter
    if (filters.showOnlyErrors && event.type !== 'error') {
      return false;
    }

    // Date range filter
    if (filters.dateRange.start && event.timestamp < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && event.timestamp > filters.dateRange.end) {
      return false;
    }

    return true;
  });
};

export const StreamViewer = React.forwardRef<HTMLDivElement, StreamViewerProps>(
  (
    {
      events,
      filters,
      onEventToggle,
      virtualizeThreshold = 100,
      className,
      ...props
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = React.useState(0);
    const [containerHeight, setContainerHeight] = React.useState(0);
    const [expandedEvents, setExpandedEvents] = React.useState<Set<string>>(
      new Set(),
    );

    const filteredEvents = React.useMemo(
      () => filterEvents(events, filters),
      [events, filters],
    );

    const shouldVirtualize = filteredEvents.length > virtualizeThreshold;

    // Update container height on resize
    React.useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setContainerHeight(entry.contentRect.height);
        }
      });

      observer.observe(container);
      return () => observer.disconnect();
    }, []);

    // Handle scroll events
    const handleScroll = React.useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
      },
      [],
    );

    // Calculate visible range for virtualization
    const { startIndex, endIndex, totalHeight, offsetY } = React.useMemo(() => {
      if (!shouldVirtualize) {
        return {
          startIndex: 0,
          endIndex: filteredEvents.length,
          totalHeight: 0,
          offsetY: 0,
        };
      }

      const itemCount = filteredEvents.length;
      const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);

      const start = Math.floor(scrollTop / ITEM_HEIGHT);
      const end = Math.min(itemCount, start + visibleCount + BUFFER_SIZE);
      const bufferedStart = Math.max(0, start - BUFFER_SIZE);

      return {
        startIndex: bufferedStart,
        endIndex: end,
        totalHeight: itemCount * ITEM_HEIGHT,
        offsetY: bufferedStart * ITEM_HEIGHT,
      };
    }, [shouldVirtualize, filteredEvents.length, containerHeight, scrollTop]);

    const visibleEvents = shouldVirtualize
      ? filteredEvents.slice(startIndex, endIndex)
      : filteredEvents;

    const handleEventToggle = (eventId: string, expanded: boolean) => {
      setExpandedEvents((prev) => {
        const newSet = new Set(prev);
        if (expanded) {
          newSet.add(eventId);
        } else {
          newSet.delete(eventId);
        }
        return newSet;
      });
      onEventToggle?.(eventId, expanded);
    };

    // Auto-scroll to bottom when new events arrive
    const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true);
    const prevEventsLength = React.useRef(filteredEvents.length);

    React.useEffect(() => {
      if (
        filteredEvents.length > prevEventsLength.current &&
        shouldAutoScroll
      ) {
        const container = containerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        }
      }
      prevEventsLength.current = filteredEvents.length;
    }, [filteredEvents.length, shouldAutoScroll]);

    // Detect if user has scrolled away from bottom
    React.useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleScrollDetection = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShouldAutoScroll(isNearBottom);
      };

      container.addEventListener('scroll', handleScrollDetection);
      return () =>
        container.removeEventListener('scroll', handleScrollDetection);
    }, []);

    if (filteredEvents.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex-1 flex items-center justify-center text-muted-foreground',
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm">
              {events.length === 0
                ? 'No events yet'
                : 'No events match current filters'}
            </p>
            {events.length > filteredEvents.length && (
              <p className="text-xs mt-1 opacity-75">
                {events.length - filteredEvents.length} events filtered out
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex-1 flex flex-col overflow-hidden', className)}
        {...props}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1 text-xs text-muted-foreground border-b border-border bg-muted/30">
          <span>
            {filteredEvents.length} event
            {filteredEvents.length !== 1 ? 's' : ''}
            {events.length > filteredEvents.length && (
              <span className="ml-1">
                ({events.length - filteredEvents.length} filtered)
              </span>
            )}
          </span>
          {shouldVirtualize && (
            <span className="font-mono">
              Virtualized ({startIndex + 1}-
              {Math.min(endIndex, filteredEvents.length)} of{' '}
              {filteredEvents.length})
            </span>
          )}
        </div>

        {/* Event list */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
          style={shouldVirtualize ? { height: '100%' } : undefined}
        >
          {shouldVirtualize ? (
            <div style={{ height: totalHeight, position: 'relative' }}>
              <div
                style={{
                  transform: `translateY(${offsetY}px)`,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              >
                {visibleEvents.map((event, _index) => (
                  <StreamEntry
                    key={event.id}
                    event={event}
                    expanded={expandedEvents.has(event.id)}
                    onToggle={(expanded) =>
                      handleEventToggle(event.id, expanded)
                    }
                    className="min-h-[80px]"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              {visibleEvents.map((event) => (
                <StreamEntry
                  key={event.id}
                  event={event}
                  expanded={expandedEvents.has(event.id)}
                  onToggle={(expanded) => handleEventToggle(event.id, expanded)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {!shouldAutoScroll && (
          <div className="absolute bottom-4 right-4">
            <Button
              variant="default"
              size="sm"
              className="shadow-lg"
              onClick={() => {
                const container = containerRef.current;
                if (container) {
                  container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth',
                  });
                  setShouldAutoScroll(true);
                }
              }}
            >
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              Latest
            </Button>
          </div>
        )}
      </div>
    );
  },
);

StreamViewer.displayName = 'StreamViewer';
