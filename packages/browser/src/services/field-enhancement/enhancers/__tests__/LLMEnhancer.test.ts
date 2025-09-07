import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LLMEnhancer } from '../LLMEnhancer';
import type { FieldContext } from '../../types';

// Mock the OllamaServiceAdapter
vi.mock('../../../adapters/OllamaServiceAdapter', () => ({
  OllamaServiceAdapter: vi.fn().mockImplementation(() => ({
    testConnection: vi.fn().mockResolvedValue(true),
    sendPrompt: vi.fn().mockResolvedValue({
      response: JSON.stringify({
        fieldType: 'email',
        label: 'Email Address',
        validation: {
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          required: true,
          message: 'Please enter a valid email address',
        },
        confidence: 0.9,
      }),
    }),
  })),
}));

describe('LLMEnhancer', () => {
  let enhancer: LLMEnhancer;

  beforeEach(() => {
    enhancer = new LLMEnhancer({
      model: 'llama3.2',
      temperature: 0.1,
      maxRetries: 2,
      timeoutMs: 5000,
      ollamaHost: 'http://localhost:11434',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('canEnhance', () => {
    const minimalContext: FieldContext = {
      element: {
        id: 'test-field',
        name: 'email',
        type: 'text',
      },
    };

    it('should return true for fields with sufficient context', () => {
      const contextWithInfo: FieldContext = {
        ...minimalContext,
        surroundingText: 'Enter your email address',
      };

      expect(enhancer.canEnhance(contextWithInfo)).toBe(true);
    });

    it('should return true for fields with meaningful names', () => {
      const contextWithName: FieldContext = {
        element: {
          id: 'user-email',
          name: 'user_email',
          type: 'text',
        },
      };

      expect(enhancer.canEnhance(contextWithName)).toBe(true);
    });

    it('should return true for fields with placeholders', () => {
      const contextWithPlaceholder: FieldContext = {
        element: {
          id: 'field1',
          name: 'field1',
          type: 'text',
          placeholder: 'Enter your email',
        },
      };

      expect(enhancer.canEnhance(contextWithPlaceholder)).toBe(true);
    });

    it('should return false for fields with no context', () => {
      const noContext: FieldContext = {
        element: {
          id: 'f1',
          name: 'f1',
          type: 'text',
        },
      };

      expect(enhancer.canEnhance(noContext)).toBe(false);
    });

    it('should return true when form context provides information', () => {
      const contextWithForm: FieldContext = {
        element: {
          id: 'field1',
          name: 'field1',
          type: 'text',
        },
        formContext: {
          formId: 'registration-form',
          formName: 'userRegistration',
        },
      };

      expect(enhancer.canEnhance(contextWithForm)).toBe(true);
    });
  });

  describe('enhance', () => {
    const validContext: FieldContext = {
      element: {
        id: 'email-field',
        name: 'email',
        type: 'text',
        placeholder: 'your@email.com',
      },
      surroundingText: 'Email address for account',
    };

    it('should enhance field with LLM response', async () => {
      const result = await enhancer.enhance(validContext);

      expect(result).toBeDefined();
      expect(result?.fieldType).toBe('email');
      expect(result?.label).toBe('Email Address');
      expect(result?.validation).toBeDefined();
      expect(result?.validation?.required).toBe(true);
      expect(result?.confidence).toBe(0.9);
      expect(result?.source).toBe('llm');
    });

    it('should handle LLM timeout', async () => {
      // Create enhancer with very short timeout
      const quickTimeoutEnhancer = new LLMEnhancer({
        model: 'llama3.2',
        timeoutMs: 1,
      });

      // Mock slow response
      const mockOllama = {
        sendPrompt: vi
          .fn()
          .mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 1000)),
          ),
      };

      // @ts-expect-error Accessing private property for testing
      quickTimeoutEnhancer.ollamaService = mockOllama;

      const result = await quickTimeoutEnhancer.enhance(validContext);
      expect(result).toBeNull();
    });

    it('should retry on failure', async () => {
      const mockOllama = {
        sendPrompt: vi
          .fn()
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({
            response: JSON.stringify({
              fieldType: 'email',
              label: 'Email',
              confidence: 0.8,
            }),
          }),
      };

      // @ts-expect-error Accessing private property for testing
      enhancer.ollamaService = mockOllama;

      const result = await enhancer.enhance(validContext);

      expect(result).toBeDefined();
      expect(mockOllama.sendPrompt).toHaveBeenCalledTimes(2);
    });

    it('should return null after max retries', async () => {
      const mockOllama = {
        sendPrompt: vi.fn().mockRejectedValue(new Error('Persistent error')),
      };

      // @ts-expect-error Accessing private property for testing
      enhancer.ollamaService = mockOllama;

      const result = await enhancer.enhance(validContext);

      expect(result).toBeNull();
      expect(mockOllama.sendPrompt).toHaveBeenCalledTimes(2); // maxRetries = 2
    });

    it('should handle malformed JSON response', async () => {
      const mockOllama = {
        sendPrompt: vi.fn().mockResolvedValue({
          response: 'Not valid JSON',
        }),
      };

      // @ts-expect-error Accessing private property for testing
      enhancer.ollamaService = mockOllama;

      const result = await enhancer.enhance(validContext);
      expect(result).toBeNull();
    });

    it('should extract JSON from mixed response', async () => {
      const mockOllama = {
        sendPrompt: vi.fn().mockResolvedValue({
          response: `
            Here's the analysis:
            {"fieldType": "phone", "label": "Phone Number", "confidence": 0.75}
            That's the result.
          `,
        }),
      };

      // @ts-expect-error Accessing private property for testing
      enhancer.ollamaService = mockOllama;

      const result = await enhancer.enhance(validContext);

      expect(result).toBeDefined();
      expect(result?.fieldType).toBe('phone');
      expect(result?.confidence).toBe(0.75);
    });
  });

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      const connected = await enhancer.testConnection();
      expect(connected).toBe(true);
    });

    it('should handle connection failure', async () => {
      const mockOllama = {
        testConnection: vi.fn().mockResolvedValue(false),
      };

      // @ts-expect-error Accessing private property for testing
      enhancer.ollamaService = mockOllama;

      const connected = await enhancer.testConnection();
      expect(connected).toBe(false);
    });

    it('should handle connection error', async () => {
      const mockOllama = {
        testConnection: vi
          .fn()
          .mockRejectedValue(new Error('Connection failed')),
      };

      // @ts-expect-error Accessing private property for testing
      enhancer.ollamaService = mockOllama;

      const connected = await enhancer.testConnection();
      expect(connected).toBe(false);
    });
  });

  describe('prompt building', () => {
    it('should build comprehensive prompt', () => {
      const context: FieldContext = {
        element: {
          id: 'user-phone',
          name: 'phone_number',
          type: 'tel',
          placeholder: '(555) 123-4567',
          pattern: '[0-9]{3}-[0-9]{3}-[0-9]{4}',
          required: true,
        },
        surroundingText: 'Contact phone number',
        siblingFields: ['email', 'name'],
        formContext: {
          formId: 'contact-form',
          formName: 'contactForm',
        },
      };

      // @ts-expect-error Accessing private method for testing
      const prompt = enhancer.buildPrompt(context);

      expect(prompt).toContain('phone_number');
      expect(prompt).toContain('tel');
      expect(prompt).toContain('(555) 123-4567');
      expect(prompt).toContain('Contact phone number');
      expect(prompt).toContain('contact-form');
    });

    it('should handle minimal context in prompt', () => {
      const minimalContext: FieldContext = {
        element: {
          id: 'field1',
          name: 'field1',
          type: 'text',
        },
      };

      // @ts-expect-error Accessing private method for testing
      const prompt = enhancer.buildPrompt(minimalContext);

      expect(prompt).toContain('field1');
      expect(prompt).toContain('text');
      expect(prompt).toContain('JSON');
    });
  });

  describe('response parsing', () => {
    it('should parse valid response', () => {
      const validResponse = JSON.stringify({
        fieldType: 'date',
        label: 'Birth Date',
        validation: {
          pattern: '\\d{4}-\\d{2}-\\d{2}',
          required: false,
          message: 'Please enter date in YYYY-MM-DD format',
        },
        confidence: 0.95,
      });

      // @ts-expect-error Accessing private method for testing
      const parsed = enhancer.parseResponse(validResponse);

      expect(parsed).toBeDefined();
      expect(parsed.fieldType).toBe('date');
      expect(parsed.label).toBe('Birth Date');
      expect(parsed.validation.pattern).toBe('\\d{4}-\\d{2}-\\d{2}');
      expect(parsed.confidence).toBe(0.95);
    });

    it('should handle response without validation', () => {
      const response = JSON.stringify({
        fieldType: 'text',
        label: 'Comments',
        confidence: 0.6,
      });

      // @ts-expect-error Accessing private method for testing
      const parsed = enhancer.parseResponse(response);

      expect(parsed).toBeDefined();
      expect(parsed.fieldType).toBe('text');
      expect(parsed.validation).toBeUndefined();
    });

    it('should return null for response without required fields', () => {
      const response = JSON.stringify({
        confidence: 0.5,
      });

      // @ts-expect-error Accessing private method for testing
      const parsed = enhancer.parseResponse(response);
      expect(parsed).toBeNull();
    });

    it('should provide default confidence if missing', () => {
      const response = JSON.stringify({
        fieldType: 'number',
        label: 'Age',
      });

      // @ts-expect-error Accessing private method for testing
      const parsed = enhancer.parseResponse(response);

      expect(parsed).toBeDefined();
      expect(parsed.confidence).toBe(0.5);
    });
  });

  describe('configuration', () => {
    it('should use default values when config not provided', () => {
      const defaultEnhancer = new LLMEnhancer();

      // @ts-expect-error Accessing private property for testing
      expect(defaultEnhancer.model).toBe('llama3.2');
      // @ts-expect-error Accessing private property for testing
      expect(defaultEnhancer.maxRetries).toBe(2);
      // @ts-expect-error Accessing private property for testing
      expect(defaultEnhancer.timeoutMs).toBe(5000);
    });

    it('should accept custom configuration', () => {
      const customEnhancer = new LLMEnhancer({
        model: 'custom-model',
        temperature: 0.7,
        maxRetries: 5,
        timeoutMs: 10000,
        ollamaHost: 'http://custom:11434',
      });

      // @ts-expect-error Accessing private property for testing
      expect(customEnhancer.model).toBe('custom-model');
      // @ts-expect-error Accessing private property for testing
      expect(customEnhancer.maxRetries).toBe(5);
      // @ts-expect-error Accessing private property for testing
      expect(customEnhancer.timeoutMs).toBe(10000);
    });
  });
});
