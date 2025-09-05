import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms';
import { Button } from '../atoms/button';
import { Badge } from '../atoms/badge';
import {
  Settings,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Loader2,
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
    enableStatic: boolean;
    enableLLM: boolean;
    enableCache: boolean;
    selectedModel?: string;
  }>;
  onUpdateEnhancementConfig?: (config: {
    enableStatic: boolean;
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

  // Form enhancement settings
  const [enableStatic, setEnableStatic] = useState(true);
  const [enableLLM, setEnableLLM] = useState(false);
  const [enableCache, setEnableCache] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load initial configuration
  useEffect(() => {
    if (onGetEnhancementConfig) {
      onGetEnhancementConfig()
        .then((config) => {
          setEnableStatic(config.enableStatic);
          setEnableLLM(config.enableLLM);
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

  // Load saved Ollama host
  useEffect(() => {
    if (onGetOllamaHost) {
      onGetOllamaHost()
        .then((host) => {
          setOllamaHost(host);
        })
        .catch(() => {
          // Silently handle host loading errors - use default
        });
    }
  }, [onGetOllamaHost]);

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
      case 'enableStatic':
        setEnableStatic(value as boolean);
        break;
      case 'enableLLM':
        setEnableLLM(value as boolean);
        break;
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
        enableStatic,
        enableLLM,
        enableCache,
        ...(selectedModel && { selectedModel }),
      });
      setHasUnsavedChanges(false);
    } catch {
      // Silently handle save errors - user can retry
    }
  };

  const getConnectionStatus = () => {
    if (isTestingConnection) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Testing...
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
    if (enableLLM && enableStatic) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Enhanced (Static + AI)
        </Badge>
      );
    } else if (enableLLM && isConnected) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          AI Enhanced
        </Badge>
      );
    } else if (enableStatic) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Settings className="h-3 w-3" />
          Static Enhanced
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        Basic Only
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

      {/* Form Enhancement Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Form Field Enhancement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Static Enhancement */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={enableStatic}
                  onChange={(e) =>
                    handleSettingsChange('enableStatic', e.target.checked)
                  }
                  className="rounded"
                />
                <div>
                  <span className="font-medium">Static Enhancement</span>
                  <p className="text-sm text-gray-600">
                    Pattern-based field detection using regex and heuristics
                  </p>
                </div>
              </label>
            </div>

            {/* Cache Settings */}
            <div className="space-y-3">
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
                  <span className="font-medium">Enable Caching</span>
                  <p className="text-sm text-gray-600">
                    Cache enhancement results for better performance
                  </p>
                </div>
              </label>
            </div>

            {/* LLM Enhancement */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={enableLLM}
                  onChange={(e) =>
                    handleSettingsChange('enableLLM', e.target.checked)
                  }
                  className="rounded"
                  disabled={!isConnected}
                />
                <div>
                  <span className="font-medium">AI Enhancement</span>
                  <p className="text-sm text-gray-600">
                    Use Ollama LLM for intelligent field classification
                    {!isConnected && (
                      <span className="text-red-500">
                        {' '}
                        (Requires Ollama connection)
                      </span>
                    )}
                  </p>
                </div>
              </label>
            </div>
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
              <p className="text-sm text-red-700">{connectionError}</p>
            </div>
          )}

          {/* Model Selection */}
          {isConnected && ollamaModels.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Model for Enhancement
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
