/**
 * Backward compatibility adapter for existing LLM integrations
 * Bridges the gap between the new streaming architecture and existing service usage
 */

import { OllamaService } from '../ollama/service';
import { OllamaStreamManager } from '../ollama/stream-manager';
import { eventBus, type StreamContext } from '../events';
import type {
  OllamaPromptRequest,
  OllamaPromptResponse,
} from '../ollama/types';

export class OllamaServiceAdapter extends OllamaService {
  private streamManager: OllamaStreamManager;

  constructor(config?: { host?: string }) {
    super(config);
    this.streamManager = new OllamaStreamManager(config);
  }

  /**
   * Enhanced sendPrompt that maintains compatibility while adding streaming context
   */
  async sendPrompt(
    request: OllamaPromptRequest,
    context?: StreamContext,
    contextData?: Record<string, unknown>,
  ): Promise<OllamaPromptResponse> {
    // If no context provided, use legacy behavior
    if (!context) {
      return super.sendPrompt(request);
    }

    // Use streaming architecture for context-aware requests
    return new Promise<OllamaPromptResponse>((resolve, reject) => {
      const streamRequest = {
        model: request.model,
        prompt: request.prompt,
        context,
        ...(contextData && { contextData }),
      };

      this.streamManager
        .startStream(streamRequest)
        .then((streamId) => {
          const unsubscribe = eventBus.subscribeWithFilter(
            { streamId, eventTypes: ['stream:completed', 'stream:error'] },
            (event) => {
              if (event.type === 'stream:completed') {
                resolve({
                  model: request.model,
                  created_at: event.data.completedAt.toISOString(),
                  response: event.data.fullContent,
                  done: true,
                });
                unsubscribe();
              } else if (event.type === 'stream:error') {
                reject(new Error(event.data.error.message));
                unsubscribe();
              }
            },
          );

          // Stream event handling complete
        })
        .catch(reject);
    });
  }

  /**
   * Enhanced streamPrompt with context support
   */
  async streamPrompt(
    request: OllamaPromptRequest,
    onChunk: (chunk: string) => void,
    context?: StreamContext,
    contextData?: Record<string, unknown>,
  ): Promise<void> {
    // If no context provided, use legacy behavior
    if (!context) {
      return super.streamPrompt(request, onChunk);
    }

    // Use new streaming architecture
    return new Promise<void>((resolve, reject) => {
      const streamRequest = {
        model: request.model,
        prompt: request.prompt,
        context,
        ...(contextData && { contextData }),
      };

      this.streamManager
        .startStream(streamRequest)
        .then((streamId) => {
          const unsubscribe = eventBus.subscribeWithFilter(
            { streamId },
            (event) => {
              if (event.type === 'stream:chunk') {
                onChunk(event.data.content);
              } else if (event.type === 'stream:completed') {
                resolve();
                unsubscribe();
              } else if (event.type === 'stream:error') {
                reject(new Error(event.data.error.message));
                unsubscribe();
              }
            },
          );
        })
        .catch(reject);
    });
  }

  /**
   * Update host for both services
   */
  updateHost(host: string): void {
    super.updateHost(host);
    this.streamManager.updateHost(host);
  }

  /**
   * Get the stream manager for advanced usage
   */
  getStreamManager(): OllamaStreamManager {
    return this.streamManager;
  }

  /**
   * Test connection using stream manager
   */
  async testConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
  }> {
    return this.streamManager.testConnection();
  }
}
