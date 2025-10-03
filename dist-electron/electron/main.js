"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainWindow = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const db_1 = require("../backend/db");
const projectHandlers_1 = require("./ipcHandlers/projectHandlers");
const templateHandlers_1 = require("./ipcHandlers/templateHandlers");
const systemHandlers_1 = require("./ipcHandlers/systemHandlers");
// Keep a global reference of the window object
let mainWindow = null;
exports.mainWindow = mainWindow;
const isDev = process.env.IS_DEV === 'true';
function createWindow() {
    // Create the browser window
    exports.mainWindow = mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, 'preload.js')
        },
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        show: false // Don't show until ready
    });
    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });
    // Handle window closed
    mainWindow.on('closed', () => {
        exports.mainWindow = mainWindow = null;
    });
    // Set up IPC handlers
    (0, projectHandlers_1.setupProjectHandlers)(mainWindow);
    (0, templateHandlers_1.setupTemplateHandlers)();
    (0, systemHandlers_1.setupSystemHandlers)(mainWindow);
}
// Create application menu
function createMenu() {
    const template = [
        {
            label: 'Nova',
            submenu: [
                {
                    label: 'About Nova',
                    role: 'about'
                },
                { type: 'separator' },
                {
                    label: 'Preferences...',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        // TODO: Open preferences window
                    }
                },
                { type: 'separator' },
                {
                    label: 'Hide Nova',
                    accelerator: 'CmdOrCtrl+H',
                    role: 'hide'
                },
                {
                    label: 'Hide Others',
                    accelerator: 'CmdOrCtrl+Shift+H',
                    role: 'hideOthers'
                },
                {
                    label: 'Show All',
                    role: 'unhide'
                },
                { type: 'separator' },
                {
                    label: 'Quit Nova',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        electron_1.app.quit();
                    }
                }
            ]
        },
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Project',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow?.webContents.send('nova:menu:new-project');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Open Project Folder',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        mainWindow?.webContents.send('nova:menu:open-project-folder');
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Nova Documentation',
                    click: () => {
                        // TODO: Open documentation
                    }
                },
                {
                    label: 'Report Issue',
                    click: () => {
                        // TODO: Open issue tracker
                    }
                }
            ]
        }
    ];
    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
        template[0].label = electron_1.app.getName();
        // Window menu
        template[4].submenu = [
            { role: 'close' },
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' }
        ];
    }
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
// App event handlers
electron_1.app.whenReady().then(async () => {
    // Initialize database
    await db_1.dbManager.initialize();
    // Create window and menu
    createWindow();
    createMenu();
    electron_1.app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// Quit when all windows are closed, except on macOS
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Security: Prevent new window creation
electron_1.app.on('web-contents-created', (event, contents) => {
    contents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
});
// Handle app termination
electron_1.app.on('before-quit', async () => {
    // Clean up database connection
    db_1.dbManager.close();
});
// Prevent navigation to external URLs
electron_1.app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'file://') {
            event.preventDefault();
        }
    });
});
