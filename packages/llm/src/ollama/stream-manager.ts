/**
 * OllamaStreamManager - Centralized coordinator for all Ollama streaming interactions
 * Provides event-driven architecture with stream lifecycle management and debug integration
 */

import { Ollama } from 'ollama';
import { randomUUID } from 'crypto';
import type { OllamaConfig } from './types';
import {
  eventBus,
  type StreamRequest,
  type StreamMetadata,
  type StreamChunk,
  type StreamResult,
  type StreamStatus,
  type StreamContext,
} from '../events';
import { Logger, initializeLogger } from '../logger';

// Initialize Logger on module load
initializeLogger();

interface ActiveStream {
  id: string;
  metadata: StreamMetadata;
  prompt: string;
  controller: AbortController;
  chunks: StreamChunk[];
  fullContent: string;
  status: StreamStatus;
  startTime: number;
}

export class OllamaStreamManager {
  private client: Ollama;
  private activeStreams = new Map<string, ActiveStream>();
  private host: string;

  constructor(config?: OllamaConfig) {
    this.host = config?.host || 'http://127.0.0.1:11434';
    this.client = new Ollama({ host: this.host });

    Logger.info('OllamaStreamManager initialized', { host: this.host });

    // Set up event bus debug logging
    this.setupDebugLogging();
  }

  /**
   * Start a new streaming request
   */
  async startStream(request: StreamRequest): Promise<string> {
    const streamId = randomUUID();
    const controller = new AbortController();

    const metadata: StreamMetadata = {
      streamId,
      context: request.context,
      model: request.model,
      startedAt: new Date(),
      ...(request.userPrompt && { userPrompt: request.userPrompt }),
      ...(request.contextData && { contextData: request.contextData }),
    };

    const activeStream: ActiveStream = {
      id: streamId,
      metadata,
      prompt: request.prompt,
      controller,
      chunks: [],
      fullContent: '',
      status: 'starting',
      startTime: Date.now(),
    };

    this.activeStreams.set(streamId, activeStream);

    // Emit stream started event
    eventBus.emit({
      type: 'stream:started',
      data: {
        streamId,
        metadata,
        prompt: request.prompt,
      },
    });

    Logger.debug('Stream started', {
      streamId,
      context: request.context,
      model: request.model,
      promptLength: request.prompt.length,
    });

    // Start the actual streaming
    this.executeStream(streamId, request).catch((error) => {
      this.handleStreamError(streamId, error);
    });

    return streamId;
  }

  /**
   * Cancel an active stream
   */
  async cancelStream(streamId: string, reason?: string): Promise<boolean> {
    const stream = this.activeStreams.get(streamId);
    if (!stream) {
      return false;
    }

    // Abort the request
    stream.controller.abort();
    stream.status = 'cancelled';

    // Emit cancelled event
    eventBus.emit({
      type: 'stream:cancelled',
      data: {
        streamId,
        metadata: stream.metadata,
        ...(reason && { reason }),
      },
    });

    // Clean up
    this.activeStreams.delete(streamId);
    return true;
  }

  /**
   * Get information about an active stream
   */
  getStreamInfo(streamId: string): ActiveStream | undefined {
    return this.activeStreams.get(streamId);
  }

  /**
   * Get all active streams
   */
  getActiveStreams(): ActiveStream[] {
    return Array.from(this.activeStreams.values());
  }

  /**
   * Get streams by context
   */
  getStreamsByContext(context: StreamContext): ActiveStream[] {
    return Array.from(this.activeStreams.values()).filter(
      (stream) => stream.metadata.context === context,
    );
  }

  /**
   * Update Ollama host configuration
   */
  updateHost(host: string): void {
    this.host = host;
    this.client = new Ollama({ host });

    eventBus.emit({
      type: 'debug:output',
      data: {
        content: `Ollama host updated to: ${host}`,
        level: 'info',
        timestamp: new Date(),
        source: 'OllamaStreamManager',
      },
    });
  }

  /**
   * Get current host
   */
  getHost(): string {
    return this.host;
  }

  /**
   * Test connection to Ollama
   */
  async testConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
  }> {
    try {
      const response = await this.client.list();
      const modelNames = response.models.map((model) => model.name);

      Logger.info(
        `Connection test successful. Found ${modelNames.length} models.`,
        {
          models: modelNames,
          host: this.host,
        },
      );

      eventBus.emit({
        type: 'debug:output',
        data: {
          content: `Connection test successful. Found ${modelNames.length} models.`,
          level: 'info',
          timestamp: new Date(),
          source: 'OllamaStreamManager',
        },
      });

      return { connected: true, models: modelNames };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      Logger.error('Connection test failed', error, { host: this.host });

      eventBus.emit({
        type: 'debug:output',
        data: {
          content: `Connection test failed: ${errorMessage}`,
          level: 'error',
          timestamp: new Date(),
          source: 'OllamaStreamManager',
        },
      });

      return { connected: false, error: errorMessage };
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await this.client.list();
      return response.models.map((model) => model.name);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to list models: ${errorMessage}`);
    }
  }

  private async executeStream(
    streamId: string,
    request: StreamRequest,
  ): Promise<void> {
    const stream = this.activeStreams.get(streamId);
    if (!stream) {
      return;
    }

    try {
      stream.status = 'streaming';
      let chunkSequence = 0;

      Logger.debug('Executing stream', {
        streamId,
        model: request.model,
        context: request.context,
      });

      const response = await this.client.generate({
        model: request.model,
        prompt: request.prompt,
        stream: true,
        ...(request.options && { options: request.options }),
      });

      for await (const part of response) {
        // Check if stream was cancelled
        if (stream.controller.signal.aborted) {
          Logger.debug('Stream aborted', { streamId });
          return;
        }

        const chunk: StreamChunk = {
          streamId,
          content: part.response,
          sequence: chunkSequence++,
          timestamp: new Date(),
        };

        stream.chunks.push(chunk);
        stream.fullContent += part.response;

        // Emit chunk event
        eventBus.emit({
          type: 'stream:chunk',
          data: chunk,
        });
      }

      // Stream completed successfully
      Logger.debug('Stream execution completed', {
        streamId,
        totalChunks: stream.chunks.length,
        contentLength: stream.fullContent.length,
      });
      await this.completeStream(streamId);
    } catch (error) {
      // Check if it was a cancellation
      if (stream.controller.signal.aborted) {
        return; // Already handled in cancelStream
      }
      throw error;
    }
  }

  private async completeStream(streamId: string): Promise<void> {
    const stream = this.activeStreams.get(streamId);
    if (!stream) {
      return;
    }

    const endTime = Date.now();
    const durationMs = endTime - stream.startTime;

    stream.status = 'completed';

    // Test logger with debug message
    Logger.debug('Test logger with debug message');

    // Test logger with info message
    Logger.info('Test logger with info message');

    // Test logger with error message
    Logger.error('Test logger with error message');

    Logger.info('Stream completed', {
      streamId,
      context: stream.metadata.context,
      duration: `${durationMs}ms`,
      chunks: stream.chunks.length,
    });

    const result: StreamResult = {
      streamId,
      fullContent: stream.fullContent,
      status: 'completed',
      metadata: stream.metadata,
      completedAt: new Date(),
      metrics: {
        totalChunks: stream.chunks.length,
        totalBytes: Buffer.byteLength(stream.fullContent, 'utf8'),
        durationMs,
        tokensPerSecond: this.calculateTokensPerSecond(
          stream.fullContent,
          durationMs,
        ),
      },
    };

    // Emit completed event
    eventBus.emit({
      type: 'stream:completed',
      data: result,
    });

    // Clean up
    this.activeStreams.delete(streamId);
  }

  private handleStreamError(streamId: string, error: unknown): void {
    const stream = this.activeStreams.get(streamId);
    if (!stream) {
      return;
    }

    stream.status = 'error';
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    Logger.error('Stream error', error, {
      streamId,
      context: stream.metadata.context,
    });

    // Emit error event
    eventBus.emit({
      type: 'stream:error',
      data: {
        streamId,
        error: {
          message: errorMessage,
          ...(error instanceof Error &&
            'code' in error && { code: String(error.code) }),
          details: error,
        },
        metadata: stream.metadata,
      },
    });

    // Clean up
    this.activeStreams.delete(streamId);
  }

  private calculateTokensPerSecond(
    content: string,
    durationMs: number,
  ): number {
    // Rough approximation: ~4 characters per token for English text
    const approximateTokens = content.length / 4;
    const durationSeconds = durationMs / 1000;
    return durationSeconds > 0 ? approximateTokens / durationSeconds : 0;
  }

  private setupDebugLogging(): void {
    eventBus.emit({
      type: 'debug:output',
      data: {
        content: `OllamaStreamManager initialized with host: ${this.host}`,
        level: 'info',
        timestamp: new Date(),
        source: 'OllamaStreamManager',
      },
    });
  }
}
