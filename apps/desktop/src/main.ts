import { app, BrowserWindow, ipcMain } from 'electron';
import Store from 'electron-store';

type StoreSchema = {
  enhancement: {
    enableCache: boolean;
    selectedModel: string;
  };
  ollama: {
    host: string;
  };
};
import {
  OllamaService,
  OllamaStreamManager,
  eventBus,
  StreamLogger,
  type StreamRequest,
  type StreamEvent,
} from '@packages/llm';
import {
  BrowserService,
  FormAnalyzer,
  FormInteractionService,
  type FormField,
  type TypingOptions,
} from '@packages/browser';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true, // Enable webview tag
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Initialize persistent store with wrapper for type safety
const storeInstance = new Store<StoreSchema>({
  defaults: {
    enhancement: {
      enableCache: true,
      selectedModel: 'llama3.2',
    },
    ollama: {
      host: 'http://localhost:11434',
    },
  },
});

// Type-safe store wrapper
const store = {
  get: <K extends keyof StoreSchema>(key: K): StoreSchema[K] => {
    return (
      storeInstance as unknown as { get: (key: K) => StoreSchema[K] }
    ).get(key);
  },
  set: <K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): void => {
    (
      storeInstance as unknown as {
        set: (key: K, value: StoreSchema[K]) => void;
      }
    ).set(key, value);
  },
};

// Initialize services
const ollamaService = new OllamaService();
const ollamaStreamManager = new OllamaStreamManager();
const streamLogger = new StreamLogger();
const browserService = new BrowserService();
// Load saved settings
const savedConfig = store.get('enhancement');
const savedOllamaHost = store.get('ollama').host;

// Initialize FormAnalyzer with configuration
const formAnalyzer = new FormAnalyzer({
  enableCache: savedConfig.enableCache,
  selectedModel: savedConfig.selectedModel,
  ollamaHost: savedOllamaHost,
});
const formInteractionService = new FormInteractionService();

// LLM is always enabled now
formAnalyzer.setLLMEnabled(true);
if (savedOllamaHost) {
  ollamaService.updateHost(savedOllamaHost);
  ollamaStreamManager.updateHost(savedOllamaHost);
}

// Auto-connect to Ollama on startup with retry logic
let retryCount = 0;
const maxRetries = 3;
const retryDelay = 2000;

const connectToOllama = async () => {
  try {
    const models = await ollamaService.listModels();
    if (models.length > 0) {
      // Successfully connected
      if (mainWindow) {
        mainWindow.webContents.send('llm:status', {
          status: 'connected',
          message: 'Connected to Ollama',
          models,
        });
      }
      return true;
    }
  } catch (error) {
    retryCount++;
    if (retryCount <= maxRetries) {
      if (mainWindow) {
        mainWindow.webContents.send('llm:status', {
          status: 'connecting',
          message: `Attempting to connect to Ollama (attempt ${retryCount}/${maxRetries})...`,
        });
      }
      setTimeout(connectToOllama, retryDelay);
    } else {
      if (mainWindow) {
        mainWindow.webContents.send('llm:status', {
          status: 'error',
          message: 'Failed to connect to Ollama after multiple attempts',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }
  return false;
};

// Set up event bus for streaming
eventBus.subscribe((event: StreamEvent) => {
  // Log all stream events
  streamLogger.logEvent(event);

  // Forward stream events to renderer
  if (mainWindow) {
    mainWindow.webContents.send('ollama:streamEvent', event);
  }
});

// Start auto-connect after app is ready
app.whenReady().then(() => {
  setTimeout(connectToOllama, 1000);
});

// IPC handlers for Ollama
ipcMain.handle('ollama:setHost', async (_event, host: string) => {
  ollamaService.updateHost(host);
  ollamaStreamManager.updateHost(host);
  store.set('ollama', { host });
  return { success: true };
});

ipcMain.handle('ollama:getHost', () => {
  return store.get('ollama').host;
});

ipcMain.handle('ollama:getModels', async () => {
  const models = await ollamaService.listModels();
  return models;
});

ipcMain.handle('ollama:testConnection', async () => {
  try {
    const models = await ollamaService.listModels();
    return { connected: true, models };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
});

ipcMain.handle(
  'ollama:sendPrompt',
  async (_event, model: string, prompt: string) => {
    const response = await ollamaService.sendPrompt({ model, prompt });
    return response.response;
  },
);

// Streaming IPC handlers
ipcMain.handle(
  'ollama:streamPrompt',
  async (
    _event,
    request: {
      model: string;
      prompt: string;
      context: string;
      userPrompt?: string;
      contextData?: Record<string, unknown>;
    },
  ) => {
    const streamRequest: StreamRequest = {
      model: request.model,
      prompt: request.prompt,
      context: request.context as
        | 'form-analysis'
        | 'user-chat'
        | 'settings-test'
        | 'debug-manual',
      ...(request.userPrompt && { userPrompt: request.userPrompt }),
      ...(request.contextData && { contextData: request.contextData }),
    };

    const streamId = await ollamaStreamManager.startStream(streamRequest);
    return streamId;
  },
);

ipcMain.handle(
  'ollama:cancelStream',
  async (_event, streamId: string, reason?: string) => {
    const cancelled = await ollamaStreamManager.cancelStream(streamId, reason);
    return { cancelled };
  },
);

ipcMain.handle('ollama:getStreamInfo', async (_event, streamId: string) => {
  const info = ollamaStreamManager.getStreamInfo(streamId);
  return info;
});

ipcMain.handle('ollama:getActiveStreams', async () => {
  const streams = ollamaStreamManager.getActiveStreams();
  return streams;
});

// IPC handlers for Browser service
ipcMain.handle('browser:getCurrentUrl', () => {
  return browserService.getCurrentUrl();
});

ipcMain.handle('browser:getHistory', () => {
  return browserService.getHistory();
});

ipcMain.handle('browser:detectJobSite', (_event, url: string) => {
  return browserService.detectJobSite(url);
});

ipcMain.handle(
  'browser:analyzeHTML',
  async (_event, html: string, pageUrl?: string, pageTitle?: string) => {
    // Use enhanced analyzer for intelligent field detection
    const forms = await formAnalyzer.analyzeHTML(html, pageTitle, pageUrl);
    const summary = formAnalyzer.generateFormSummary(forms);
    return { forms, summary };
  },
);

// LLM Status handlers
ipcMain.handle('llm:getStatus', async () => {
  return formAnalyzer.getLLMStatus();
});

ipcMain.handle('llm:getEnhancementDetails', async (_event, fieldId: string) => {
  // Get enhancement details for a specific field
  const details = formAnalyzer.getFieldEnhancementDetails(fieldId);
  return details;
});

ipcMain.handle('llm:reconnect', async () => {
  // Manual reconnect attempt
  retryCount = 0;
  return connectToOllama();
});

ipcMain.handle('browser:getEnhancementConfig', () => {
  const config = store.get('enhancement');
  // Always return enableLLM as true for backward compatibility
  return { ...config, enableLLM: true };
});

ipcMain.handle(
  'browser:updateEnhancementConfig',
  (
    _event,
    config: {
      enableLLM?: boolean; // Keep for backward compatibility but ignore
      enableCache: boolean;
      selectedModel?: string;
    },
  ) => {
    // LLM is always enabled now, ignore enableLLM if provided
    if (config.selectedModel) {
      formAnalyzer.setSelectedModel(config.selectedModel);
    }

    // Save to persistent storage (without enableLLM)
    store.set('enhancement', {
      enableCache: config.enableCache,
      selectedModel: config.selectedModel || 'llama3.2',
    });

    return { success: true, config: { ...config, enableLLM: true } };
  },
);

ipcMain.on('browser:navigationStart', (_event, url: string) => {
  browserService.onNavigationStart(url);
});

ipcMain.on(
  'browser:navigationComplete',
  (_event, url: string, title?: string) => {
    browserService.onNavigationComplete(url, title);
  },
);

// IPC handlers for Form Interaction
ipcMain.handle(
  'form:updateField',
  (_event, field: FormField, value: string, options?: TypingOptions) => {
    const script = formInteractionService.generateFieldUpdateScript(
      field,
      value,
      options,
    );
    return { script };
  },
);

ipcMain.handle('form:focusField', (_event, field: FormField) => {
  const script = formInteractionService.generateFieldFocusScript(field);
  return { script };
});

ipcMain.handle('form:getFieldValue', (_event, field: FormField) => {
  const script = formInteractionService.generateFieldValueScript(field);
  return { script };
});

ipcMain.handle('form:monitorFields', (_event, fields: FormField[]) => {
  const script = formInteractionService.generateFieldMonitorScript(fields);
  return { script };
});
