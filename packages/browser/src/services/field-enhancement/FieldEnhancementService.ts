import type {
  FieldEnhancer,
  FieldContext,
  FieldEnhancement,
  EnhancementCache,
  EnhancementConfig,
} from './types';
import { SimpleMemoryCache } from './cache/SimpleMemoryCache';
import { LLMEnhancer } from './enhancers/LLMEnhancer';

export class FieldEnhancementService {
  private enhancers: FieldEnhancer[] = [];
  private cache: EnhancementCache;
  private config: EnhancementConfig;
  private static instance: FieldEnhancementService | null = null;

  constructor(config?: EnhancementConfig) {
    this.config = {
      enableLLM: false,
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
  }

  static getInstance(config?: EnhancementConfig): FieldEnhancementService {
    if (!FieldEnhancementService.instance) {
      FieldEnhancementService.instance = new FieldEnhancementService(config);
    }
    return FieldEnhancementService.instance;
  }

  private initializeEnhancers(): void {
    if (this.config.enableLLM) {
      this.registerEnhancer(new LLMEnhancer(this.config.llmConfig));
    }
  }

  registerEnhancer(enhancer: FieldEnhancer): void {
    this.enhancers.push(enhancer);
    this.enhancers.sort((a, b) => a.priority - b.priority);
  }

  async enhanceField(context: FieldContext): Promise<FieldEnhancement> {
    const cacheKey = SimpleMemoryCache.createCacheKey(context.element);

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

    const enabledEnhancers = this.enhancers.filter((e) => e.isEnabled);
    const enhancementPromises = enabledEnhancers
      .filter((enhancer) => enhancer.canEnhance(context))
      .map(async (enhancer) => {
        try {
          return await enhancer.enhance(context);
        } catch {
          // Silently catch errors from individual enhancers
          // Enhancement will proceed with other enhancers
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

    return mergedEnhancement;
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

  enableLLM(enable: boolean): void {
    this.config.enableLLM = enable;
    if (enable && !this.enhancers.find((e) => e.name === 'LLMEnhancer')) {
      this.registerEnhancer(new LLMEnhancer(this.config.llmConfig));
    } else if (!enable) {
      const llmEnhancer = this.enhancers.find((e) => e.name === 'LLMEnhancer');
      if (llmEnhancer) {
        llmEnhancer.isEnabled = false;
      }
    }
  }

  getConfig(): EnhancementConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<EnhancementConfig>): void {
    this.config = { ...this.config, ...config };
    this.enhancers = [];
    this.initializeEnhancers();
  }
}
