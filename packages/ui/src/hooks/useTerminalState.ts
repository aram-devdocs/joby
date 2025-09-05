import { useState, useCallback, useEffect } from 'react';
import type { TerminalState, TerminalTab } from '../types/terminal';

interface TerminalStateOptions {
  persistKey?: string;
  maxTabs?: number;
  defaultHeight?: number;
}

interface TerminalStateReturn {
  state: TerminalState;
  height: number;
  isResizing: boolean;
  actions: {
    // Tab management
    createTab: (label?: string) => string;
    closeTab: (tabId: string) => void;
    switchTab: (tabId: string) => void;
    updateTab: (tabId: string, updates: Partial<TerminalTab>) => void;

    // UI state
    toggleCollapsed: () => void;
    toggleDarkMode: () => void;
    setHeight: (height: number) => void;
    startResize: () => void;
    stopResize: () => void;

    // Preferences
    updatePreferences: (preferences: Partial<TerminalPreferences>) => void;
    resetToDefaults: () => void;
  };
}

interface TerminalPreferences {
  darkMode: boolean;
  defaultHeight: number;
  autoScroll: boolean;
  maxEvents: number;
  theme: 'dark' | 'light' | 'auto';
}

const DEFAULT_OPTIONS: Required<TerminalStateOptions> = {
  persistKey: 'terminal-state',
  maxTabs: 5,
  defaultHeight: 400,
};

const DEFAULT_PREFERENCES: TerminalPreferences = {
  darkMode: true,
  defaultHeight: 400,
  autoScroll: true,
  maxEvents: 1000,
  theme: 'auto',
};

const DEFAULT_TERMINAL_STATE: TerminalState = {
  activeTab: '',
  tabs: [],
  filters: {
    search: '',
    types: [],
    sources: [],
    dateRange: {},
    showOnlyErrors: false,
  },
  darkMode: true,
  collapsed: true,
};

const createDefaultTab = (id: string, label: string): TerminalTab => ({
  id,
  label,
  context: {
    sessionId: `session-${id}`,
    events: [],
    isConnected: false,
    lastActivity: 0,
  },
  filters: {
    search: '',
    types: [],
    sources: [],
    dateRange: {},
    showOnlyErrors: false,
  },
});

export function useTerminalState(
  options: TerminalStateOptions = {},
): TerminalStateReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Load persisted state
  const [state, setState] = useState<TerminalState>(() => {
    const saved = localStorage.getItem(opts.persistKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure we have at least one tab
        if (parsed.tabs.length === 0) {
          const mainTab = createDefaultTab('main', 'Main Stream');
          return {
            ...DEFAULT_TERMINAL_STATE,
            ...parsed,
            tabs: [mainTab],
            activeTab: mainTab.id,
          };
        }
        return { ...DEFAULT_TERMINAL_STATE, ...parsed };
      } catch {
        // Fall through to default state
      }
    }

    // Create initial state with main tab
    const mainTab = createDefaultTab('main', 'Main Stream');
    return {
      ...DEFAULT_TERMINAL_STATE,
      tabs: [mainTab],
      activeTab: mainTab.id,
    };
  });

  const [height, setHeightState] = useState(() => {
    const saved = localStorage.getItem(`${opts.persistKey}-height`);
    return saved ? parseInt(saved, 10) : opts.defaultHeight;
  });

  const [isResizing, setIsResizing] = useState(false);

  const [preferences, setPreferences] = useState<TerminalPreferences>(() => {
    const saved = localStorage.getItem(`${opts.persistKey}-preferences`);
    if (saved) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
  });

  // Persist state changes
  useEffect(() => {
    const stateToSave = {
      activeTab: state.activeTab,
      collapsed: state.collapsed,
      darkMode: state.darkMode,
      tabs: state.tabs.map((tab) => ({
        ...tab,
        // Don't persist events to avoid large localStorage entries
        context: {
          ...tab.context,
          events: [],
        },
      })),
    };
    localStorage.setItem(opts.persistKey, JSON.stringify(stateToSave));
  }, [state, opts.persistKey]);

  // Persist height changes
  useEffect(() => {
    localStorage.setItem(`${opts.persistKey}-height`, height.toString());
  }, [height, opts.persistKey]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem(
      `${opts.persistKey}-preferences`,
      JSON.stringify(preferences),
    );
  }, [preferences, opts.persistKey]);

  // Tab management
  const createTab = useCallback(
    (label?: string): string => {
      const tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tabLabel = label || `Stream ${state.tabs.length + 1}`;
      const newTab = createDefaultTab(tabId, tabLabel);

      setState((prev) => {
        // Enforce max tabs limit
        let newTabs = [...prev.tabs];
        if (newTabs.length >= opts.maxTabs) {
          // Remove oldest tab (not active tab if possible)
          const oldestNonActive = newTabs.find(
            (tab) => tab.id !== prev.activeTab,
          );
          if (oldestNonActive) {
            newTabs = newTabs.filter((tab) => tab.id !== oldestNonActive.id);
          } else {
            newTabs = newTabs.slice(1); // Remove first tab
          }
        }

        return {
          ...prev,
          tabs: [...newTabs, newTab],
          activeTab: tabId,
          collapsed: false, // Show terminal when creating new tab
        };
      });

      return tabId;
    },
    [state.tabs.length, opts.maxTabs],
  );

  const closeTab = useCallback((tabId: string) => {
    setState((prev) => {
      if (prev.tabs.length <= 1) {
        return prev; // Don't close the last tab
      }

      const tabIndex = prev.tabs.findIndex((tab) => tab.id === tabId);
      const newTabs = prev.tabs.filter((tab) => tab.id !== tabId);

      let newActiveTab = prev.activeTab;
      if (tabId === prev.activeTab) {
        // Switch to next available tab
        if (tabIndex < newTabs.length && newTabs[tabIndex]) {
          newActiveTab = newTabs[tabIndex].id;
        } else if (newTabs.length > 0) {
          const lastTab = newTabs[newTabs.length - 1];
          if (lastTab) {
            newActiveTab = lastTab.id;
          }
        }
      }

      return {
        ...prev,
        tabs: newTabs,
        activeTab: newActiveTab,
      };
    });
  }, []);

  const switchTab = useCallback((tabId: string) => {
    setState((prev) => {
      const tabExists = prev.tabs.some((tab) => tab.id === tabId);
      if (!tabExists) return prev;

      return {
        ...prev,
        activeTab: tabId,
        collapsed: false, // Show terminal when switching tabs
      };
    });
  }, []);

  const updateTab = useCallback(
    (tabId: string, updates: Partial<TerminalTab>) => {
      setState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, ...updates } : tab,
        ),
      }));
    },
    [],
  );

  // UI state management
  const toggleCollapsed = useCallback(() => {
    setState((prev) => ({ ...prev, collapsed: !prev.collapsed }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState((prev) => ({ ...prev, darkMode: !prev.darkMode }));
    setPreferences((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const setHeight = useCallback((newHeight: number) => {
    const minHeight = 200;
    const maxHeight = window.innerHeight * 0.8;
    const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
    setHeightState(clampedHeight);
    setPreferences((prev) => ({ ...prev, defaultHeight: clampedHeight }));
  }, []);

  const startResize = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Preferences management
  const updatePreferences = useCallback(
    (updates: Partial<TerminalPreferences>) => {
      setPreferences((prev) => {
        const newPrefs = { ...prev, ...updates };

        // Apply preference changes to state
        setState((prevState) => ({
          ...prevState,
          darkMode: newPrefs.darkMode,
        }));

        // Apply height if changed
        if (updates.defaultHeight !== undefined) {
          setHeightState(updates.defaultHeight);
        }

        return newPrefs;
      });
    },
    [],
  );

  const resetToDefaults = useCallback(() => {
    const mainTab = createDefaultTab('main', 'Main Stream');
    setState({
      ...DEFAULT_TERMINAL_STATE,
      tabs: [mainTab],
      activeTab: mainTab.id,
    });
    setHeightState(DEFAULT_PREFERENCES.defaultHeight);
    setPreferences(DEFAULT_PREFERENCES);

    // Clear persisted data
    localStorage.removeItem(opts.persistKey);
    localStorage.removeItem(`${opts.persistKey}-height`);
    localStorage.removeItem(`${opts.persistKey}-preferences`);
  }, [opts.persistKey]);

  return {
    state,
    height,
    isResizing,
    actions: {
      createTab,
      closeTab,
      switchTab,
      updateTab,
      toggleCollapsed,
      toggleDarkMode,
      setHeight,
      startResize,
      stopResize,
      updatePreferences,
      resetToDefaults,
    },
  };
}
