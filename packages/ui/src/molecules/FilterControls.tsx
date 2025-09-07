import React from 'react';
import { cn } from '../lib/utils';
import { Button } from '../atoms/button';
import { Input } from '../atoms/input';
// import { Select } from '../atoms/select'; // TODO: Add date range picker using Select
import { FilterChip } from '../atoms/FilterChip';
import type { FilterControlsProps, StreamEventType } from '../types/terminal';

const EVENT_TYPES: { value: StreamEventType; label: string }[] = [
  { value: 'request', label: 'Requests' },
  { value: 'response', label: 'Responses' },
  { value: 'error', label: 'Errors' },
  { value: 'info', label: 'Info' },
];

export const FilterControls = React.forwardRef<
  HTMLDivElement,
  FilterControlsProps
>(
  (
    {
      filters,
      availableSources,
      onFiltersChange,
      collapsed = false,
      onToggleCollapse,
      className,
      ...props
    },
    ref,
  ) => {
    const [searchValue, setSearchValue] = React.useState(filters.search || '');
    const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

    React.useEffect(() => {
      setIsCollapsed(collapsed);
    }, [collapsed]);

    React.useEffect(() => {
      setSearchValue(filters.search || '');
    }, [filters.search]);

    const handleToggleCollapse = () => {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      onToggleCollapse?.(newCollapsed);
    };

    const handleSearchChange = (value: string) => {
      setSearchValue(value);
      // Debounced search
      const timer = setTimeout(() => {
        onFiltersChange({ search: value });
      }, 300);
      return () => clearTimeout(timer);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        onFiltersChange({ search: searchValue });
      }
    };

    const handleTypeToggle = (type: StreamEventType) => {
      const newTypes = filters.types.includes(type)
        ? filters.types.filter((t) => t !== type)
        : [...filters.types, type];
      onFiltersChange({ types: newTypes });
    };

    const handleSourceToggle = (source: string) => {
      const newSources = filters.sources.includes(source)
        ? filters.sources.filter((s) => s !== source)
        : [...filters.sources, source];
      onFiltersChange({ sources: newSources });
    };

    const handleClearFilters = () => {
      setSearchValue('');
      onFiltersChange({
        search: '',
        types: [],
        sources: [],
        showOnlyErrors: false,
        dateRange: {},
      });
    };

    const getTotalActiveFilters = () => {
      let count = 0;
      if (filters.search) count++;
      if (filters.types.length > 0) count++;
      if (filters.sources.length > 0) count++;
      if (filters.showOnlyErrors) count++;
      if (filters.dateRange.start || filters.dateRange.end) count++;
      return count;
    };

    const totalFilters = getTotalActiveFilters();

    return (
      <div
        ref={ref}
        className={cn(
          'border-b border-border bg-background transition-all duration-200',
          isCollapsed ? 'h-12' : 'min-h-12',
          className,
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-12 px-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleToggleCollapse}
            >
              <svg
                className={cn(
                  'h-3 w-3 transition-transform duration-200',
                  isCollapsed && '-rotate-90',
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
            <span className="text-sm font-medium">Filters</span>
            {totalFilters > 0 && (
              <FilterChip
                label=""
                value={totalFilters.toString()}
                variant="default"
                className="h-5 text-xs"
              />
            )}
          </div>

          <div className="flex items-center gap-1">
            {totalFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={handleClearFilters}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        {!isCollapsed && (
          <div className="p-3 pt-0 space-y-3">
            {/* Search */}
            <div>
              <Input
                placeholder="Search events..."
                value={searchValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchValue(value);
                  handleSearchChange(value);
                }}
                onKeyPress={handleSearchKeyPress}
                className="h-8"
              />
            </div>

            {/* Event Types */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Event Types
              </label>
              <div className="flex flex-wrap gap-1">
                {EVENT_TYPES.map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={
                      filters.types.includes(value) ? 'default' : 'outline'
                    }
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleTypeToggle(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sources */}
            {availableSources.length > 0 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Sources
                </label>
                <div className="flex flex-wrap gap-1">
                  {availableSources.map((source) => (
                    <Button
                      key={source}
                      variant={
                        filters.sources.includes(source) ? 'default' : 'outline'
                      }
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => handleSourceToggle(source)}
                    >
                      {source}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Options */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Options
              </label>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={filters.showOnlyErrors ? 'destructive' : 'outline'}
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() =>
                    onFiltersChange({ showOnlyErrors: !filters.showOnlyErrors })
                  }
                >
                  Errors only
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            {totalFilters > 0 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Active Filters
                </label>
                <div className="flex flex-wrap gap-1">
                  {filters.search && (
                    <FilterChip
                      label="Search"
                      value={filters.search}
                      variant="default"
                      onRemove={() => {
                        setSearchValue('');
                        onFiltersChange({ search: '' });
                      }}
                    />
                  )}
                  {filters.types.map((type) => (
                    <FilterChip
                      key={type}
                      label="Type"
                      value={type}
                      variant="type"
                      onRemove={() => handleTypeToggle(type)}
                    />
                  ))}
                  {filters.sources.map((source) => (
                    <FilterChip
                      key={source}
                      label="Source"
                      value={source}
                      variant="source"
                      onRemove={() => handleSourceToggle(source)}
                    />
                  ))}
                  {filters.showOnlyErrors && (
                    <FilterChip
                      label="Option"
                      value="Errors only"
                      variant="error"
                      onRemove={() =>
                        onFiltersChange({ showOnlyErrors: false })
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

FilterControls.displayName = 'FilterControls';
