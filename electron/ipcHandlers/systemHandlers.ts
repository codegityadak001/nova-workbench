import { ipcMain, IpcMainInvokeEvent, dialog, shell } from 'electron';

export function setupSystemHandlers(mainWindow: Electron.BrowserWindow) {
  // Select directory dialog
  ipcMain.handle('nova:system:select-directory', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Project Directory'
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: true, data: null };
      }

      return { success: true, data: result.filePaths[0] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Open external URL
  ipcMain.handle('nova:system:open-external', async (event: IpcMainInvokeEvent, { url }: { url: string }) => {
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

      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Show item in folder
  ipcMain.handle('nova:system:show-item-in-folder', async (event: IpcMainInvokeEvent, { path }: { path: string }) => {
    try {
      if (!path || typeof path !== 'string') {
        return { success: false, error: 'Invalid path' };
      }

      shell.showItemInFolder(path);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });
}