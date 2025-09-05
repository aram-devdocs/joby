import * as React from 'react';
import { cn } from '../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

// Field skeleton for loading states
const FieldSkeleton: React.FC = () => {
  return (
    <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-2 w-2 rounded-full" />
      </div>

      {/* Value skeleton */}
      <Skeleton className="h-6 w-full" />
    </div>
  );
};

// Section skeleton
const SectionSkeleton: React.FC<{ fieldCount?: number }> = ({
  fieldCount = 3,
}) => {
  return (
    <div className="space-y-2">
      {/* Section header skeleton */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>

      {/* Fields skeleton */}
      <div className="space-y-2 pl-6">
        {Array.from({ length: fieldCount }, (_, i) => (
          <FieldSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export { Skeleton, FieldSkeleton, SectionSkeleton };
