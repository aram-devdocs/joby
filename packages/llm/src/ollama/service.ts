import { Ollama } from 'ollama';
import type {
  OllamaConfig,
  OllamaModel,
  OllamaPromptRequest,
  OllamaPromptResponse,
} from './types';

export class OllamaService {
  private client: Ollama;

  constructor(config?: OllamaConfig) {
    this.client = new Ollama({
      host: config?.host || 'http://127.0.0.1:11434',
    });
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await this.client.list();
      return response.models.map((model) => ({
        name: model.name,
        modified_at:
          model.modified_at instanceof Date
            ? model.modified_at.toISOString()
            : model.modified_at,
        size: model.size,
        digest: model.digest,
        details: model.details,
      }));
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      throw new Error(
        'Failed to list models. Please ensure Ollama is running.',
      );
    }
  }

  async sendPrompt(
    request: OllamaPromptRequest,
  ): Promise<OllamaPromptResponse> {
    try {
      const response = await this.client.generate({
        model: request.model,
        prompt: request.prompt,
        stream: false,
      });

      return {
        model: response.model,
        created_at:
          response.created_at instanceof Date
            ? response.created_at.toISOString()
            : response.created_at,
        response: response.response,
        done: response.done,
      };
    } catch (error) {
      console.error('Failed to send prompt to Ollama:', error);
      throw new Error(
        'Failed to generate response. Please check your model selection and Ollama connection.',
      );
    }
  }

  async streamPrompt(
    request: OllamaPromptRequest,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    try {
      const response = await this.client.generate({
        model: request.model,
        prompt: request.prompt,
        stream: true,
      });

      for await (const part of response) {
        onChunk(part.response);
      }
    } catch (error) {
      console.error('Failed to stream prompt to Ollama:', error);
      throw new Error(
        'Failed to stream response. Please check your model selection and Ollama connection.',
      );
    }
  }

  updateHost(host: string): void {
    this.client = new Ollama({ host });
  }

  getHost(): string {
    return (this.client as any).config?.host || 'http://127.0.0.1:11434';
  }
}
