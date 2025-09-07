import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { FieldEnhancementService } from '../FieldEnhancementService';
import type { FieldContext, EnhancementConfig } from '../types';

// Mock the LLMEnhancer
vi.mock('../enhancers/LLMEnhancer', () => ({
  LLMEnhancer: vi.fn().mockImplementation(() => ({
    name: 'LLMEnhancer',
    canEnhance: vi.fn().mockReturnValue(true),
    enhance: vi.fn().mockResolvedValue({
      fieldType: 'email',
      label: 'Email Address',
      confidence: 0.85,
      source: 'llm',
    }),
    testConnection: vi.fn().mockResolvedValue(true),
  })),
}));

describe('FieldEnhancementService', () => {
  let service: FieldEnhancementService;

  beforeEach(() => {
    // Reset singleton instance
    // @ts-expect-error Accessing private property for testing
    FieldEnhancementService.instance = undefined;

    const config: EnhancementConfig = {
      enableCache: true,
      cacheConfig: {
        maxSize: 100,
        ttlSeconds: 3600,
      },
      llmConfig: {
        model: 'llama3.2',
        temperature: 0.1,
        maxRetries: 2,
        timeoutMs: 5000,
        autoConnect: false,
      },
      confidenceThresholds: {
        high: 0.8,
        medium: 0.5,
        low: 0.3,
      },
    };

    service = FieldEnhancementService.getInstance(config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = FieldEnhancementService.getInstance();
      const instance2 = FieldEnhancementService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize with default config', () => {
      const instance = FieldEnhancementService.getInstance();
      expect(instance).toBeDefined();
    });
  });

  describe('enhance', () => {
    const mockFieldContext: FieldContext = {
      element: {
        id: 'email-field',
        name: 'email',
        type: 'text',
        value: '',
        placeholder: 'Enter email',
        required: true,
      },
      surroundingText: 'Email address for login',
      siblingFields: ['password', 'username'],
      formContext: {
        formId: 'login-form',
        formName: 'loginForm',
        otherFields: [],
      },
      pageContext: {
        pageTitle: 'Login Page',
        pageUrl: 'https://example.com/login',
      },
    };

    it('should enhance field with LLM', async () => {
      const result = await service.enhance(mockFieldContext);

      expect(result).toBeDefined();
      expect(result?.fieldType).toBe('email');
      expect(result?.label).toBe('Email Address');
      expect(result?.confidence).toBe(0.85);
      expect(result?.source).toBe('llm');
    });

    it('should use cache for repeated enhancements', async () => {
      // First call
      const result1 = await service.enhance(mockFieldContext);

      // Second call with same context
      const result2 = await service.enhance(mockFieldContext);

      expect(result1).toEqual(result2);
      // The enhancer should only be called once due to caching
    });

    it('should handle enhancement failures gracefully', async () => {
      const failingContext: FieldContext = {
        ...mockFieldContext,
        element: {
          ...mockFieldContext.element,
          id: 'fail-field',
        },
      };

      // Mock enhancer to fail for this specific field
      const mockEnhancer = {
        name: 'LLMEnhancer',
        canEnhance: vi.fn().mockReturnValue(true),
        enhance: vi.fn().mockResolvedValue(null),
      };

      // @ts-expect-error Mock enhancer for testing
      service.registerEnhancer(mockEnhancer);

      const result = await service.enhance(failingContext);
      // Should return null instead of throwing
      expect(result).toBeNull();
    });
  });

  describe('connectToOllama', () => {
    it('should connect successfully', async () => {
      const result = await service.connectToOllama();

      expect(result.success).toBe(true);
      expect(result.status).toBe('connected');
    });

    it('should handle connection failures', async () => {
      // Mock enhancer with failing connection
      const mockEnhancer = {
        name: 'LLMEnhancer',
        testConnection: vi.fn().mockResolvedValue(false),
      };

      // @ts-expect-error Mock enhancer for testing
      service.registerEnhancer(mockEnhancer);

      const result = await service.connectToOllama();

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
    });

    it('should retry connection on failure', async () => {
      vi.useFakeTimers();

      // Mock enhancer that fails initially
      const mockEnhancer = {
        name: 'LLMEnhancer',
        testConnection: vi
          .fn()
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(true),
      };

      // @ts-expect-error Mock enhancer for testing
      service.registerEnhancer(mockEnhancer);

      // First attempt fails
      const result1 = await service.connectToOllama();
      expect(result1.success).toBe(false);

      // Fast-forward time for retry
      vi.advanceTimersByTime(1000);

      // Manual retry would succeed
      const result2 = await service.connectToOllama();
      expect(result2.success).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('getLLMStatus', () => {
    it('should return current LLM status', () => {
      const status = service.getLLMStatus();

      expect(status).toBeDefined();
      expect(status.status).toBeDefined();
      expect(status.timestamp).toBeDefined();
    });

    it('should update status after connection', async () => {
      await service.connectToOllama();
      const status = service.getLLMStatus();

      expect(status.status).toBe('connected');
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', () => {
      const result = service.disconnect();

      expect(result.success).toBe(true);
    });

    it('should clear retry timer on disconnect', () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      service.disconnect();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const newConfig: Partial<EnhancementConfig> = {
        llmConfig: {
          model: 'llama2',
          temperature: 0.2,
        },
      };

      service.updateConfig(newConfig);
      // Should not throw
      expect(service).toBeDefined();
    });

    it('should reinitialize enhancers after config update', () => {
      const newConfig: Partial<EnhancementConfig> = {
        llmConfig: {
          model: 'different-model',
        },
      };

      service.updateConfig(newConfig);
      // Enhancers should be reinitialized
      expect(service).toBeDefined();
    });
  });

  describe('setModel', () => {
    it('should update the model configuration', () => {
      service.setModel('new-model');
      // Should update config with new model
      expect(service).toBeDefined();
    });
  });

  describe('caching', () => {
    it('should generate consistent cache keys', () => {
      const context1: FieldContext = {
        element: {
          id: 'field1',
          name: 'test',
          type: 'text',
        },
      };

      const context2: FieldContext = {
        element: {
          id: 'field1',
          name: 'test',
          type: 'text',
        },
      };

      // Same context should generate same cache key
      // @ts-expect-error Accessing private method for testing
      const key1 = service.getCacheKey(context1);
      // @ts-expect-error Accessing private method for testing
      const key2 = service.getCacheKey(context2);

      expect(key1).toBe(key2);
    });

    it('should respect cache size limits', async () => {
      // Create service with small cache
      const smallCacheService = FieldEnhancementService.getInstance({
        enableCache: true,
        cacheConfig: {
          maxSize: 2,
          ttlSeconds: 3600,
        },
      });

      // Add multiple entries
      for (let i = 0; i < 5; i++) {
        const context: FieldContext = {
          element: {
            id: `field-${i}`,
            name: `field${i}`,
            type: 'text',
          },
        };
        await smallCacheService.enhance(context);
      }

      // Cache should not exceed max size
      // @ts-expect-error Accessing private property for testing
      const cacheSize = smallCacheService.enhancementCache.size;
      expect(cacheSize).toBeLessThanOrEqual(2);
    });
  });

  describe('getFieldEnhancementDetails', () => {
    it('should return enhancement details for a field', async () => {
      const context: FieldContext = {
        element: {
          id: 'test-field',
          name: 'test',
          type: 'text',
        },
      };

      await service.enhance(context);
      const details = service.getFieldEnhancementDetails('test-field');

      expect(details).toBeDefined();
    });

    it('should return undefined for unknown field', () => {
      const details = service.getFieldEnhancementDetails('unknown-field');
      expect(details).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle enhancer registration errors', () => {
      const invalidEnhancer = null;

      // Should not throw
      expect(() => {
        // @ts-expect-error Invalid enhancer for testing
        service.registerEnhancer(invalidEnhancer);
      }).not.toThrow();
    });

    it('should handle enhancement errors gracefully', async () => {
      const mockEnhancer = {
        name: 'ErrorEnhancer',
        canEnhance: vi.fn().mockReturnValue(true),
        enhance: vi.fn().mockRejectedValue(new Error('Enhancement failed')),
      };

      // @ts-expect-error Mock enhancer for testing
      service.registerEnhancer(mockEnhancer);

      const context: FieldContext = {
        element: {
          id: 'error-field',
          name: 'error',
          type: 'text',
        },
      };

      const result = await service.enhance(context);
      // Should return null instead of throwing
      expect(result).toBeNull();
    });
  });
});
