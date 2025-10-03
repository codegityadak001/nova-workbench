"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupProjectHandlers = setupProjectHandlers;
const electron_1 = require("electron");
const projectManager_1 = require("../../backend/projectManager");
function setupProjectHandlers(mainWindow) {
    // List all projects
    electron_1.ipcMain.handle('nova:projects:list', async () => {
        try {
            return { success: true, data: projectManager_1.projectManager.getAllProjects() };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
    // Create a new project
    electron_1.ipcMain.handle('nova:projects:create', async (event, options) => {
        try {
            // Validate required fields
            if (!options.name || !options.type || !options.templateKey || !options.baseDir) {
                return { success: false, error: 'Missing required fields' };
            }
            // Sanitize inputs
            const sanitizedOptions = {
                ...options,
                name: options.name.trim(),
                type: options.type.trim(),
                templateKey: options.templateKey.trim(),
                baseDir: options.baseDir.trim()
            };
            const result = await projectManager_1.projectManager.createProject(sanitizedOptions);
            return result;
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
    // Start a project
    electron_1.ipcMain.handle('nova:projects:start', async (event, { id, envOverrides }) => {
        try {
            if (!id || typeof id !== 'string') {
                return { success: false, error: 'Invalid project ID' };
            }
            const result = await projectManager_1.projectManager.startProject(id, envOverrides);
            return result;
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
    // Stop a project
    electron_1.ipcMain.handle('nova:projects:stop', async (event, { id }) => {
        try {
            if (!id || typeof id !== 'string') {
                return { success: false, error: 'Invalid project ID' };
            }
            const result = await projectManager_1.projectManager.stopProject(id);
            return result;
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
    // Restart a project
    electron_1.ipcMain.handle('nova:projects:restart', async (event, { id }) => {
        try {
            if (!id || typeof id !== 'string') {
                return { success: false, error: 'Invalid project ID' };
            }
            const result = await projectManager_1.projectManager.restartProject(id);
            return result;
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
    // Delete a project
    electron_1.ipcMain.handle('nova:projects:delete', async (event, { id, deleteFiles }) => {
        try {
            if (!id || typeof id !== 'string') {
                return { success: false, error: 'Invalid project ID' };
            }
            const result = await projectManager_1.projectManager.deleteProject(id, deleteFiles);
            return result;
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
    // Get project status
    electron_1.ipcMain.handle('nova:projects:status', async (event, { id }) => {
        try {
            if (!id || typeof id !== 'string') {
                return { success: false, error: 'Invalid project ID' };
            }
            const status = projectManager_1.projectManager.getProjectStatus(id);
            return { success: true, data: status };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
    // Install dependencies
    electron_1.ipcMain.handle('nova:projects:install-deps', async (event, { id }) => {
        try {
            if (!id || typeof id !== 'string') {
                return { success: false, error: 'Invalid project ID' };
            }
            await projectManager_1.projectManager.installDependencies(id);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
    // Override the emit methods in projectManager to send IPC events
    const originalEmitLog = projectManager_1.projectManager.emitLog;
    const originalEmitStatusChange = projectManager_1.projectManager.emitStatusChange;
    projectManager_1.projectManager.emitLog = (projectId, line, stream) => {
        mainWindow.webContents.send('nova:projects:log', { id: projectId, line, stream });
        if (originalEmitLog)
            originalEmitLog.call(projectManager_1.projectManager, projectId, line, stream);
    };
    projectManager_1.projectManager.emitStatusChange = (projectId, status) => {
        mainWindow.webContents.send('nova:projects:status-changed', { id: projectId, status });
        if (originalEmitStatusChange)
            originalEmitStatusChange.call(projectManager_1.projectManager, projectId, status);
    };
}
