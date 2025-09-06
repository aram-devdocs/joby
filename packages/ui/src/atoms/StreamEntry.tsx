import React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Badge } from './badge';
import { StreamTimestamp } from './StreamTimestamp';
import { JSONFormatter } from './JSONFormatter';
import type { StreamEntryProps } from '../types/terminal';

const getEventIcon = (type: string) => {
  switch (type) {
    case 'request':
      return (
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
            d="M7 16l-4-4m0 0l4-4m-4 4h18"
          />
        </svg>
      );
    case 'response':
      return (
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
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      );
    case 'error':
      return (
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
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'info':
    default:
      return (
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
};

const getEventVariant = (type: string) => {
  switch (type) {
    case 'request':
      return 'outline' as const;
    case 'response':
      return 'default' as const;
    case 'error':
      return 'destructive' as const;
    case 'info':
    default:
      return 'secondary' as const;
  }
};

const getStatusCodeVariant = (status?: number) => {
  if (!status) return 'secondary' as const;
  if (status >= 200 && status < 300) return 'default' as const;
  if (status >= 300 && status < 400) return 'secondary' as const;
  if (status >= 400 && status < 500) return 'outline' as const;
  if (status >= 500) return 'destructive' as const;
  return 'secondary' as const;
};

export const StreamEntry = React.forwardRef<HTMLDivElement, StreamEntryProps>(
  ({ event, expanded = false, onToggle, className, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(expanded);

    React.useEffect(() => {
      setIsExpanded(expanded);
    }, [expanded]);

    const handleToggle = () => {
      const newExpanded = !isExpanded;
      setIsExpanded(newExpanded);
      onToggle?.(newExpanded);
    };

    const hasExpandableContent =
      event.data.body !== undefined ||
      event.data.headers !== undefined ||
      event.data.payload !== undefined;

    return (
      <div
        ref={ref}
        className={cn(
          'border-b border-border last:border-b-0',
          'hover:bg-muted/50 transition-colors duration-150',
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-3 p-3">
          {/* Event Type Icon */}
          <div
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded-full mt-0.5 flex-shrink-0',
              event.type === 'request' &&
                'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
              event.type === 'response' &&
                'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
              event.type === 'error' &&
                'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
              event.type === 'info' &&
                'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800',
            )}
          >
            {getEventIcon(event.type)}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getEventVariant(event.type)} className="text-xs">
                {event.type.toUpperCase()}
              </Badge>

              {event.data.method && (
                <Badge variant="outline" className="text-xs font-mono">
                  {event.data.method}
                </Badge>
              )}

              {event.data.status && (
                <Badge
                  variant={getStatusCodeVariant(event.data.status)}
                  className="text-xs font-mono"
                >
                  {event.data.status}
                </Badge>
              )}

              <span className="text-xs text-muted-foreground font-mono">
                {event.source}
              </span>

              <div className="flex-1" />

              <StreamTimestamp timestamp={event.timestamp} format="time" />

              {hasExpandableContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleToggle}
                >
                  <svg
                    className={cn(
                      'h-3 w-3 transition-transform duration-200',
                      isExpanded && 'rotate-90',
                    )}
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
            </div>

            {/* URL or Message */}
            <div className="mb-2">
              {event.data.url && (
                <div className="text-sm font-mono text-foreground break-all">
                  {event.data.url}
                </div>
              )}
              {event.data.message && (
                <div className="text-sm text-foreground">
                  {event.data.message}
                </div>
              )}
              {event.data.error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {typeof event.data.error === 'string'
                    ? event.data.error
                    : typeof event.data.error === 'object' &&
                        event.data.error !== null &&
                        'message' in event.data.error
                      ? (event.data.error as { message: string }).message
                      : JSON.stringify(event.data.error)}
                </div>
              )}
            </div>

            {/* Expanded Content */}
            {isExpanded && hasExpandableContent && (
              <div className="space-y-3 mt-3 pt-3 border-t border-border">
                {event.data.headers &&
                  Object.keys(event.data.headers).length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Headers
                      </h4>
                      <JSONFormatter
                        data={event.data.headers}
                        maxDepth={2}
                        theme="dark"
                        className="text-xs"
                      />
                    </div>
                  )}

                {event.data.body !== undefined && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {event.type === 'request'
                        ? 'Request Body'
                        : 'Response Body'}
                    </h4>
                    <JSONFormatter
                      data={event.data.body}
                      maxDepth={3}
                      theme="dark"
                      className="text-xs"
                    />
                  </div>
                )}

                {event.data.payload !== undefined && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Payload
                    </h4>
                    <JSONFormatter
                      data={event.data.payload}
                      maxDepth={3}
                      theme="dark"
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

StreamEntry.displayName = 'StreamEntry';
