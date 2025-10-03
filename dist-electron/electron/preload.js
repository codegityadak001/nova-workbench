"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api = {
    projects: {
        list: () => electron_1.ipcRenderer.invoke('nova:projects:list'),
        create: (options) => electron_1.ipcRenderer.invoke('nova:projects:create', options),
        start: (id, envOverrides) => electron_1.ipcRenderer.invoke('nova:projects:start', { id, envOverrides }),
        stop: (id) => electron_1.ipcRenderer.invoke('nova:projects:stop', { id }),
        restart: (id) => electron_1.ipcRenderer.invoke('nova:projects:restart', { id }),
        delete: (id, deleteFiles) => electron_1.ipcRenderer.invoke('nova:projects:delete', { id, deleteFiles }),
        getStatus: (id) => electron_1.ipcRenderer.invoke('nova:projects:status', { id }),
        installDeps: (id) => electron_1.ipcRenderer.invoke('nova:projects:install-deps', { id })
    },
    templates: {
        list: () => electron_1.ipcRenderer.invoke('nova:templates:list'),
        get: (key) => electron_1.ipcRenderer.invoke('nova:templates:get', { key })
    },
    system: {
        selectDirectory: () => electron_1.ipcRenderer.invoke('nova:system:select-directory'),
        openExternal: (url) => electron_1.ipcRenderer.invoke('nova:system:open-external', { url }),
        showItemInFolder: (path) => electron_1.ipcRenderer.invoke('nova:system:show-item-in-folder', { path })
    },
    on: (channel, callback) => {
        // Validate channel names to prevent security issues
        const allowedChannels = [
            'nova:projects:log',
            'nova:projects:status-changed',
            'nova:updater:available',
            'nova:node:download-progress'
        ];
        if (allowedChannels.includes(channel)) {
            electron_1.ipcRenderer.on(channel, callback);
        }
        else {
            console.error(`Channel not allowed: ${channel}`);
        }
    },
    off: (channel, callback) => {
        electron_1.ipcRenderer.off(channel, callback);
    }
};
// Expose the API to the renderer process
electron_1.contextBridge.exposeInMainWorld('nova', api);
