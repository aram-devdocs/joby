import { EventEmitter } from 'events';

export interface BrowserConfig {
  userAgent?: string;
  partition?: string;
  preload?: string;
  nodeIntegration?: boolean;
  contextIsolation?: boolean;
  webSecurity?: boolean;
}

export interface NavigationEvent {
  url: string;
  title?: string;
  isMainFrame: boolean;
  timestamp: number;
}

export interface FormDetectionResult {
  url: string;
  forms: FormInfo[];
  timestamp: number;
}

export interface FormInfo {
  id?: string;
  name?: string;
  action?: string;
  method?: string;
  fields: FormField[];
}

export interface FormSelectOption {
  value: string;
  label: string;
  selected?: boolean;
}

export interface FormField {
  id?: string;
  name?: string;
  type: string;
  inputType?:
    | 'text'
    | 'email'
    | 'tel'
    | 'url'
    | 'number'
    | 'date'
    | 'password'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'textarea'
    | 'range'
    | 'color'
    | 'search';
  label?: string;
  placeholder?: string;
  required: boolean;
  value?: string;
  options?: FormSelectOption[] | string[];
  // Enhanced field targeting
  selector?: string; // CSS selector for precise field targeting
  xpath?: string; // XPath as fallback
  position?: { x: number; y: number; width: number; height: number }; // Visual position
  attributes?: Record<string, string>; // Additional attributes for identification
  section?: string; // Section/group this field belongs to
  // HTML5 validation attributes
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  multiple?: boolean;
  checked?: boolean;
  autocomplete?: string;
  // Field enhancement data from intelligent detection
  enhancement?: {
    fieldType?: string;
    label?: string;
    validation?: {
      pattern?: string;
      minLength?: number;
      maxLength?: number;
      min?: string | number;
      max?: string | number;
      required?: boolean;
      message?: string;
    };
    confidence: number;
    source: 'static' | 'llm' | 'cache' | 'hybrid';
  };
  validationRules?: Array<{
    type:
      | 'pattern'
      | 'minLength'
      | 'maxLength'
      | 'min'
      | 'max'
      | 'required'
      | 'email'
      | 'tel'
      | 'url';
    value?: string | number | boolean;
    message?: string;
  }>;
}

export class BrowserService extends EventEmitter {
  private config: BrowserConfig;
  private currentUrl?: string;
  private history: NavigationEvent[] = [];

  constructor(config: BrowserConfig = {}) {
    super();
    this.config = {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      ...config,
    };
  }

  getConfig(): BrowserConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<BrowserConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('config-updated', this.config);
  }

  getCurrentUrl(): string | undefined {
    return this.currentUrl;
  }

  getHistory(): NavigationEvent[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
    this.emit('history-cleared');
  }

  // Navigation tracking
  onNavigationStart(url: string): void {
    this.currentUrl = url;
    const event: NavigationEvent = {
      url,
      isMainFrame: true,
      timestamp: Date.now(),
    };
    this.history.push(event);
    this.emit('navigation-start', event);
  }

  onNavigationComplete(url: string, title?: string): void {
    this.currentUrl = url;
    const event: NavigationEvent = {
      url,
      title: title ?? '',
      isMainFrame: true,
      timestamp: Date.now(),
    };

    // Update the last history entry with title if available
    if (this.history.length > 0) {
      const lastEntry = this.history[this.history.length - 1];
      if (lastEntry && lastEntry.url === url && title !== undefined) {
        lastEntry.title = title;
      }
    }

    this.emit('navigation-complete', event);
  }

  // Form detection helpers
  detectJobSite(url: string): string | null {
    const jobSites: Record<string, RegExp> = {
      linkedin: /linkedin\.com\/jobs/i,
      indeed: /indeed\.com/i,
      glassdoor: /glassdoor\.com/i,
      workday: /myworkday\.com/i,
      greenhouse: /greenhouse\.io/i,
      lever: /lever\.co/i,
      taleo: /taleo\.net/i,
      icims: /icims\.com/i,
      angellist: /angel\.co|wellfound\.com/i,
      monster: /monster\.com/i,
      ziprecruiter: /ziprecruiter\.com/i,
    };

    for (const [site, pattern] of Object.entries(jobSites)) {
      if (pattern.test(url)) {
        return site;
      }
    }

    return null;
  }

  isJobApplicationUrl(url: string): boolean {
    const patterns = [
      /apply/i,
      /application/i,
      /careers/i,
      /jobs/i,
      /submit/i,
      /candidate/i,
      /recruitment/i,
      /hiring/i,
      /join/i,
      /opportunity/i,
    ];

    return patterns.some((pattern) => pattern.test(url));
  }
}
