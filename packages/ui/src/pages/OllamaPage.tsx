import React from "react";
import { OllamaChat } from "../molecules/OllamaChat";

export interface OllamaPageProps {
  onSendPrompt: (model: string, prompt: string) => Promise<string>;
  onGetModels: () => Promise<Array<{ name: string; modified_at: string }>>;
  onSetHost: (host: string) => Promise<void>;
  initialHost?: string;
}

export function OllamaPage({
  onSendPrompt,
  onGetModels,
  onSetHost,
  initialHost,
}: OllamaPageProps) {
  return (
    <div className="container mx-auto py-8">
      <OllamaChat
        onSendPrompt={onSendPrompt}
        onGetModels={onGetModels}
        onSetHost={onSetHost}
        initialHost={initialHost}
      />
    </div>
  );
}
