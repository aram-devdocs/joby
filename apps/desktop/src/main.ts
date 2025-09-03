import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { OllamaService } from '@packages/llm';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;
let ollamaService: OllamaService;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
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

// Initialize Ollama service
ollamaService = new OllamaService();

// IPC handlers for Ollama
ipcMain.handle('ollama:setHost', async (event, host: string) => {
  try {
    ollamaService.updateHost(host);
    return { success: true };
  } catch (error) {
    console.error('Failed to set Ollama host:', error);
    throw error;
  }
});

ipcMain.handle('ollama:getModels', async () => {
  try {
    const models = await ollamaService.listModels();
    return models;
  } catch (error) {
    console.error('Failed to get Ollama models:', error);
    throw error;
  }
});

ipcMain.handle('ollama:sendPrompt', async (event, model: string, prompt: string) => {
  try {
    const response = await ollamaService.sendPrompt({ model, prompt });
    return response.response;
  } catch (error) {
    console.error('Failed to send prompt to Ollama:', error);
    throw error;
  }
});