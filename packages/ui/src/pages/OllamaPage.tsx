import { OllamaChat } from '../molecules/OllamaChat';
import type { StreamRequest } from '@packages/shared';

export interface OllamaPageProps {
  onSendPrompt: (model: string, prompt: string) => Promise<string>;
  onGetModels: () => Promise<Array<{ name: string; modified_at: string }>>;
  onSetHost: (host: string) => Promise<void>;
  initialHost?: string;
  // Streaming support props (optional for backward compatibility)
  onStreamPrompt?: (request: StreamRequest) => Promise<string>;
  onCancelStream?: (streamId: string, reason?: string) => Promise<void>;
  onStreamEvent?: (callback: (event: unknown) => void) => () => void;
}

export function OllamaPage({
  onSendPrompt,
  onGetModels,
  onSetHost,
  initialHost,
  onStreamPrompt,
  onCancelStream,
  onStreamEvent,
}: OllamaPageProps) {
  return (
    <div className="container mx-auto py-8">
      <OllamaChat
        onSendPrompt={onSendPrompt}
        onGetModels={onGetModels}
        onSetHost={onSetHost}
        {...(initialHost && { initialHost })}
        {...(onStreamPrompt && { onStreamPrompt })}
        {...(onCancelStream && { onCancelStream })}
        {...(onStreamEvent && { onStreamEvent })}
      />
    </div>
  );
}
