/// <reference path="./types/window.d.ts" />
import React from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import {
  DashboardTemplate,
  BrowserPage,
  OllamaPage,
  SettingsPage,
  BrowserProvider,
  BrowserAPI,
} from '@packages/ui';
// Stream request interface (defined locally to avoid circular dependencies)
interface StreamRequest {
  model: string;
  prompt: string;
  context: string;
  userPrompt?: string;
  contextData?: Record<string, unknown>;
}

// Create a wrapper component to handle navigation
function DashboardWrapper({
  children,
  onStreamEvent,
}: {
  children: React.ReactNode;
  onStreamEvent?: (callback: (event: unknown) => void) => () => void;
}) {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = React.useState('browser');

  React.useEffect(() => {
    // Set initial route
    const path = window.location.hash.replace('#', '');
    const routeId = path.split('/')[1] || 'browser';
    setActiveRoute(routeId);
  }, []);

  const handleNavigate = (path: string) => {
    const routeId = path.split('/')[1] || 'home';
    setActiveRoute(routeId);
    navigate(path);
  };

  return (
    <DashboardTemplate
      activeRoute={activeRoute}
      onNavigate={handleNavigate}
      {...(onStreamEvent && { onStreamEvent })}
    >
      {children}
    </DashboardTemplate>
  );
}

// Home page component
function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Joby</h1>
      <p className="text-gray-600 mb-6">
        Your AI-powered job application assistant
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Browser</h2>
          <p className="text-gray-600">
            Navigate job sites and auto-detect application forms
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">AI Assistant</h2>
          <p className="text-gray-600">
            Get help writing cover letters and tailoring resumes
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Applications</h2>
          <p className="text-gray-600">
            Track and manage all your job applications
          </p>
        </div>
      </div>
    </div>
  );
}

// Placeholder components for other routes
function ApplicationsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Applications</h1>
      <p className="text-gray-600">Track your job applications here</p>
    </div>
  );
}

function DocumentsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>
      <p className="text-gray-600">Manage your resumes and cover letters</p>
    </div>
  );
}

export const App: React.FC = () => {
  // Create browser API adapter for Electron
  const browserAPI: BrowserAPI = {
    detectJobSite: async (url: string) => {
      if (window.electronAPI?.browser?.detectJobSite) {
        return window.electronAPI.browser.detectJobSite(url);
      }
      return null;
    },
  };

  // Ollama handlers
  const handleSendPrompt = async (
    model: string,
    prompt: string,
  ): Promise<string> => {
    if (window.electronAPI?.ollama?.sendPrompt) {
      return window.electronAPI.ollama.sendPrompt(model, prompt);
    }
    throw new Error('Ollama API not available');
  };

  // Streaming handlers
  const handleStreamPrompt = async (
    request: StreamRequest,
  ): Promise<string> => {
    if (window.electronAPI?.ollama?.streamPrompt) {
      return window.electronAPI.ollama.streamPrompt(request);
    }
    throw new Error('Ollama streaming API not available');
  };

  const handleCancelStream = async (
    streamId: string,
    reason?: string,
  ): Promise<void> => {
    if (window.electronAPI?.ollama?.cancelStream) {
      await window.electronAPI.ollama.cancelStream(streamId, reason);
    }
  };

  const handleOnStreamEvent = (callback: (event: unknown) => void) => {
    if (window.electronAPI?.ollama?.onStreamEvent) {
      return window.electronAPI.ollama.onStreamEvent(callback);
    }
    // Return empty cleanup function if no streaming support
    return () => {
      // No cleanup needed when streaming is not supported
    };
  };

  const handleGetModelObjects = async () => {
    if (window.electronAPI?.ollama?.getModels) {
      return window.electronAPI.ollama.getModels();
    }
    return [];
  };

  const handleSetHost = async (host: string) => {
    if (window.electronAPI?.ollama?.setHost) {
      await window.electronAPI.ollama.setHost(host);
    }
  };

  // Settings handlers
  const handleTestOllamaConnection = async () => {
    if (window.electronAPI?.ollama?.testConnection) {
      return window.electronAPI.ollama.testConnection();
    }
    return { connected: false };
  };

  const handleGetEnhancementConfig = async (): Promise<{
    enableCache: boolean;
    selectedModel?: string;
  }> => {
    if (window.electronAPI?.browser?.getEnhancementConfig) {
      const config = await window.electronAPI.browser.getEnhancementConfig();
      // Return only the fields expected by the new SettingsPage interface
      const result: { enableCache: boolean; selectedModel?: string } = {
        enableCache: config.enableCache,
      };
      if (config.selectedModel !== undefined) {
        result.selectedModel = config.selectedModel;
      }
      return result;
    }
    // LLM is always enabled now
    return { enableCache: true };
  };

  const handleUpdateEnhancementConfig = async (config: {
    enableCache: boolean;
    selectedModel?: string;
  }): Promise<void> => {
    if (window.electronAPI?.browser?.updateEnhancementConfig) {
      // Backend now expects the same interface as frontend (without enableLLM)
      await window.electronAPI.browser.updateEnhancementConfig(config);
    }
  };

  // LLM Status handlers
  const handleGetLLMStatus = async () => {
    if (window.electronAPI?.llm?.getStatus) {
      return window.electronAPI.llm.getStatus();
    }
    return { status: 'disconnected' as const };
  };

  const handleGetEnhancementDetails = async (fieldId: string) => {
    if (window.electronAPI?.llm?.getEnhancementDetails) {
      return window.electronAPI.llm.getEnhancementDetails(fieldId);
    }
    return undefined;
  };

  const handleGetOllamaHost = async () => {
    if (window.electronAPI?.ollama?.getHost) {
      return window.electronAPI.ollama.getHost();
    }
    return 'http://localhost:11434';
  };

  return (
    <Router>
      <BrowserProvider browserAPI={browserAPI}>
        <DashboardWrapper onStreamEvent={handleOnStreamEvent}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/browser"
              element={
                <BrowserPage
                  onGetLLMStatus={handleGetLLMStatus}
                  onGetEnhancementDetails={handleGetEnhancementDetails}
                />
              }
            />
            <Route
              path="/ollama"
              element={
                <OllamaPage
                  onSendPrompt={handleSendPrompt}
                  onGetModels={handleGetModelObjects}
                  onSetHost={handleSetHost}
                  onStreamPrompt={handleStreamPrompt}
                  onCancelStream={handleCancelStream}
                  onStreamEvent={handleOnStreamEvent}
                />
              }
            />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  onSetOllamaHost={handleSetHost}
                  onGetOllamaHost={handleGetOllamaHost}
                  onTestOllamaConnection={handleTestOllamaConnection}
                  onGetEnhancementConfig={handleGetEnhancementConfig}
                  onUpdateEnhancementConfig={handleUpdateEnhancementConfig}
                />
              }
            />
          </Routes>
        </DashboardWrapper>
      </BrowserProvider>
    </Router>
  );
};
