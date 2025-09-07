import React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import type { FilterChipProps } from '../types/terminal';

export const FilterChip = React.forwardRef<HTMLDivElement, FilterChipProps>(
  (
    { label, value, onRemove, variant = 'default', className, ...props },
    ref,
  ) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'type':
          return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
        case 'source':
          return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
        case 'error':
          return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
        case 'default':
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium',
          'transition-colors duration-200',
          getVariantStyles(),
          className,
        )}
        {...props}
      >
        <span className="truncate max-w-[120px]" title={`${label}: ${value}`}>
          {label && (
            <>
              <span className="opacity-75">{label}:</span>{' '}
            </>
          )}
          {value}
        </span>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-3 w-3 p-0 rounded-full hover:bg-black/10 dark:hover:bg-white/10',
              'transition-colors duration-200',
            )}
            onClick={() => onRemove(value)}
            aria-label={`Remove filter: ${label || value}`}
          >
            <svg
              className="h-2 w-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        )}
      </div>
    );
  },
);

FilterChip.displayName = 'FilterChip';
