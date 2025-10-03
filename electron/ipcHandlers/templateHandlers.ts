import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { templateManager } from '../../backend/templateManager';

export function setupTemplateHandlers() {
  // List all templates
  ipcMain.handle('nova:templates:list', async () => {
    try {
      const templates = await templateManager.listTemplates();
      return { success: true, data: templates };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Get a specific template
  ipcMain.handle('nova:templates:get', async (event: IpcMainInvokeEvent, { key }: { key: string }) => {
    try {
      if (!key || typeof key !== 'string') {
        return { success: false, error: 'Invalid template key' };
      }

      const template = await templateManager.getTemplate(key);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      return { success: true, data: template };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });
}