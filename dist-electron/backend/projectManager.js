"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectManager = exports.ProjectManager = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const get_port_1 = __importDefault(require("get-port"));
const db_1 = require("./db");
const templateManager_1 = require("./templateManager");
const runCommand_1 = require("./utils/runCommand");
class ProjectManager {
    constructor() {
        this.runningProcesses = new Map();
        this.processStartTimes = new Map();
        this.logStreams = new Map();
        // Clean up on exit
        process.on('exit', () => {
            this.stopAllProjects();
        });
    }
    async createProject(options) {
        try {
            // Validate and sanitize project name
            const sanitizedName = this.sanitizeProjectName(options.name);
            if (!sanitizedName) {
                return { success: false, error: 'Invalid project name' };
            }
            // Compute project path
            const projectPath = path_1.default.resolve(options.baseDir, sanitizedName);
            // Check if project already exists
            if (await fs_extra_1.default.pathExists(projectPath)) {
                return { success: false, error: 'Project directory already exists' };
            }
            // Determine port
            let port = options.port;
            if (!port) {
                const templateDefaults = templateManager_1.templateManager.getTemplateDefaults(options.templateKey);
                port = await (0, get_port_1.default)({ port: templateDefaults.port });
            }
            else {
                // Check if port is available
                const availablePort = await (0, get_port_1.default)({ port });
                if (availablePort !== port) {
                    return { success: false, error: `Port ${port} is not available. Suggested port: ${availablePort}` };
                }
            }
            // Create project directory
            await fs_extra_1.default.ensureDir(projectPath);
            // Copy or scaffold template
            const template = await templateManager_1.templateManager.getTemplate(options.templateKey);
            if (!template) {
                return { success: false, error: `Template not found: ${options.templateKey}` };
            }
            const tokens = {
                '__PROJECT_NAME__': sanitizedName,
                '__PORT__': port.toString(),
                '__DESCRIPTION__': `A ${options.type} project created with Nova`
            };
            if (template.source === 'builtin') {
                await templateManager_1.templateManager.copyTemplate(options.templateKey, projectPath, tokens);
            }
            else {
                // Handle NPX scaffolding for external templates
                await templateManager_1.templateManager.scaffoldWithNPX(options.templateKey, projectPath, sanitizedName);
            }
            // Create .env file if it doesn't exist
            const envPath = path_1.default.join(projectPath, '.env');
            if (!(await fs_extra_1.default.pathExists(envPath))) {
                const envContent = [`PORT=${port}`];
                if (options.envVars) {
                    Object.entries(options.envVars).forEach(([key, value]) => {
                        envContent.push(`${key}=${value}`);
                    });
                }
                await fs_extra_1.default.writeFile(envPath, envContent.join('\n') + '\n');
            }
            // Initialize git if requested
            if (options.initGit) {
                try {
                    await (0, runCommand_1.runCommand)('git', ['init'], { cwd: projectPath });
                    // Create .gitignore if it doesn't exist
                    const gitignorePath = path_1.default.join(projectPath, '.gitignore');
                    if (!(await fs_extra_1.default.pathExists(gitignorePath))) {
                        const gitignoreContent = [
                            'node_modules/',
                            '.env',
                            '.env.local',
                            '.env.development.local',
                            '.env.test.local',
                            '.env.production.local',
                            'npm-debug.log*',
                            'yarn-debug.log*',
                            'yarn-error.log*',
                            '.DS_Store',
                            'dist/',
                            'build/',
                            '.next/',
                            '.nuxt/',
                            'coverage/'
                        ].join('\n');
                        await fs_extra_1.default.writeFile(gitignorePath, gitignoreContent + '\n');
                    }
                }
                catch (error) {
                    console.warn('Failed to initialize git:', error);
                }
            }
            // Determine start script
            const templateDefaults = templateManager_1.templateManager.getTemplateDefaults(options.templateKey);
            const startScript = templateDefaults.scripts.dev || 'npm run dev';
            // Create project record in database
            const project = {
                id: (0, uuid_1.v4)(),
                name: sanitizedName,
                type: options.type,
                path: projectPath,
                port,
                status: 'stopped',
                start_script: startScript,
                env_json: JSON.stringify(options.envVars || {}),
                meta_json: JSON.stringify({
                    templateKey: options.templateKey,
                    nodeVersion: options.nodeVersion
                }),
                created_at: Date.now(),
                updated_at: Date.now()
            };
            db_1.dbManager.createProject(project);
            // Install dependencies if requested
            if (options.installDeps) {
                try {
                    await this.installDependencies(project.id);
                }
                catch (error) {
                    console.warn('Failed to install dependencies:', error);
                    // Don't fail project creation if dependency installation fails
                }
            }
            return { success: true, project };
        }
        catch (error) {
            console.error('Failed to create project:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async startProject(projectId, envOverrides) {
        try {
            const project = db_1.dbManager.getProject(projectId);
            if (!project) {
                return { success: false, error: 'Project not found' };
            }
            // Check if already running
            if (this.runningProcesses.has(projectId)) {
                return { success: false, error: 'Project is already running' };
            }
            // Check if port is available
            const availablePort = await (0, get_port_1.default)({ port: project.port });
            if (availablePort !== project.port) {
                return { success: false, error: `Port ${project.port} is not available` };
            }
            // Prepare environment variables
            const projectEnv = JSON.parse(project.env_json || '{}');
            const env = {
                ...process.env,
                PORT: project.port.toString(),
                ...projectEnv,
                ...envOverrides
            };
            // Determine command and arguments
            const { command, args } = this.parseStartScript(project.start_script);
            const { nodePath, npmPath } = (0, runCommand_1.getBundledBinPaths)();
            let executablePath;
            let execArgs;
            if (command === 'npm' || command === 'npx') {
                executablePath = command === 'npm' ? npmPath : (0, runCommand_1.getBundledBinPaths)().npxPath;
                execArgs = args;
            }
            else if (command === 'node') {
                executablePath = nodePath;
                execArgs = args;
            }
            else {
                // For other commands, try to use npm run
                executablePath = npmPath;
                execArgs = ['run', command, ...args];
            }
            // Create log file path
            const logDir = path_1.default.join(project.path, '.nova', 'logs');
            await fs_extra_1.default.ensureDir(logDir);
            const logFile = path_1.default.join(logDir, `${projectId}.log`);
            // Start the process
            const runner = new runCommand_1.CommandRunner({
                cwd: project.path,
                env,
                logFile,
                onStdout: (line) => {
                    // Emit to renderer via IPC (will be handled in main process)
                    this.emitLog(projectId, line, 'stdout');
                },
                onStderr: (line) => {
                    this.emitLog(projectId, line, 'stderr');
                },
                onExit: (code, signal) => {
                    this.handleProcessExit(projectId, code, signal);
                }
            });
            // Start the process (don't await - it's long-running)
            const processPromise = runner.run(executablePath, execArgs);
            // Store references
            this.logStreams.set(projectId, runner);
            this.processStartTimes.set(projectId, Date.now());
            // Update project status
            db_1.dbManager.updateProject(projectId, { status: 'running' });
            // Emit status change
            this.emitStatusChange(projectId, 'running');
            return { success: true, pid: process.pid }; // Note: This is the parent process PID
        }
        catch (error) {
            console.error('Failed to start project:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async stopProject(projectId) {
        try {
            const project = db_1.dbManager.getProject(projectId);
            if (!project) {
                return { success: false, error: 'Project not found' };
            }
            const runner = this.logStreams.get(projectId);
            if (!runner) {
                return { success: false, error: 'Project is not running' };
            }
            // Clean up
            this.logStreams.delete(projectId);
            this.processStartTimes.delete(projectId);
            // Update status
            db_1.dbManager.updateProject(projectId, { status: 'stopped' });
            this.emitStatusChange(projectId, 'stopped');
            return { success: true };
        }
        catch (error) {
            console.error('Failed to stop project:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async restartProject(projectId) {
        const stopResult = await this.stopProject(projectId);
        if (!stopResult.success) {
            return stopResult;
        }
        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await this.startProject(projectId);
    }
    getProjectStatus(projectId) {
        const project = db_1.dbManager.getProject(projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const isRunning = this.logStreams.has(projectId);
        const startTime = this.processStartTimes.get(projectId);
        return {
            id: projectId,
            status: isRunning ? 'running' : project.status,
            port: project.port,
            uptime: startTime ? Date.now() - startTime : undefined
        };
    }
    async installDependencies(projectId) {
        const project = db_1.dbManager.getProject(projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const { npmPath } = (0, runCommand_1.getBundledBinPaths)();
        await (0, runCommand_1.runCommand)(npmPath, ['install'], {
            cwd: project.path,
            timeoutMs: 300000, // 5 minutes
            onStdout: (line) => {
                this.emitLog(projectId, line, 'stdout');
            },
            onStderr: (line) => {
                this.emitLog(projectId, line, 'stderr');
            }
        });
    }
    sanitizeProjectName(name) {
        // Remove invalid characters and ensure it's a valid directory name
        return name
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase()
            .substring(0, 50);
    }
    parseStartScript(script) {
        const parts = script.trim().split(/\s+/);
        return {
            command: parts[0],
            args: parts.slice(1)
        };
    }
    handleProcessExit(projectId, code, signal) {
        const status = code === 0 ? 'stopped' : 'error';
        // Clean up
        this.logStreams.delete(projectId);
        this.processStartTimes.delete(projectId);
        // Update database
        db_1.dbManager.updateProject(projectId, { status });
        // Emit status change
        this.emitStatusChange(projectId, status);
    }
    emitLog(projectId, line, stream) {
        // This will be implemented in the main process to emit IPC events
        console.log(`[${projectId}] [${stream.toUpperCase()}] ${line}`);
    }
    emitStatusChange(projectId, status) {
        // This will be implemented in the main process to emit IPC events
        console.log(`[${projectId}] Status changed to: ${status}`);
    }
    stopAllProjects() {
        for (const [projectId] of this.logStreams) {
            this.stopProject(projectId);
        }
    }
    // Get all projects
    getAllProjects() {
        return db_1.dbManager.getAllProjects();
    }
    // Delete project
    async deleteProject(projectId, deleteFiles = false) {
        try {
            const project = db_1.dbManager.getProject(projectId);
            if (!project) {
                return { success: false, error: 'Project not found' };
            }
            // Stop if running
            if (this.logStreams.has(projectId)) {
                await this.stopProject(projectId);
            }
            // Delete files if requested
            if (deleteFiles && await fs_extra_1.default.pathExists(project.path)) {
                await fs_extra_1.default.remove(project.path);
            }
            // Remove from database
            db_1.dbManager.deleteProject(projectId);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}
exports.ProjectManager = ProjectManager;
exports.projectManager = new ProjectManager();
