import React, { useState } from 'react';
import { OllamaChat } from '@packages/ui';

export const App: React.FC = () => {
  const handleSendPrompt = async (model: string, prompt: string): Promise<string> => {
    try {
      const response = await window.electronAPI.ollama.sendPrompt(model, prompt);
      return response;
    } catch (error) {
      console.error('Failed to send prompt:', error);
      throw error;
    }
  };

  const handleGetModels = async (): Promise<Array<{ name: string; modified_at: string }>> => {
    try {
      const models = await window.electronAPI.ollama.getModels();
      return models;
    } catch (error) {
      console.error('Failed to get models:', error);
      throw error;
    }
  };

  const handleSetHost = async (host: string): Promise<void> => {
    try {
      await window.electronAPI.ollama.setHost(host);
    } catch (error) {
      console.error('Failed to set host:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <OllamaChat
        onSendPrompt={handleSendPrompt}
        onGetModels={handleGetModels}
        onSetHost={handleSetHost}
        initialHost="http://127.0.0.1:11434"
      />
    </div>
  );
};