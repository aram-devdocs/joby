import type { FieldEnhancer, FieldContext, FieldEnhancement } from '../types';
import { OllamaService } from '@packages/llm';

export class LLMEnhancer implements FieldEnhancer {
  name = 'LLMEnhancer';
  priority = 2;
  isEnabled = true;

  private ollamaService: OllamaService;
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
    // Temperature parameter is passed to individual prompts if needed
    // const temperature = config?.temperature || 0.1;
    this.maxRetries = config?.maxRetries || 2;
    this.timeoutMs = config?.timeoutMs || 5000;

    this.ollamaService = new OllamaService({
      host: config?.ollamaHost || 'http://127.0.0.1:11434',
    });

    // Store temperature for later use in prompts if needed
    // Currently not used but available for future enhancements
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

      const enhancementPromise = this.queryLLM(prompt);

      const result = await Promise.race([enhancementPromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.warn('LLM enhancement failed, falling back to null:', error);
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

  private async queryLLM(prompt: string): Promise<FieldEnhancement | null> {
    let lastError: Error | null = null;

    for (let i = 0; i < this.maxRetries; i++) {
      try {
        const response = await this.ollamaService.sendPrompt({
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
      } catch (error) {
        lastError = error as Error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    if (lastError) {
      console.warn('LLM query failed after retries:', lastError.message);
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
    } catch (error) {
      console.warn('Failed to parse LLM response:', error);
      return null;
    }
  }
}
