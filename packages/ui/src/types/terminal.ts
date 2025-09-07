export interface StreamEvent {
  id: string;
  timestamp: number;
  type: 'request' | 'response' | 'error' | 'info';
  source: string;
  data: StreamData;
}

export interface StreamData {
  url?: string;
  method?: string;
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
  error?: string;
  message?: string;
  payload?: unknown;
}

export interface StreamContext {
  sessionId: string;
  events: StreamEvent[];
  isConnected: boolean;
  lastActivity: number;
}

export interface TerminalState {
  activeTab: string;
  tabs: TerminalTab[];
  filters: StreamFilter;
  darkMode: boolean;
  collapsed: boolean;
}

export interface TerminalTab {
  id: string;
  label: string;
  context: StreamContext;
  filters: StreamFilter;
}

export interface StreamFilter {
  search: string;
  types: StreamEventType[];
  sources: string[];
  dateRange: {
    start?: number;
    end?: number;
  };
  showOnlyErrors: boolean;
}

export type StreamEventType = StreamEvent['type'];

// Component prop interfaces
export interface StreamTimestampProps {
  timestamp: number;
  format?: 'relative' | 'absolute' | 'time';
  className?: string;
}

export interface JSONFormatterProps {
  data: unknown;
  collapsed?: boolean;
  maxDepth?: number;
  theme?: 'dark' | 'light';
  className?: string;
  onToggle?: (collapsed: boolean) => void;
}

export interface StreamEntryProps {
  event: StreamEvent;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
}

export interface FilterChipProps {
  label: string;
  value: string;
  onRemove?: (value: string) => void;
  variant?: 'default' | 'type' | 'source' | 'error';
  className?: string;
}

export interface TabSystemProps {
  tabs: TerminalTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onTabClose?: ((tabId: string) => void) | undefined;
  onTabAdd?: () => void;
  className?: string;
}

export interface StreamViewerProps {
  events: StreamEvent[];
  filters: StreamFilter;
  onEventToggle?: ((eventId: string, expanded: boolean) => void) | undefined;
  virtualizeThreshold?: number;
  className?: string;
}

export interface FilterControlsProps {
  filters: StreamFilter;
  availableSources: string[];
  onFiltersChange: (filters: Partial<StreamFilter>) => void;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  className?: string;
}

export interface StreamHeaderProps {
  context: StreamContext;
  onClear?: (() => void) | undefined;
  onExport?: (() => void) | undefined;
  onPause?: (() => void) | undefined;
  isPaused?: boolean;
  className?: string;
}

export interface TerminalContainerProps {
  state: TerminalState;
  onStateChange: (state: Partial<TerminalState>) => void;
  className?: string;
}

export interface StreamPanelProps {
  context: StreamContext;
  filters: StreamFilter;
  onFiltersChange: (filters: Partial<StreamFilter>) => void;
  onEventToggle?: ((eventId: string, expanded: boolean) => void) | undefined;
  className?: string;
}
