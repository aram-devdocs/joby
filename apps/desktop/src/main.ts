import { app, BrowserWindow, ipcMain } from 'electron';
import Store from 'electron-store';
import { OllamaService } from '@packages/llm';
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

// Initialize persistent store
const store = new Store<{
  enhancement: {
    enableLLM: boolean;
    enableCache: boolean;
    selectedModel: string;
  };
  ollama: {
    host: string;
  };
}>({
  defaults: {
    enhancement: {
      enableLLM: false,
      enableCache: true,
      selectedModel: 'llama3.2',
    },
    ollama: {
      host: 'http://localhost:11434',
    },
  },
});

// Initialize services
const ollamaService = new OllamaService();
const browserService = new BrowserService();
const formAnalyzer = new FormAnalyzer();
const formInteractionService = new FormInteractionService();

// Load saved settings
interface StoreType {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
}
const savedConfig = (store as unknown as StoreType).get('enhancement') as {
  enableLLM: boolean;
  selectedModel?: string;
};
formAnalyzer.setLLMEnabled(savedConfig.enableLLM);
if (savedConfig.selectedModel) {
  // Store the selected model for later use
}

const savedOllamaHost = (
  (store as unknown as StoreType).get('ollama') as { host: string }
).host;
if (savedOllamaHost) {
  ollamaService.updateHost(savedOllamaHost);
}

// IPC handlers for Ollama
ipcMain.handle('ollama:setHost', async (_event, host: string) => {
  ollamaService.updateHost(host);
  (store as unknown as StoreType).set('ollama', { host });
  return { success: true };
});

ipcMain.handle('ollama:getHost', () => {
  return ((store as unknown as StoreType).get('ollama') as { host: string })
    .host;
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

// Configuration handlers for field enhancement
ipcMain.handle('browser:setLLMEnabled', (_event, enabled: boolean) => {
  formAnalyzer.setLLMEnabled(enabled);
  return { success: true, llmEnabled: enabled };
});

ipcMain.handle('browser:getEnhancementConfig', () => {
  const config = (store as unknown as StoreType).get('enhancement');
  return config;
});

ipcMain.handle(
  'browser:updateEnhancementConfig',
  (
    _event,
    config: {
      enableLLM: boolean;
      enableCache: boolean;
      selectedModel?: string;
    },
  ) => {
    // Update the form analyzer configuration
    formAnalyzer.setLLMEnabled(config.enableLLM);

    // Save to persistent storage
    (store as unknown as StoreType).set('enhancement', {
      enableLLM: config.enableLLM,
      enableCache: config.enableCache,
      selectedModel: config.selectedModel || 'llama3.2',
    });

    return { success: true, config };
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
