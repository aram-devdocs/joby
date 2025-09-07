/**
 * JSON formatting utilities for debug display
 * Provides structured formatting for terminal and UI consumption
 */

import type {
  StreamEvent,
  StreamMetadata,
  StreamResult,
  StreamChunk,
} from '../events';
import type { LogEntry } from './stream-logger';

export interface FormattedOutput {
  timestamp: string;
  content: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'success';
  category: 'stream' | 'system' | 'user' | 'debug';
  metadata?: Record<string, unknown>;
}

export class DebugFormatter {
  /**
   * Format a stream event for debug display
   */
  static formatStreamEvent(event: StreamEvent): FormattedOutput {
    const baseOutput = {
      timestamp: new Date().toISOString(),
      metadata: {},
    };

    switch (event.type) {
      case 'stream:started':
        return {
          ...baseOutput,
          content: this.formatStreamStart(event.data),
          level: 'info',
          category: 'stream',
          metadata: {
            streamId: event.data.streamId,
            context: event.data.metadata.context,
            model: event.data.metadata.model,
          },
        };

      case 'stream:chunk':
        return {
          ...baseOutput,
          content: this.formatChunk(event.data),
          level: 'debug',
          category: 'stream',
          metadata: {
            streamId: event.data.streamId,
            sequence: event.data.sequence,
            length: event.data.content.length,
          },
        };

      case 'stream:completed':
        return {
          ...baseOutput,
          content: this.formatStreamComplete(event.data),
          level: 'success',
          category: 'stream',
          metadata: {
            streamId: event.data.streamId,
            duration: event.data.metrics?.durationMs,
            chunks: event.data.metrics?.totalChunks,
            tokensPerSecond: event.data.metrics?.tokensPerSecond,
          },
        };

      case 'stream:error':
        return {
          ...baseOutput,
          content: this.formatStreamError(event.data),
          level: 'error',
          category: 'stream',
          metadata: {
            streamId: event.data.streamId,
            errorCode: event.data.error.code,
          },
        };

      case 'stream:cancelled':
        return {
          ...baseOutput,
          content: this.formatStreamCancelled(event.data),
          level: 'warn',
          category: 'stream',
          metadata: {
            streamId: event.data.streamId,
            reason: event.data.reason,
          },
        };

      case 'debug:command':
        return {
          ...baseOutput,
          content: `$ ${event.data.command} ${event.data.args?.join(' ') || ''}`,
          level: 'info',
          category: 'user',
        };

      case 'debug:output':
        return {
          ...baseOutput,
          content: event.data.content,
          level: event.data.level as FormattedOutput['level'],
          category: 'debug',
          metadata: {
            source: event.data.source,
          },
        };

      default:
        return {
          ...baseOutput,
          content: `Unknown event: ${JSON.stringify(event)}`,
          level: 'debug',
          category: 'system',
        };
    }
  }

  /**
   * Format a log entry for debug display
   */
  static formatLogEntry(entry: LogEntry): FormattedOutput {
    return {
      timestamp: entry.timestamp.toISOString(),
      content: entry.message,
      level: entry.level as FormattedOutput['level'],
      category: entry.category,
      metadata: {
        id: entry.id,
        streamId: entry.streamId,
        context: entry.context,
        data: entry.data,
      },
    };
  }

  /**
   * Format JSON data with syntax highlighting markers
   */
  static formatJSON(data: unknown, indent = 2): string {
    try {
      const jsonString = JSON.stringify(data, null, indent);
      return this.addJSONHighlighting(jsonString);
    } catch {
      return `<Invalid JSON: ${String(data)}>`;
    }
  }

  /**
   * Format stream metadata for display
   */
  static formatStreamMetadata(metadata: StreamMetadata): string {
    const formatted: Record<string, unknown> = {
      'Stream ID': metadata.streamId.substring(0, 8) + '...',
      Context: metadata.context,
      Model: metadata.model,
      Started: metadata.startedAt.toLocaleTimeString(),
      'User Prompt': metadata.userPrompt ? 'Yes' : 'No',
    };

    if (metadata.contextData && Object.keys(metadata.contextData).length > 0) {
      formatted['Context Data'] = JSON.stringify(metadata.contextData, null, 2);
    }

    return this.formatKeyValuePairs(formatted);
  }

  /**
   * Format stream result summary
   */
  static formatStreamResultSummary(result: StreamResult): string {
    const summary: Record<string, unknown> = {
      'Stream ID': result.streamId.substring(0, 8) + '...',
      Status: result.status,
      Duration: `${result.metrics?.durationMs}ms`,
      Chunks: result.metrics?.totalChunks,
      Bytes: result.metrics?.totalBytes,
      'Tokens/sec': result.metrics?.tokensPerSecond?.toFixed(2),
      'Content Length': result.fullContent.length,
    };

    if (result.error) {
      summary['Error'] = result.error.message;
    }

    return this.formatKeyValuePairs(summary);
  }

  /**
   * Format terminal command output
   */
  static formatCommandOutput(
    command: string,
    output: string,
    error?: string,
  ): FormattedOutput[] {
    const results: FormattedOutput[] = [];
    const timestamp = new Date().toISOString();

    // Command input
    results.push({
      timestamp,
      content: `$ ${command}`,
      level: 'info',
      category: 'user',
    });

    // Output
    if (output) {
      results.push({
        timestamp,
        content: output,
        level: 'info',
        category: 'system',
      });
    }

    // Error
    if (error) {
      results.push({
        timestamp,
        content: error,
        level: 'error',
        category: 'system',
      });
    }

    return results;
  }

  /**
   * Create a divider line for terminal output
   */
  static createDivider(title?: string, width = 80): string {
    if (title) {
      const padding = Math.max(0, width - title.length - 4);
      const leftPadding = Math.floor(padding / 2);
      const rightPadding = padding - leftPadding;
      return (
        '─'.repeat(leftPadding) + `  ${title}  ` + '─'.repeat(rightPadding)
      );
    }
    return '─'.repeat(width);
  }

  private static formatStreamStart(data: {
    streamId: string;
    metadata: StreamMetadata;
    prompt: string;
  }): string {
    return `🚀 Stream Started\n${this.formatStreamMetadata(data.metadata)}\n\nPrompt:\n${this.truncateText(data.prompt, 200)}`;
  }

  private static formatChunk(data: StreamChunk): string {
    return `📦 Chunk #${data.sequence} (${data.content.length} chars)\n${this.truncateText(data.content, 100)}`;
  }

  private static formatStreamComplete(data: StreamResult): string {
    return `✅ Stream Completed\n${this.formatStreamResultSummary(data)}`;
  }

  private static formatStreamError(data: {
    streamId: string;
    error: { message: string; code?: string };
    metadata: StreamMetadata;
  }): string {
    return `❌ Stream Error\nStream: ${data.streamId.substring(0, 8)}...\nError: ${data.error.message}\n${data.error.code ? `Code: ${data.error.code}` : ''}`;
  }

  private static formatStreamCancelled(data: {
    streamId: string;
    metadata: StreamMetadata;
    reason?: string;
  }): string {
    return `⏹️ Stream Cancelled\nStream: ${data.streamId.substring(0, 8)}...\nReason: ${data.reason || 'No reason provided'}`;
  }

  private static formatKeyValuePairs(pairs: Record<string, unknown>): string {
    const maxKeyLength = Math.max(...Object.keys(pairs).map((k) => k.length));
    return Object.entries(pairs)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        const paddedKey = key.padEnd(maxKeyLength);
        return `${paddedKey}: ${String(value)}`;
      })
      .join('\n');
  }

  private static addJSONHighlighting(json: string): string {
    // Simple highlighting markers that can be processed by terminal or UI
    return json
      .replace(/"([^"]+)":/g, '"<key>$1</key>":') // Keys
      .replace(/: "([^"]+)"/g, ': "<string>$1</string>"') // String values
      .replace(/: (\d+\.?\d*)/g, ': <number>$1</number>') // Numbers
      .replace(/: (true|false)/g, ': <boolean>$1</boolean>') // Booleans
      .replace(/: null/g, ': <null>null</null>'); // Null
  }

  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}
