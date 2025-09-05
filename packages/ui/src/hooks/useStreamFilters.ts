import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  StreamEvent,
  StreamFilter,
  StreamEventType,
} from '../types/terminal';

interface StreamFiltersOptions {
  persistKey?: string;
  debounceMs?: number;
  caseSensitive?: boolean;
}

interface StreamFiltersReturn {
  filters: StreamFilter;
  filteredEvents: StreamEvent[];
  availableSources: string[];
  availableTypes: StreamEventType[];
  activeFilterCount: number;
  actions: {
    // Filter setters
    setSearch: (search: string) => void;
    setTypes: (types: StreamEventType[]) => void;
    setSources: (sources: string[]) => void;
    setDateRange: (range: { start?: number; end?: number }) => void;
    setShowOnlyErrors: (showOnlyErrors: boolean) => void;

    // Bulk operations
    updateFilters: (updates: Partial<StreamFilter>) => void;
    resetFilters: () => void;

    // Toggle operations
    toggleType: (type: StreamEventType) => void;
    toggleSource: (source: string) => void;

    // Presets
    applyErrorsOnly: () => void;
    applyLastHour: () => void;
    applyLastDay: () => void;
  };
}

const DEFAULT_OPTIONS: Required<StreamFiltersOptions> = {
  persistKey: 'stream-filters',
  debounceMs: 300,
  caseSensitive: false,
};

const DEFAULT_FILTERS: StreamFilter = {
  search: '',
  types: [],
  sources: [],
  dateRange: {},
  showOnlyErrors: false,
};

export function useStreamFilters(
  events: StreamEvent[],
  options: StreamFiltersOptions = {},
): StreamFiltersReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Load persisted filters
  const [filters, setFilters] = useState<StreamFilter>(() => {
    const saved = localStorage.getItem(opts.persistKey);
    if (saved) {
      try {
        return { ...DEFAULT_FILTERS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_FILTERS;
      }
    }
    return DEFAULT_FILTERS;
  });

  // Persist filter changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(opts.persistKey, JSON.stringify(filters));
    }, opts.debounceMs);

    return () => clearTimeout(timeout);
  }, [filters, opts.persistKey, opts.debounceMs]);

  // Extract available sources and types from events
  const { availableSources, availableTypes } = useMemo(() => {
    const sources = new Set<string>();
    const types = new Set<StreamEventType>();

    events.forEach((event) => {
      sources.add(event.source);
      types.add(event.type);
    });

    return {
      availableSources: Array.from(sources).sort(),
      availableTypes: Array.from(types).sort(),
    };
  }, [events]);

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = opts.caseSensitive
        ? filters.search.trim()
        : filters.search.trim().toLowerCase();

      filtered = filtered.filter((event) => {
        const searchableText = [
          event.source,
          event.type,
          event.data.message || '',
          event.data.error || '',
          event.data.url || '',
          JSON.stringify(event.data.payload || {}),
        ].join(' ');

        const searchTarget = opts.caseSensitive
          ? searchableText
          : searchableText.toLowerCase();

        return searchTarget.includes(searchTerm);
      });
    }

    // Type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter((event) => filters.types.includes(event.type));
    }

    // Source filter
    if (filters.sources.length > 0) {
      filtered = filtered.filter((event) =>
        filters.sources.includes(event.source),
      );
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter((event) => {
        const timestamp = event.timestamp;

        if (filters.dateRange.start && timestamp < filters.dateRange.start) {
          return false;
        }

        if (filters.dateRange.end && timestamp > filters.dateRange.end) {
          return false;
        }

        return true;
      });
    }

    // Show only errors filter
    if (filters.showOnlyErrors) {
      filtered = filtered.filter(
        (event) =>
          event.type === 'error' ||
          event.data.error ||
          (event.data.status && event.data.status >= 400),
      );
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [events, filters, opts.caseSensitive]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.types.length > 0) count++;
    if (filters.sources.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.showOnlyErrors) count++;
    return count;
  }, [filters]);

  // Filter setters
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setTypes = useCallback((types: StreamEventType[]) => {
    setFilters((prev) => ({ ...prev, types }));
  }, []);

  const setSources = useCallback((sources: string[]) => {
    setFilters((prev) => ({ ...prev, sources }));
  }, []);

  const setDateRange = useCallback(
    (dateRange: { start?: number; end?: number }) => {
      setFilters((prev) => ({ ...prev, dateRange }));
    },
    [],
  );

  const setShowOnlyErrors = useCallback((showOnlyErrors: boolean) => {
    setFilters((prev) => ({ ...prev, showOnlyErrors }));
  }, []);

  // Bulk operations
  const updateFilters = useCallback((updates: Partial<StreamFilter>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    localStorage.removeItem(opts.persistKey);
  }, [opts.persistKey]);

  // Toggle operations
  const toggleType = useCallback((type: StreamEventType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  }, []);

  const toggleSource = useCallback((source: string) => {
    setFilters((prev) => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter((s) => s !== source)
        : [...prev.sources, source],
    }));
  }, []);

  // Preset operations
  const applyErrorsOnly = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      showOnlyErrors: true,
      types: ['error'],
    }));
  }, []);

  const applyLastHour = useCallback(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    setFilters((prev) => ({
      ...prev,
      dateRange: { start: oneHourAgo },
    }));
  }, []);

  const applyLastDay = useCallback(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    setFilters((prev) => ({
      ...prev,
      dateRange: { start: oneDayAgo },
    }));
  }, []);

  return {
    filters,
    filteredEvents,
    availableSources,
    availableTypes,
    activeFilterCount,
    actions: {
      setSearch,
      setTypes,
      setSources,
      setDateRange,
      setShowOnlyErrors,
      updateFilters,
      resetFilters,
      toggleType,
      toggleSource,
      applyErrorsOnly,
      applyLastHour,
      applyLastDay,
    },
  };
}
