import type {
  FieldEnhancer,
  FieldContext,
  FieldEnhancement,
  EnhancementCache,
  EnhancementConfig,
  LLMStatus,
  LLMConnectionStatus,
  EnhancementDetails,
} from './types';
import { SimpleMemoryCache } from './cache/SimpleMemoryCache';
import { LLMEnhancer } from './enhancers/LLMEnhancer';

export class FieldEnhancementService {
  private enhancers: FieldEnhancer[] = [];
  private cache: EnhancementCache;
  private config: EnhancementConfig;
  private static instance: FieldEnhancementService | null = null;
  private llmStatus: LLMConnectionStatus = {
    status: 'disconnected',
    message: 'Not connected to Ollama',
  };
  private enhancementHistory: Map<string, EnhancementDetails> = new Map();
  private connectionRetryTimer?: NodeJS.Timeout;
  private retryCount = 0;
  private maxRetries = 10;

  constructor(config?: EnhancementConfig) {
    this.config = {
      enableCache: true,
      cacheConfig: {
        maxSize: 1000,
        ttlSeconds: 3600,
      },
      llmConfig: {
        model: 'llama2',
        temperature: 0.1,
        maxRetries: 2,
        timeoutMs: 5000,
        autoConnect: true,
        retryDelayMs: 1000,
        maxConnectionRetries: 10,
      },
      confidenceThresholds: {
        high: 0.8,
        medium: 0.5,
        low: 0.3,
      },
      ...config,
    };

    this.cache = new SimpleMemoryCache(
      this.config.cacheConfig?.maxSize,
      this.config.cacheConfig?.ttlSeconds,
    );

    this.initializeEnhancers();

    // Auto-connect to Ollama if configured
    if (this.config.llmConfig?.autoConnect) {
      this.connectToOllama();
    }
  }

  static getInstance(config?: EnhancementConfig): FieldEnhancementService {
    if (!FieldEnhancementService.instance) {
      FieldEnhancementService.instance = new FieldEnhancementService(config);
    }
    return FieldEnhancementService.instance;
  }

  private initializeEnhancers(): void {
    // Always initialize LLM enhancer
    const llmEnhancer = new LLMEnhancer(this.config.llmConfig);
    this.registerEnhancer(llmEnhancer);
  }

  async connectToOllama(): Promise<{ success: boolean; status: LLMStatus }> {
    this.updateLLMStatus('connecting', 'Connecting to Ollama...');

    try {
      // Get the LLM enhancer
      const llmEnhancer = this.enhancers.find(
        (e) => e.name === 'LLMEnhancer',
      ) as LLMEnhancer | undefined;

      if (!llmEnhancer) {
        throw new Error('LLM Enhancer not initialized');
      }

      // Test connection (this would need to be implemented in LLMEnhancer)
      const connected = await llmEnhancer.testConnection();

      if (connected) {
        this.updateLLMStatus('connected', 'Connected to Ollama');
        this.retryCount = 0;
        return { success: true, status: 'connected' };
      } else {
        throw new Error('Failed to connect to Ollama');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.updateLLMStatus('error', `Connection failed: ${errorMessage}`);

      // Schedule retry with exponential backoff
      if (this.retryCount < this.maxRetries) {
        this.scheduleRetry();
      }

      return { success: false, status: 'error' };
    }
  }

  private scheduleRetry(): void {
    if (this.connectionRetryTimer) {
      clearTimeout(this.connectionRetryTimer);
    }

    const delay = Math.min(
      (this.config.llmConfig?.retryDelayMs || 1000) *
        Math.pow(2, this.retryCount),
      30000, // Max 30 seconds
    );

    this.retryCount++;
    const nextRetryAt = Date.now() + delay;

    this.llmStatus = {
      ...this.llmStatus,
      retryCount: this.retryCount,
      nextRetryAt,
    };

    this.connectionRetryTimer = setTimeout(() => {
      this.connectToOllama();
    }, delay);
  }

  disconnect(): { success: boolean } {
    if (this.connectionRetryTimer) {
      clearTimeout(this.connectionRetryTimer);
    }

    this.updateLLMStatus('disconnected', 'Disconnected from Ollama');
    this.retryCount = 0;

    return { success: true };
  }

  private updateLLMStatus(status: LLMStatus, message?: string): void {
    const now = Date.now();

    this.llmStatus = {
      status,
      ...(message !== undefined && { message }),
      ...(status === 'error' &&
        message !== undefined && { lastError: message }),
      ...(status === 'connected' && { connectedAt: now }),
      ...(status === 'disconnected' && { disconnectedAt: now }),
      ...(this.llmStatus.retryCount !== undefined && {
        retryCount: this.llmStatus.retryCount,
      }),
      ...(this.llmStatus.nextRetryAt !== undefined && {
        nextRetryAt: this.llmStatus.nextRetryAt,
      }),
    };
  }

  getLLMStatus(): LLMConnectionStatus {
    return { ...this.llmStatus };
  }

  registerEnhancer(enhancer: FieldEnhancer): void {
    this.enhancers.push(enhancer);
    this.enhancers.sort((a, b) => a.priority - b.priority);
  }

  async enhanceField(context: FieldContext): Promise<FieldEnhancement> {
    const cacheKey = SimpleMemoryCache.createCacheKey(context.element);
    const startTime = Date.now();

    if (this.config.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { ...cached, source: 'cache' };
      }
    }

    const mergedEnhancement: FieldEnhancement = {
      confidence: 0,
      source: 'hybrid',
    };

    // Update status to processing when using LLM
    const hasLLMEnhancer = this.enhancers.some(
      (e) => e.name === 'LLMEnhancer' && e.isEnabled,
    );
    if (hasLLMEnhancer && this.llmStatus.status === 'connected') {
      this.updateLLMStatus('processing', 'Processing field enhancement...');
    }

    const enabledEnhancers = this.enhancers.filter((e) => e.isEnabled);
    const enhancementPromises = enabledEnhancers
      .filter((enhancer) => enhancer.canEnhance(context))
      .map(async (enhancer) => {
        try {
          const enhancement = await enhancer.enhance(context);

          // Store enhancement details if from LLM
          if (enhancement && enhancer.name === 'LLMEnhancer') {
            const details: EnhancementDetails = {
              prompt: this.createPromptFromContext(context),
              response: JSON.stringify(enhancement),
              timestamp: Date.now(),
              duration: Date.now() - startTime,
              ...(this.config.llmConfig?.model && {
                model: this.config.llmConfig.model,
              }),
            };

            this.enhancementHistory.set(cacheKey, details);

            if (enhancement) {
              enhancement.enhancementDetails = details;
            }
          }

          return enhancement;
        } catch (error) {
          // Store error details
          if (enhancer.name === 'LLMEnhancer') {
            const details: EnhancementDetails = {
              prompt: this.createPromptFromContext(context),
              response: '',
              timestamp: Date.now(),
              duration: Date.now() - startTime,
              ...(this.config.llmConfig?.model && {
                model: this.config.llmConfig.model,
              }),
              error: error instanceof Error ? error.message : 'Unknown error',
            };

            this.enhancementHistory.set(cacheKey, details);
          }
          return null;
        }
      });

    const results = await Promise.allSettled(enhancementPromises);
    const successfulEnhancements = results
      .filter(
        (r): r is PromiseFulfilledResult<FieldEnhancement | null> =>
          r.status === 'fulfilled' && r.value !== null,
      )
      .map((r) => r.value as FieldEnhancement);

    for (const enhancement of successfulEnhancements) {
      if (enhancement.confidence > mergedEnhancement.confidence) {
        if (enhancement.fieldType !== undefined) {
          mergedEnhancement.fieldType = enhancement.fieldType;
        }
        if (enhancement.label !== undefined) {
          mergedEnhancement.label = enhancement.label;
        }
        if (enhancement.validation !== undefined) {
          mergedEnhancement.validation = enhancement.validation;
        }
        mergedEnhancement.confidence = Math.max(
          mergedEnhancement.confidence,
          enhancement.confidence,
        );
        mergedEnhancement.metadata = {
          ...mergedEnhancement.metadata,
          ...enhancement.metadata,
        };
      }
    }

    if (successfulEnhancements.length === 1 && successfulEnhancements[0]) {
      mergedEnhancement.source = successfulEnhancements[0].source;
    }

    if (this.config.enableCache && mergedEnhancement.confidence > 0) {
      this.cache.set(cacheKey, mergedEnhancement);
    }

    // Update status back to connected after processing
    if (hasLLMEnhancer && this.llmStatus.status === 'processing') {
      this.updateLLMStatus('connected', 'Ready');
    }

    return mergedEnhancement;
  }

  private createPromptFromContext(context: FieldContext): string {
    // Create a prompt from the field context for transparency
    const parts = [
      `Analyze this form field:`,
      `Type: ${context.element.type || 'unknown'}`,
      `Name: ${context.element.name || 'unnamed'}`,
      `Label: ${context.element.label || 'no label'}`,
      `Placeholder: ${context.element.placeholder || 'none'}`,
    ];

    if (context.formContext) {
      parts.push(`Form: ${context.formContext.formName || 'unnamed form'}`);
    }

    if (context.pageContext) {
      parts.push(
        `Page: ${context.pageContext.pageTitle || context.pageContext.pageUrl || 'unknown page'}`,
      );
    }

    return parts.join('\n');
  }

  async enhanceFields(contexts: FieldContext[]): Promise<FieldEnhancement[]> {
    const batchSize = 10;
    const results: FieldEnhancement[] = [];

    for (let i = 0; i < contexts.length; i += batchSize) {
      const batch = contexts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((context) => this.enhanceField(context)),
      );
      results.push(...batchResults);
    }

    return results;
  }

  getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' | 'none' {
    const thresholds = this.config.confidenceThresholds;
    if (!thresholds) return 'none';

    const { high = 0.8, medium = 0.5, low = 0.3 } = thresholds;
    if (confidence >= high) return 'high';
    if (confidence >= medium) return 'medium';
    if (confidence >= low) return 'low';
    return 'none';
  }

  clearCache(): void {
    this.cache.clear();
  }

  getEnhancementDetails(fieldKey: string): EnhancementDetails | undefined {
    return this.enhancementHistory.get(fieldKey);
  }

  clearEnhancementHistory(): void {
    this.enhancementHistory.clear();
  }

  getConfig(): EnhancementConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<EnhancementConfig>): void {
    this.config = { ...this.config, ...config };
    this.enhancers = [];
    this.initializeEnhancers();

    // Reconnect if model changed
    if (config.llmConfig?.model) {
      this.connectToOllama();
    }
  }

  /**
   * Set the LLM model to use for enhancement
   */
  setModel(model: string): void {
    this.updateConfig({
      llmConfig: {
        ...this.config.llmConfig,
        model,
      },
    });
  }

  /**
   * Get enhancement details for a specific field
   */
  getFieldEnhancementDetails(fieldId: string): EnhancementDetails | undefined {
    // Try to get from history using the field ID
    return (
      this.enhancementHistory.get(fieldId) ||
      this.getEnhancementDetails(fieldId)
    );
  }
}
