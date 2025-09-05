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

// Create a wrapper component to handle navigation
function DashboardWrapper({ children }: { children: React.ReactNode }) {
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
    <DashboardTemplate activeRoute={activeRoute} onNavigate={handleNavigate}>
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

  const handleGetEnhancementConfig = async () => {
    if (window.electronAPI?.browser?.getEnhancementConfig) {
      return window.electronAPI.browser.getEnhancementConfig();
    }
    return { enableStatic: true, enableLLM: false, enableCache: true };
  };

  const handleUpdateEnhancementConfig = async (config: {
    enableStatic: boolean;
    enableLLM: boolean;
    enableCache: boolean;
    selectedModel?: string;
  }): Promise<void> => {
    if (window.electronAPI?.browser?.updateEnhancementConfig) {
      await window.electronAPI.browser.updateEnhancementConfig(config);
    }
  };

  return (
    <Router>
      <BrowserProvider browserAPI={browserAPI}>
        <DashboardWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browser" element={<BrowserPage />} />
            <Route
              path="/ollama"
              element={
                <OllamaPage
                  onSendPrompt={handleSendPrompt}
                  onGetModels={handleGetModelObjects}
                  onSetHost={handleSetHost}
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
