import type { Meta, StoryObj } from '@storybook/react';
import { OllamaChat, OllamaChatProps } from './OllamaChat';
import { useState } from 'react';

const meta = {
  title: 'Molecules/OllamaChat',
  component: OllamaChat,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An interactive chat interface for communicating with Ollama AI models. Includes model selection, host configuration, and streaming responses.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    initialHost: {
      control: 'text',
      description: 'Initial Ollama host URL',
    },
    onSendPrompt: {
      action: 'promptSent',
      description: 'Handler for sending prompts to the model',
    },
    onGetModels: {
      action: 'modelsRequested',
      description: 'Handler for fetching available models',
    },
    onSetHost: {
      action: 'hostSet',
      description: 'Handler for updating the host URL',
    },
  },
} satisfies Meta<typeof OllamaChat>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockModels = [
  { name: 'llama2', modified_at: '2024-01-15T10:30:00Z' },
  { name: 'mistral', modified_at: '2024-01-15T09:20:00Z' },
  { name: 'codellama', modified_at: '2024-01-14T15:45:00Z' },
  { name: 'phi-2', modified_at: '2024-01-14T12:00:00Z' },
];

const mockResponses = [
  "Hello! I'm a mock Ollama model. How can I help you today?",
  "That's an interesting question! Let me provide you with a detailed response...\n\nBased on the context you've provided, here are some key points to consider:\n\n1. First, we should analyze the problem\n2. Then, we can explore potential solutions\n3. Finally, we'll implement the best approach\n\nWould you like me to elaborate on any of these points?",
  "I understand you're looking for assistance. Here's what I can tell you:\n\nThe solution involves multiple steps that need to be carefully executed. Each step builds upon the previous one, creating a comprehensive approach to solving your problem.",
  'Processing your request...\n\nAnalysis complete. Here are my findings:\n• Point 1: Important consideration\n• Point 2: Another key factor\n• Point 3: Final recommendation\n\nLet me know if you need more details!',
];

export const Default: Story = {
  args: {
    initialHost: 'http://127.0.0.1:11434',
    onGetModels: async () => mockModels,
    onSetHost: async (host: string) => {
      action('host-set')(host);
    },
    onSendPrompt: async (model: string, prompt: string) => {
      action('prompt-sent')({ model, prompt });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockResponses[Math.floor(Math.random() * mockResponses.length)];
    },
  },
};

export const WithCustomHost: Story = {
  args: {
    initialHost: 'http://localhost:8080',
    onGetModels: async () => mockModels,
    onSetHost: async (host: string) => {
      action('custom-host-set')(host);
    },
    onSendPrompt: async (model: string, prompt: string) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return `Response from custom host for prompt: "${prompt}"`;
    },
  },
};

export const NoModelsAvailable: Story = {
  args: {
    initialHost: 'http://127.0.0.1:11434',
    onGetModels: async () => {
      throw new Error('Failed to connect to Ollama');
    },
    onSetHost: async (host: string) => {
      action('host-set')(host);
    },
    onSendPrompt: async (model: string, prompt: string) => {
      return "This shouldn't be reachable without models";
    },
  },
};

export const SlowResponse: Story = {
  args: {
    initialHost: 'http://127.0.0.1:11434',
    onGetModels: async () => mockModels,
    onSetHost: async (host: string) => {
      action('host-set')(host);
    },
    onSendPrompt: async (model: string, prompt: string) => {
      action('simulating-slow-response')();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return 'This response took 3 seconds to generate. In a real scenario, this could be a complex query that requires more processing time.';
    },
  },
};

export const ErrorHandling: Story = {
  args: {
    initialHost: 'http://127.0.0.1:11434',
    onGetModels: async () => mockModels,
    onSetHost: async (host: string) => {
      if (host.includes('error')) {
        throw new Error('Invalid host configuration');
      }
      action('host-set-successfully')();
    },
    onSendPrompt: async (model: string, prompt: string) => {
      if (prompt.toLowerCase().includes('error')) {
        throw new Error('Failed to generate response');
      }
      return 'Response generated successfully!';
    },
  },
};

export const WithManyModels: Story = {
  args: {
    initialHost: 'http://127.0.0.1:11434',
    onGetModels: async () => [
      { name: 'gpt-4', modified_at: '2024-01-15T10:30:00Z' },
      { name: 'gpt-3.5-turbo', modified_at: '2024-01-15T09:20:00Z' },
      { name: 'claude-2', modified_at: '2024-01-14T15:45:00Z' },
      { name: 'llama2-7b', modified_at: '2024-01-14T12:00:00Z' },
      { name: 'llama2-13b', modified_at: '2024-01-14T11:00:00Z' },
      { name: 'llama2-70b', modified_at: '2024-01-14T10:00:00Z' },
      { name: 'mistral-7b', modified_at: '2024-01-13T16:00:00Z' },
      { name: 'mixtral-8x7b', modified_at: '2024-01-13T14:00:00Z' },
      { name: 'phi-2', modified_at: '2024-01-12T09:00:00Z' },
      { name: 'codellama', modified_at: '2024-01-11T13:00:00Z' },
    ],
    onSetHost: async (host: string) => {
      action('host-updated')(host);
    },
    onSendPrompt: async (model: string, prompt: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return `Response from ${model}: "${prompt}" has been processed.`;
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [responses, setResponses] = useState<string[]>([]);

    return (
      <OllamaChat
        initialHost="http://127.0.0.1:11434"
        onGetModels={async () => mockModels}
        onSetHost={async (host: string) => {
          action('host-set')(host);
        }}
        onSendPrompt={async (model: string, prompt: string) => {
          const response = `[${model}] ${prompt} -> Generated response #${responses.length + 1}`;
          setResponses((prev) => [...prev, response]);
          await new Promise((resolve) => setTimeout(resolve, 500));
          return response;
        }}
      />
    );
  },
};
