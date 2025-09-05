import type { FieldEnhancer, FieldContext, FieldEnhancement } from '../types';
import { OllamaServiceAdapter, type StreamContext } from '@packages/llm';

export class LLMEnhancer implements FieldEnhancer {
  name = 'LLMEnhancer';
  priority = 2;
  isEnabled = true;

  private ollamaService: OllamaServiceAdapter;
  private streamingEnabled: boolean;
  private model: string;
  private maxRetries: number;
  private timeoutMs: number;

  constructor(config?: {
    model?: string;
    temperature?: number;
    maxRetries?: number;
    timeoutMs?: number;
    ollamaHost?: string;
  }) {
    this.model = config?.model || 'llama2';
    // Temperature could be used in future for prompt tuning
    // const temperature = config?.temperature || 0.1;
    this.maxRetries = config?.maxRetries || 2;
    this.timeoutMs = config?.timeoutMs || 5000;

    this.ollamaService = new OllamaServiceAdapter({
      host: config?.ollamaHost || 'http://127.0.0.1:11434',
    });
    this.streamingEnabled = true; // Enable streaming by default for enhanced debugging
  }

  async testConnection(): Promise<boolean> {
    try {
      // Use enhanced connection test from adapter
      const result = await this.ollamaService.testConnection();
      return result.connected;
    } catch {
      // Connection failed
      return false;
    }
  }

  /**
   * Enable or disable streaming mode for debugging
   */
  setStreamingEnabled(enabled: boolean): void {
    this.streamingEnabled = enabled;
  }

  /**
   * Get the underlying stream manager for advanced operations
   */
  getStreamManager() {
    return this.ollamaService.getStreamManager();
  }

  /**
   * Update the Ollama host for both legacy and streaming services
   */
  updateHost(host: string): void {
    this.ollamaService.updateHost(host);
  }

  canEnhance(context: FieldContext): boolean {
    const hasMinimalContext = !!(
      context.element.name ||
      context.element.label ||
      context.element.placeholder ||
      context.element.id
    );

    return hasMinimalContext;
  }

  async enhance(context: FieldContext): Promise<FieldEnhancement | null> {
    try {
      const prompt = this.buildPrompt(context);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('LLM request timeout')),
          this.timeoutMs,
        );
      });

      const enhancementPromise = this.queryLLM(prompt, context);

      const result = await Promise.race([enhancementPromise, timeoutPromise]);
      return result;
    } catch {
      // Silently handle enhancement errors
      return null;
    }
  }

  private buildPrompt(context: FieldContext): string {
    const contextData = {
      field: {
        type: context.element.type,
        name: context.element.name,
        id: context.element.id,
        placeholder: context.element.placeholder,
        label: context.element.label,
        ariaLabel: context.element.ariaLabel,
        autocomplete: context.element.autocomplete,
        pattern: context.element.pattern,
        required: context.element.required,
      },
      surrounding: context.surroundingText,
      siblings: context.siblingFields,
      form: context.formContext,
    };

    return `Analyze this HTML form field and provide classification. Return ONLY valid JSON.

Field context:
${JSON.stringify(contextData, null, 2)}

Determine:
1. The semantic field type (email, phone, date, password, url, number, text, etc.)
2. The best human-readable label for this field
3. Appropriate validation rules

Response format (JSON only):
{
  "fieldType": "detected_type",
  "label": "human_readable_label",
  "validation": {
    "pattern": "regex_if_applicable",
    "required": true_or_false,
    "message": "validation_message"
  },
  "confidence": 0.0_to_1.0
}`;
  }

  private async queryLLM(
    prompt: string,
    fieldContext?: FieldContext,
  ): Promise<FieldEnhancement | null> {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        const streamContext: StreamContext = 'form-analysis';
        const contextData = fieldContext
          ? {
              fieldId: fieldContext.element.id || 'unknown',
              fieldName: fieldContext.element.name || 'unknown',
              fieldType: fieldContext.element.type || 'unknown',
              formUrl: fieldContext.pageContext?.pageUrl || 'unknown',
              performance: {
                startTime: Date.now(),
                retryAttempt: i + 1,
              },
            }
          : undefined;

        const response =
          this.streamingEnabled && fieldContext
            ? await this.ollamaService.sendPrompt(
                {
                  model: this.model,
                  prompt,
                },
                streamContext,
                contextData,
              )
            : await this.ollamaService.sendPrompt({
                model: this.model,
                prompt,
              });

        const parsed = this.parseResponse(response.response);
        if (parsed) {
          return {
            ...parsed,
            source: 'llm',
          };
        }
      } catch {
        // Retry with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    return null;
  }

  private parseResponse(response: string): FieldEnhancement | null {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.fieldType && !parsed.label) {
        return null;
      }

      return {
        fieldType: parsed.fieldType,
        label: parsed.label,
        validation: parsed.validation,
        confidence: parsed.confidence || 0.5,
        source: 'llm',
      };
    } catch {
      // Failed to parse, return null
      return null;
    }
  }
}
