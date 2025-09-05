export interface FieldEnhancement {
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
  source: 'llm' | 'cache' | 'hybrid';
  metadata?: Record<string, unknown>;
}

export interface FieldContext {
  element: {
    type?: string;
    name?: string;
    id?: string;
    placeholder?: string;
    value?: string;
    label?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    autocomplete?: string;
    pattern?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: string;
    max?: string;
  };
  surroundingText?: string[];
  siblingFields?: Array<{
    type?: string;
    name?: string;
    label?: string;
  }>;
  formContext?: {
    formName?: string;
    formAction?: string;
    sectionName?: string;
  };
  pageContext?: {
    pageTitle?: string;
    pageUrl?: string;
  };
}

export interface FieldEnhancer {
  name: string;
  priority: number;
  isEnabled: boolean;
  canEnhance(context: FieldContext): boolean;
  enhance(context: FieldContext): Promise<FieldEnhancement | null>;
}

export interface EnhancementCache {
  get(key: string): FieldEnhancement | null;
  set(key: string, value: FieldEnhancement, ttl?: number): void;
  clear(): void;
}

export interface EnhancementConfig {
  // enableStatic removed - pattern-based detection no longer supported
  enableLLM?: boolean;
  enableCache?: boolean;
  cacheConfig?: {
    maxSize?: number;
    ttlSeconds?: number;
  };
  llmConfig?: {
    model?: string;
    temperature?: number;
    maxRetries?: number;
    timeoutMs?: number;
  };
  confidenceThresholds?: {
    high?: number;
    medium?: number;
    low?: number;
  };
}
