import React from 'react';
import { cn } from '../lib/utils';
import type { StreamTimestampProps } from '../types/terminal';

const formatTimestamp = (
  timestamp: number,
  format: 'relative' | 'absolute' | 'time',
): string => {
  const date = new Date(timestamp);
  const now = new Date();

  switch (format) {
    case 'relative': {
      const diff = now.getTime() - timestamp;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      if (seconds > 10) return `${seconds}s ago`;
      return 'now';
    }
    case 'time':
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
      });
    case 'absolute':
    default:
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
  }
};

export const StreamTimestamp = React.forwardRef<
  HTMLSpanElement,
  StreamTimestampProps
>(({ timestamp, format = 'relative', className, ...props }, ref) => {
  const [displayTime, setDisplayTime] = React.useState(() =>
    formatTimestamp(timestamp, format),
  );

  React.useEffect(() => {
    if (format !== 'relative') {
      setDisplayTime(formatTimestamp(timestamp, format));
      return;
    }

    // Update relative timestamps every 10 seconds
    const interval = setInterval(() => {
      setDisplayTime(formatTimestamp(timestamp, format));
    }, 10000);

    return () => clearInterval(interval);
  }, [timestamp, format]);

  return (
    <span
      ref={ref}
      className={cn(
        'text-xs font-mono text-muted-foreground',
        'whitespace-nowrap select-none',
        format === 'relative' && 'min-w-[3rem]',
        className,
      )}
      title={formatTimestamp(timestamp, 'absolute')}
      {...props}
    >
      {displayTime}
    </span>
  );
});

StreamTimestamp.displayName = 'StreamTimestamp';
