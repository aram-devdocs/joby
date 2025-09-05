import React from 'react';
import { cn } from '../lib/utils';
import { Button } from '../atoms/button';
import { Badge } from '../atoms/badge';
import { StreamTimestamp } from '../atoms/StreamTimestamp';
import type { StreamHeaderProps } from '../types/terminal';

export const StreamHeader = React.forwardRef<HTMLDivElement, StreamHeaderProps>(
  (
    {
      context,
      onClear,
      onExport,
      onPause,
      isPaused = false,
      className,
      ...props
    },
    ref,
  ) => {
    const eventCounts = React.useMemo(() => {
      const counts = {
        total: context.events.length,
        requests: 0,
        responses: 0,
        errors: 0,
        info: 0,
      };

      context.events.forEach((event) => {
        switch (event.type) {
          case 'request':
            counts.requests++;
            break;
          case 'response':
            counts.responses++;
            break;
          case 'error':
            counts.errors++;
            break;
          case 'info':
            counts.info++;
            break;
        }
      });

      return counts;
    }, [context.events]);

    const lastActivity = React.useMemo(() => {
      if (context.events.length === 0) return null;
      return Math.max(...context.events.map((e) => e.timestamp));
    }, [context.events]);

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between border-b border-border bg-background px-3 py-2',
          className,
        )}
        {...props}
      >
        {/* Left side - Status and Stats */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                context.isConnected
                  ? isPaused
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                  : 'bg-red-500',
              )}
            />
            <span className="text-sm font-medium">
              {context.isConnected
                ? isPaused
                  ? 'Paused'
                  : 'Connected'
                : 'Disconnected'}
            </span>
          </div>

          {/* Event Counts */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {eventCounts.total} total
            </Badge>

            {eventCounts.requests > 0 && (
              <Badge
                variant="outline"
                className="text-xs text-blue-600 border-blue-200"
              >
                {eventCounts.requests} req
              </Badge>
            )}

            {eventCounts.responses > 0 && (
              <Badge
                variant="outline"
                className="text-xs text-green-600 border-green-200"
              >
                {eventCounts.responses} res
              </Badge>
            )}

            {eventCounts.errors > 0 && (
              <Badge variant="destructive" className="text-xs">
                {eventCounts.errors} err
              </Badge>
            )}

            {eventCounts.info > 0 && (
              <Badge variant="secondary" className="text-xs">
                {eventCounts.info} info
              </Badge>
            )}
          </div>

          {/* Last Activity */}
          {lastActivity && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Last:</span>
              <StreamTimestamp timestamp={lastActivity} format="relative" />
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1">
          {/* Session ID */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono mr-2">
            <span>ID:</span>
            <span className="bg-muted px-1 py-0.5 rounded">
              {context.sessionId.slice(-8)}
            </span>
          </div>

          {/* Pause/Resume */}
          {onPause && context.isConnected && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onPause}
              title={isPaused ? 'Resume streaming' : 'Pause streaming'}
            >
              {isPaused ? (
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
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 12h1m4 0h1M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              )}
            </Button>
          )}

          {/* Export */}
          {onExport && eventCounts.total > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onExport}
              title="Export events"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
            </Button>
          )}

          {/* Clear */}
          {onClear && eventCounts.total > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
              onClick={onClear}
              title="Clear all events"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
          )}
        </div>
      </div>
    );
  },
);

StreamHeader.displayName = 'StreamHeader';
