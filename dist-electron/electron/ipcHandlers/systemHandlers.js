"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSystemHandlers = setupSystemHandlers;
const electron_1 = require("electron");
function setupSystemHandlers(mainWindow) {
    // Select directory dialog
    electron_1.ipcMain.handle('nova:system:select-directory', async () => {
        try {
            const result = await electron_1.dialog.showOpenDialog(mainWindow, {
                properties: ['openDirectory'],
                title: 'Select Project Directory'
            });
            if (result.canceled || result.filePaths.length === 0) {
                return { success: true, data: null };
            }
            return { success: true, data: result.filePaths[0] };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
    // Open external URL
    electron_1.ipcMain.handle('nova:system:open-external', async (event, { url }) => {
        try {
            if (!url || typeof url !== 'string') {
                return { success: false, error: 'Invalid URL' };
            }
            // Validate URL for security
            const validProtocols = ['http:', 'https:', 'mailto:'];
            const urlObj = new URL(url);
            if (!validProtocols.includes(urlObj.protocol)) {
                return { success: false, error: 'Invalid URL protocol' };
            }
            await electron_1.shell.openExternal(url);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
    // Show item in folder
    electron_1.ipcMain.handle('nova:system:show-item-in-folder', async (event, { path }) => {
        try {
            if (!path || typeof path !== 'string') {
                return { success: false, error: 'Invalid path' };
            }
            electron_1.shell.showItemInFolder(path);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
}
