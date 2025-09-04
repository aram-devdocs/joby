import React, { useState, useEffect } from "react";
import { Card } from "../atoms/card";
import { Input } from "../atoms/input";
import { Select } from "../atoms/select";
import { TextArea } from "../atoms/text-area";
import { Button } from "../atoms/button";

export interface OllamaChatProps {
  onSendPrompt: (model: string, prompt: string) => Promise<string>;
  onGetModels: () => Promise<Array<{ name: string; modified_at: string }>>;
  onSetHost: (host: string) => Promise<void>;
  initialHost?: string;
}

export const OllamaChat: React.FC<OllamaChatProps> = ({
  onSendPrompt,
  onGetModels,
  onSetHost,
  initialHost = "http://127.0.0.1:11434",
}) => {
  const [host, setHost] = useState(initialHost);
  const [models, setModels] = useState<Array<{ value: string; label: string }>>(
    [],
  );
  const [selectedModel, setSelectedModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hostLoading, setHostLoading] = useState(false);

  const loadModels = async () => {
    try {
      setHostLoading(true);
      setError("");
      const modelList = await onGetModels();
      const options = modelList.map((model) => ({
        value: model.name,
        label: model.name,
      }));
      setModels(options);
      if (options.length > 0 && !selectedModel) {
        setSelectedModel(options[0].value);
      }
    } catch (err) {
      setError("Failed to load models. Please check if Ollama is running.");
      setModels([]);
    } finally {
      setHostLoading(false);
    }
  };

  const handleHostUpdate = async () => {
    try {
      await onSetHost(host);
      await loadModels();
    } catch (err) {
      setError("Failed to connect to Ollama. Please check the URL.");
    }
  };

  const handleSendPrompt = async () => {
    if (!selectedModel || !prompt.trim()) {
      setError("Please select a model and enter a prompt.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResponse("");
      const result = await onSendPrompt(selectedModel, prompt);
      setResponse(result);
    } catch (err) {
      setError("Failed to generate response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
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
            {hostLoading ? "Connecting..." : "Connect"}
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

          <TextArea
            label="Prompt"
            value={prompt}
            onChange={setPrompt}
            placeholder="Enter your prompt here..."
            rows={6}
            disabled={loading}
          />

          <Button
            onClick={handleSendPrompt}
            disabled={loading || !selectedModel || !prompt.trim()}
          >
            {loading ? "Generating..." : "Send Prompt"}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {response && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Response:
              </h3>
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {response}
                </pre>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
