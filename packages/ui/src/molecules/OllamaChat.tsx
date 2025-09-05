import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '../atoms/card';
import { Input } from '../atoms/input';
import { Select } from '../atoms/select';
import { TextArea } from '../atoms/text-area';
import { Button } from '../atoms/button';

// Stream request interface (defined locally to avoid circular dependencies)
interface StreamRequest {
  model: string;
  prompt: string;
  context: string;
  userPrompt?: string;
  contextData?: Record<string, unknown>;
}

// Stream event interfaces (defined locally to avoid circular dependencies)
interface StreamEventBase {
  type: string;
  data: Record<string, unknown>;
}

function isStreamEvent(event: unknown): event is StreamEventBase {
  return (
    typeof event === 'object' &&
    event !== null &&
    typeof (event as StreamEventBase).type === 'string' &&
    typeof (event as StreamEventBase).data === 'object'
  );
}

export interface OllamaChatProps {
  onSendPrompt: (model: string, prompt: string) => Promise<string>;
  onGetModels: () => Promise<Array<{ name: string; modified_at: string }>>;
  onSetHost: (host: string) => Promise<void>;
  initialHost?: string;
  // Streaming support props (optional for backward compatibility)
  onStreamPrompt?: (request: StreamRequest) => Promise<string>;
  onCancelStream?: (streamId: string, reason?: string) => Promise<void>;
  onGetStreamInfo?: (streamId: string) => Promise<unknown>;
  onGetActiveStreams?: () => Promise<unknown[]>;
  onStreamEvent?: (callback: (event: unknown) => void) => () => void;
}

export const OllamaChat: React.FC<OllamaChatProps> = ({
  onSendPrompt,
  onGetModels,
  onSetHost,
  initialHost = 'http://127.0.0.1:11434',
  onStreamPrompt,
  onCancelStream,
  onStreamEvent,
}) => {
  const [host, setHost] = useState(initialHost);
  const [models, setModels] = useState<Array<{ value: string; label: string }>>(
    [],
  );
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hostLoading, setHostLoading] = useState(false);
  const [streamingMode, setStreamingMode] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const [streamProgress, setStreamProgress] = useState('');
  const streamCleanupRef = useRef<(() => void) | null>(null);

  // Check if streaming is available
  const hasStreamingSupport = Boolean(
    onStreamPrompt && onCancelStream && onStreamEvent,
  );

  const loadModels = useCallback(async () => {
    try {
      setHostLoading(true);
      setError('');
      const modelList = await onGetModels();
      const options = modelList.map((model) => ({
        value: model.name,
        label: model.name,
      }));
      setModels(options);
      if (options.length > 0 && !selectedModel) {
        const firstOption = options[0];
        if (firstOption) {
          setSelectedModel(firstOption.value);
        }
      }
    } catch {
      setError('Failed to load models. Please check if Ollama is running.');
      setModels([]);
    } finally {
      setHostLoading(false);
    }
  }, [onGetModels, selectedModel]);

  const handleHostUpdate = async () => {
    try {
      await onSetHost(host);
      await loadModels();
    } catch {
      setError('Failed to connect to Ollama. Please check the URL.');
    }
  };

  const handleSendPrompt = async () => {
    if (!selectedModel || !prompt.trim()) {
      setError('Please select a model and enter a prompt.');
      return;
    }

    // Use streaming mode if available and enabled
    if (streamingMode && hasStreamingSupport && onStreamPrompt) {
      await handleStreamingPrompt();
      return;
    }

    // Use legacy mode
    try {
      setLoading(true);
      setError('');
      setResponse('');
      const result = await onSendPrompt(selectedModel, prompt);
      setResponse(result);
    } catch {
      setError('Failed to generate response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStreamingPrompt = async () => {
    if (!onStreamPrompt || !onStreamEvent) return;

    try {
      setIsStreaming(true);
      setError('');
      setResponse('');
      setStreamProgress('');

      // Setup stream event listener
      const cleanup = onStreamEvent((event: unknown) => {
        if (!isStreamEvent(event)) return;

        if (event.type === 'stream:started' && event.data.streamId) {
          setCurrentStreamId(String(event.data.streamId));
        } else if (event.type === 'stream:chunk' && event.data.content) {
          setStreamProgress((prev) => prev + String(event.data.content));
        } else if (event.type === 'stream:completed') {
          if (event.data.fullContent) {
            setResponse(String(event.data.fullContent));
          }
          setIsStreaming(false);
          setCurrentStreamId(null);
          setStreamProgress('');
          if (streamCleanupRef.current) {
            streamCleanupRef.current();
            streamCleanupRef.current = null;
          }
        } else if (event.type === 'stream:error') {
          const errorMessage =
            event.data.error &&
            typeof event.data.error === 'object' &&
            'message' in event.data.error
              ? String(event.data.error.message)
              : 'Unknown streaming error';
          setError(`Streaming error: ${errorMessage}`);
          setIsStreaming(false);
          setCurrentStreamId(null);
          setStreamProgress('');
          if (streamCleanupRef.current) {
            streamCleanupRef.current();
            streamCleanupRef.current = null;
          }
        }
      });

      streamCleanupRef.current = cleanup;

      // Start streaming
      const streamRequest: StreamRequest = {
        model: selectedModel,
        prompt,
        context: 'user-chat',
        userPrompt: prompt,
        contextData: {
          timestamp: Date.now(),
          model: selectedModel,
        },
      };

      await onStreamPrompt(streamRequest);
    } catch (error) {
      setError(`Failed to start streaming: ${error}`);
      setIsStreaming(false);
      setCurrentStreamId(null);
      setStreamProgress('');
      if (streamCleanupRef.current) {
        streamCleanupRef.current();
        streamCleanupRef.current = null;
      }
    }
  };

  const handleCancelStream = async () => {
    if (currentStreamId && onCancelStream) {
      try {
        await onCancelStream(currentStreamId, 'User cancelled');
        setIsStreaming(false);
        setCurrentStreamId(null);
        setStreamProgress('');
        if (streamCleanupRef.current) {
          streamCleanupRef.current();
          streamCleanupRef.current = null;
        }
      } catch {
        setError('Failed to cancel stream');
      }
    }
  };

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Cleanup stream event listener on unmount
  useEffect(() => {
    return () => {
      if (streamCleanupRef.current) {
        streamCleanupRef.current();
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      <Card title="Ollama Configuration">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">
              Ollama Host URL
            </label>
            <Input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="http://127.0.0.1:11434"
              className="w-full"
            />
          </div>
          <Button
            onClick={handleHostUpdate}
            disabled={hostLoading}
            variant="secondary"
          >
            {hostLoading ? 'Connecting...' : 'Connect'}
          </Button>
        </div>
      </Card>

      <Card title="Chat with Ollama">
        <div className="flex flex-col gap-4">
          <Select
            label="Model"
            value={selectedModel}
            onChange={setSelectedModel}
            options={models}
            placeholder="Select a model"
            disabled={models.length === 0 || loading}
          />

          {hasStreamingSupport && (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="streaming-mode"
                checked={streamingMode}
                onChange={(e) => setStreamingMode(e.target.checked)}
                className="rounded border-gray-300"
                disabled={loading || isStreaming}
              />
              <label htmlFor="streaming-mode" className="text-sm font-medium">
                Enable streaming mode (for debugging)
              </label>
            </div>
          )}

          <TextArea
            label="Prompt"
            value={prompt}
            onChange={setPrompt}
            placeholder="Enter your prompt here..."
            rows={6}
            disabled={loading || isStreaming}
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSendPrompt}
              disabled={
                loading || isStreaming || !selectedModel || !prompt.trim()
              }
              className="flex-1"
            >
              {isStreaming
                ? 'Streaming...'
                : loading
                  ? 'Generating...'
                  : streamingMode
                    ? 'Stream Prompt'
                    : 'Send Prompt'}
            </Button>
            {isStreaming && onCancelStream && (
              <Button
                onClick={handleCancelStream}
                variant="secondary"
                className="px-4"
              >
                Cancel
              </Button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {(response || streamProgress) && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {isStreaming ? 'Streaming Response:' : 'Response:'}
                {currentStreamId && (
                  <span className="ml-2 text-xs text-blue-600">
                    Stream ID: {currentStreamId}
                  </span>
                )}
              </h3>
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {isStreaming ? streamProgress : response}
                  {isStreaming && (
                    <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1" />
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
