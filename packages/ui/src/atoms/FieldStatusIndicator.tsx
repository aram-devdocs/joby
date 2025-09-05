import React from 'react';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface FieldStatusIndicatorProps {
  status: SyncStatus;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FieldStatusIndicator: React.FC<FieldStatusIndicatorProps> = ({
  status,
  message,
  size = 'md',
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-4 w-4';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'syncing':
        return 'text-yellow-500';
      case 'synced':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    if (message) return message;
    switch (status) {
      case 'syncing':
        return 'Syncing...';
      case 'synced':
        return 'Synced';
      case 'error':
        return 'Sync error';
      default:
        return 'Ready';
    }
  };

  const sizeClasses = getSizeClasses();
  const colorClasses = getStatusColor();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {status === 'idle' && (
        <div
          className={`${sizeClasses} rounded-full bg-gray-300`}
          aria-hidden="true"
        />
      )}
      {status === 'syncing' && (
        <svg
          className={`${sizeClasses} animate-spin ${colorClasses}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Syncing"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {status === 'synced' && (
        <svg
          className={`${sizeClasses} ${colorClasses}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Synced"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      {status === 'error' && (
        <svg
          className={`${sizeClasses} ${colorClasses}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Error"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      {message && (
        <span className={`text-xs ${colorClasses}`}>{getStatusText()}</span>
      )}
    </div>
  );
};
