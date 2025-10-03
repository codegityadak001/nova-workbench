import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface
export interface NovaAPI {
  // Project operations
  projects: {
    list: () => Promise<any[]>;
    create: (options: any) => Promise<any>;
    start: (id: string, envOverrides?: Record<string, string>) => Promise<any>;
    stop: (id: string) => Promise<any>;
    restart: (id: string) => Promise<any>;
    delete: (id: string, deleteFiles?: boolean) => Promise<any>;
    getStatus: (id: string) => Promise<any>;
    installDeps: (id: string) => Promise<any>;
  };

  // Template operations
  templates: {
    list: () => Promise<any[]>;
    get: (key: string) => Promise<any>;
  };

  // System operations
  system: {
    selectDirectory: () => Promise<string | null>;
    openExternal: (url: string) => Promise<void>;
    showItemInFolder: (path: string) => Promise<void>;
  };

  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api: NovaAPI = {
  projects: {
    list: () => ipcRenderer.invoke('nova:projects:list'),
    create: (options) => ipcRenderer.invoke('nova:projects:create', options),
    start: (id, envOverrides) => ipcRenderer.invoke('nova:projects:start', { id, envOverrides }),
    stop: (id) => ipcRenderer.invoke('nova:projects:stop', { id }),
    restart: (id) => ipcRenderer.invoke('nova:projects:restart', { id }),
    delete: (id, deleteFiles) => ipcRenderer.invoke('nova:projects:delete', { id, deleteFiles }),
    getStatus: (id) => ipcRenderer.invoke('nova:projects:status', { id }),
    installDeps: (id) => ipcRenderer.invoke('nova:projects:install-deps', { id })
  },

  templates: {
    list: () => ipcRenderer.invoke('nova:templates:list'),
    get: (key) => ipcRenderer.invoke('nova:templates:get', { key })
  },

  system: {
    selectDirectory: () => ipcRenderer.invoke('nova:system:select-directory'),
    openExternal: (url) => ipcRenderer.invoke('nova:system:open-external', { url }),
    showItemInFolder: (path) => ipcRenderer.invoke('nova:system:show-item-in-folder', { path })
  },

  on: (channel: string, callback: (...args: any[]) => void) => {
    // Validate channel names to prevent security issues
    const allowedChannels = [
      'nova:projects:log',
      'nova:projects:status-changed',
      'nova:updater:available',
      'nova:node:download-progress'
    ];

    if (allowedChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    } else {
      console.error(`Channel not allowed: ${channel}`);
    }
  },

  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.off(channel, callback);
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('nova', api);

// Also expose it as a type for TypeScript
declare global {
  interface Window {
    nova: NovaAPI;
  }
}