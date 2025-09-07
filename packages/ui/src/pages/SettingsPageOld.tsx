import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms';
import { Button } from '../atoms/button';
import { Badge } from '../atoms/badge';
import {
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export interface SettingsPageProps {
  onSetOllamaHost?: (host: string) => Promise<void>;
  onGetOllamaHost?: () => Promise<string>;
  onGetOllamaModels?: () => Promise<string[]>;
  onTestOllamaConnection?: () => Promise<{
    connected: boolean;
    models?: Array<string | { name: string; [key: string]: unknown }>;
  }>;
  onGetEnhancementConfig?: () => Promise<{
    enableLLM: boolean;
    enableCache: boolean;
    selectedModel?: string;
  }>;
  onUpdateEnhancementConfig?: (config: {
    enableLLM: boolean;
    enableCache: boolean;
    selectedModel?: string;
  }) => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onSetOllamaHost,
  onGetOllamaHost,
  onTestOllamaConnection,
  onGetEnhancementConfig,
  onUpdateEnhancementConfig,
}) => {
  const [ollamaHost, setOllamaHost] = useState('http://localhost:11434');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');

  // Form enhancement settings (LLM is always enabled)
  const [enableCache, setEnableCache] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);

  // Load initial configuration
  useEffect(() => {
    if (onGetEnhancementConfig) {
      onGetEnhancementConfig()
        .then((config) => {
          // LLM is always enabled, no need to set enableLLM
          setEnableCache(config.enableCache);
          if (config.selectedModel !== undefined) {
            setSelectedModel(config.selectedModel);
          }
        })
        .catch(() => {
          // Silently handle config loading errors - use defaults
        });
    }
  }, [onGetEnhancementConfig]);

  // Auto-connect function defined before usage
  const autoConnect = useCallback(async () => {
    if (!onTestOllamaConnection || isAutoConnecting) return;

    setIsAutoConnecting(true);
    setConnectionError('');

    try {
      const result = await onTestOllamaConnection();
      setIsConnected(result.connected);

      if (result.connected && result.models) {
        const modelNames = result.models
          .map((model) => (typeof model === 'string' ? model : model.name))
          .filter(Boolean);

        setOllamaModels(modelNames);
        if (!selectedModel && modelNames.length > 0 && modelNames[0]) {
          setSelectedModel(modelNames[0]);
        }
      }
    } catch {
      setIsConnected(false);
    } finally {
      setIsAutoConnecting(false);
    }
  }, [onTestOllamaConnection, isAutoConnecting, selectedModel]);

  // Load saved Ollama host and auto-connect
  useEffect(() => {
    if (onGetOllamaHost) {
      onGetOllamaHost()
        .then((host) => {
          setOllamaHost(host);
          // Auto-connect on mount
          autoConnect();
        })
        .catch(() => {
          // Silently handle host loading errors - use default
          // Still try to connect with default host
          autoConnect();
        });
    } else {
      // Try to connect even if no host getter
      autoConnect();
    }
  }, [onGetOllamaHost, autoConnect]);

  const testConnection = async () => {
    if (!onTestOllamaConnection) return;

    setIsTestingConnection(true);
    setConnectionError('');

    try {
      const result = await onTestOllamaConnection();
      setIsConnected(result.connected);

      if (result.connected && result.models) {
        // Extract model names from Ollama model objects
        const modelNames = result.models
          .map((model) => (typeof model === 'string' ? model : model.name))
          .filter(Boolean);

        setOllamaModels(modelNames);
        if (!selectedModel && modelNames.length > 0 && modelNames[0]) {
          setSelectedModel(modelNames[0]);
        }
      } else {
        setOllamaModels([]);
      }

      if (!result.connected) {
        setConnectionError(
          'Failed to connect to Ollama. Please check the host URL and ensure Ollama is running.',
        );
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionError(
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleHostChange = async () => {
    if (onSetOllamaHost) {
      try {
        await onSetOllamaHost(ollamaHost);
        await testConnection();
      } catch (error) {
        setConnectionError(
          error instanceof Error ? error.message : 'Failed to update host',
        );
      }
    }
  };

  const handleSettingsChange = (setting: string, value: boolean | string) => {
    setHasUnsavedChanges(true);

    switch (setting) {
      case 'enableCache':
        setEnableCache(value as boolean);
        break;
      case 'selectedModel':
        setSelectedModel(value as string);
        break;
    }
  };

  const saveSettings = async () => {
    if (!onUpdateEnhancementConfig) return;

    try {
      await onUpdateEnhancementConfig({
        enableLLM: true, // Always true
        enableCache,
        ...(selectedModel && { selectedModel }),
      });
      setHasUnsavedChanges(false);
    } catch {
      // Silently handle save errors - user can retry
    }
  };

  const getConnectionStatus = () => {
    if (isTestingConnection || isAutoConnecting) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          {isAutoConnecting ? 'Connecting...' : 'Testing...'}
        </Badge>
      );
    }

    if (isConnected) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Connected
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Disconnected
      </Badge>
    );
  };

  const getEnhancementStatus = () => {
    // LLM is always enabled, show connection status
    if (isConnected) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI Active
        </Badge>
      );
    }

    if (isAutoConnecting) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Connecting to AI...
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        AI Offline
      </Badge>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600">
            Configure your preferences and connections
          </p>
        </div>
        {getEnhancementStatus()}
      </div>

      {/* AI Enhancement Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Enhancement
            </CardTitle>
            {getEnhancementStatus()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">
                  AI Enhancement is Always Active
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Joby uses AI to intelligently detect and classify form fields
                  for better autofill accuracy.
                  {isConnected
                    ? ' The AI is currently connected and processing fields.'
                    : ' Waiting for AI connection...'}
                </p>
              </div>
            </div>
          </div>

          {/* Model Selection (only show when connected) */}
          {isConnected && ollamaModels.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                AI Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) =>
                  handleSettingsChange('selectedModel', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a model...</option>
                {ollamaModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Different models may have varying accuracy and speed.
              </p>
            </div>
          )}

          {/* Cache Settings */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={enableCache}
                onChange={(e) =>
                  handleSettingsChange('enableCache', e.target.checked)
                }
                className="rounded"
              />
              <div>
                <span className="font-medium">Enable Result Caching</span>
                <p className="text-sm text-gray-600">
                  Cache AI analysis results to improve performance on frequently
                  visited pages
                </p>
              </div>
            </label>
          </div>

          {hasUnsavedChanges && (
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <span className="text-sm text-yellow-700">
                You have unsaved changes
              </span>
              <Button onClick={saveSettings} size="sm">
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ollama Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Ollama Configuration
            </CardTitle>
            {getConnectionStatus()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ollama Host URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ollamaHost}
                onChange={(e) => setOllamaHost(e.target.value)}
                placeholder="http://localhost:11434"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleHostChange} disabled={isTestingConnection}>
                Update & Test
              </Button>
            </div>
          </div>

          {connectionError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-700">{connectionError}</p>
                <Button
                  onClick={testConnection}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Connection Instructions */}
          {!isConnected && !isAutoConnecting && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-700">
                AI enhancement requires Ollama to be running. Please ensure
                Ollama is installed and running at {ollamaHost}.
              </p>
            </div>
          )}

          <Button
            onClick={testConnection}
            disabled={isTestingConnection}
            variant="outline"
            className="w-full"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
