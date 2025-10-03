import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { projectManager } from '../../backend/projectManager';
import { CreateProjectOptions } from '../../backend/projectManager';

export function setupProjectHandlers(mainWindow: Electron.BrowserWindow) {
  // List all projects
  ipcMain.handle('nova:projects:list', async () => {
    try {
      return { success: true, data: projectManager.getAllProjects() };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Create a new project
  ipcMain.handle('nova:projects:create', async (event: IpcMainInvokeEvent, options: CreateProjectOptions) => {
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

      const result = await projectManager.createProject(sanitizedOptions);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Start a project
  ipcMain.handle('nova:projects:start', async (event: IpcMainInvokeEvent, { id, envOverrides }: { id: string; envOverrides?: Record<string, string> }) => {
    try {
      if (!id || typeof id !== 'string') {
        return { success: false, error: 'Invalid project ID' };
      }

      const result = await projectManager.startProject(id, envOverrides);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Stop a project
  ipcMain.handle('nova:projects:stop', async (event: IpcMainInvokeEvent, { id }: { id: string }) => {
    try {
      if (!id || typeof id !== 'string') {
        return { success: false, error: 'Invalid project ID' };
      }

      const result = await projectManager.stopProject(id);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Restart a project
  ipcMain.handle('nova:projects:restart', async (event: IpcMainInvokeEvent, { id }: { id: string }) => {
    try {
      if (!id || typeof id !== 'string') {
        return { success: false, error: 'Invalid project ID' };
      }

      const result = await projectManager.restartProject(id);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Delete a project
  ipcMain.handle('nova:projects:delete', async (event: IpcMainInvokeEvent, { id, deleteFiles }: { id: string; deleteFiles?: boolean }) => {
    try {
      if (!id || typeof id !== 'string') {
        return { success: false, error: 'Invalid project ID' };
      }

      const result = await projectManager.deleteProject(id, deleteFiles);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Get project status
  ipcMain.handle('nova:projects:status', async (event: IpcMainInvokeEvent, { id }: { id: string }) => {
    try {
      if (!id || typeof id !== 'string') {
        return { success: false, error: 'Invalid project ID' };
      }

      const status = projectManager.getProjectStatus(id);
      return { success: true, data: status };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Install dependencies
  ipcMain.handle('nova:projects:install-deps', async (event: IpcMainInvokeEvent, { id }: { id: string }) => {
    try {
      if (!id || typeof id !== 'string') {
        return { success: false, error: 'Invalid project ID' };
      }

      await projectManager.installDependencies(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Override the emit methods in projectManager to send IPC events
  const originalEmitLog = (projectManager as any).emitLog;
  const originalEmitStatusChange = (projectManager as any).emitStatusChange;

  (projectManager as any).emitLog = (projectId: string, line: string, stream: 'stdout' | 'stderr') => {
    mainWindow.webContents.send('nova:projects:log', { id: projectId, line, stream });
    if (originalEmitLog) originalEmitLog.call(projectManager, projectId, line, stream);
  };

  (projectManager as any).emitStatusChange = (projectId: string, status: string) => {
    mainWindow.webContents.send('nova:projects:status-changed', { id: projectId, status });
    if (originalEmitStatusChange) originalEmitStatusChange.call(projectManager, projectId, status);
  };
}