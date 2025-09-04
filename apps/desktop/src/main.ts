import { app, BrowserWindow, ipcMain } from 'electron';
import { OllamaService } from '@packages/llm';
import { BrowserService, FormAnalyzer } from '@packages/browser';

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

// Initialize services
const ollamaService = new OllamaService();
const browserService = new BrowserService();
const formAnalyzer = new FormAnalyzer();

// IPC handlers for Ollama
ipcMain.handle('ollama:setHost', async (_event, host: string) => {
  ollamaService.updateHost(host);
  return { success: true };
});

ipcMain.handle('ollama:getModels', async () => {
  const models = await ollamaService.listModels();
  return models;
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

ipcMain.handle('browser:analyzeHTML', (_event, html: string) => {
  const forms = formAnalyzer.analyzeHTML(html);
  const summary = formAnalyzer.generateFormSummary(forms);
  return { forms, summary };
});

ipcMain.on('browser:navigationStart', (_event, url: string) => {
  browserService.onNavigationStart(url);
});

ipcMain.on(
  'browser:navigationComplete',
  (_event, url: string, title?: string) => {
    browserService.onNavigationComplete(url, title);
  },
);
