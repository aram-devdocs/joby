import { Ollama } from 'ollama';

export interface OllamaConfig {
  host?: string;
}

export interface OllamaModel {
  name: string;
  modified_at: Date | string;
  size: number;
  digest: string;
  details?: {
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaPromptRequest {
  model: string;
  prompt: string;
  stream?: boolean;
}

export interface OllamaPromptResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export type OllamaClient = InstanceType<typeof Ollama>;