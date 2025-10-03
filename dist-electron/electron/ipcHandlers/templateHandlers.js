"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTemplateHandlers = setupTemplateHandlers;
const electron_1 = require("electron");
const templateManager_1 = require("../../backend/templateManager");
function setupTemplateHandlers() {
    // List all templates
    electron_1.ipcMain.handle('nova:templates:list', async () => {
        try {
            const templates = await templateManager_1.templateManager.listTemplates();
            return { success: true, data: templates };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
    // Get a specific template
    electron_1.ipcMain.handle('nova:templates:get', async (event, { key }) => {
        try {
            if (!key || typeof key !== 'string') {
                return { success: false, error: 'Invalid template key' };
            }
            const template = await templateManager_1.templateManager.getTemplate(key);
            if (!template) {
                return { success: false, error: 'Template not found' };
            }
            return { success: true, data: template };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
}
