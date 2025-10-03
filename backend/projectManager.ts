import { ChildProcess } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import getPort from 'get-port';
import { dbManager, Project } from './db';
import { templateManager } from './templateManager';
import { runCommand, getBundledBinPaths, CommandRunner } from './utils/runCommand';

export interface CreateProjectOptions {
  name: string;
  type: string;
  templateKey: string;
  baseDir: string;
  port?: number;
  initGit?: boolean;
  installDeps?: boolean;
  nodeVersion?: string;
  envVars?: Record<string, string>;
}

export interface ProjectStatus {
  id: string;
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  port?: number;
  uptime?: number;
}

export class ProjectManager {
  private runningProcesses = new Map<string, ChildProcess>();
  private processStartTimes = new Map<string, number>();
  private logStreams = new Map<string, CommandRunner>();

  constructor() {
    // Clean up on exit
    process.on('exit', () => {
      this.stopAllProjects();
    });
  }

  async createProject(options: CreateProjectOptions): Promise<{ success: boolean; project?: Project; error?: string }> {
    try {
      // Validate and sanitize project name
      const sanitizedName = this.sanitizeProjectName(options.name);
      if (!sanitizedName) {
        return { success: false, error: 'Invalid project name' };
      }

      // Compute project path
      const projectPath = path.resolve(options.baseDir, sanitizedName);
      
      // Check if project already exists
      if (await fs.pathExists(projectPath)) {
        return { success: false, error: 'Project directory already exists' };
      }

      // Determine port
      let port = options.port;
      if (!port) {
        const templateDefaults = templateManager.getTemplateDefaults(options.templateKey);
        port = await getPort({ port: templateDefaults.port });
      } else {
        // Check if port is available
        const availablePort = await getPort({ port });
        if (availablePort !== port) {
          return { success: false, error: `Port ${port} is not available. Suggested port: ${availablePort}` };
        }
      }

      // Create project directory
      await fs.ensureDir(projectPath);

      // Copy or scaffold template
      const template = await templateManager.getTemplate(options.templateKey);
      if (!template) {
        return { success: false, error: `Template not found: ${options.templateKey}` };
      }

      const tokens = {
        '__PROJECT_NAME__': sanitizedName,
        '__PORT__': port.toString(),
        '__DESCRIPTION__': `A ${options.type} project created with Nova`
      };

      if (template.source === 'builtin') {
        await templateManager.copyTemplate(options.templateKey, projectPath, tokens);
      } else {
        // Handle NPX scaffolding for external templates
        await templateManager.scaffoldWithNPX(
          options.templateKey,
          projectPath,
          sanitizedName
        );
      }

      // Create .env file if it doesn't exist
      const envPath = path.join(projectPath, '.env');
      if (!(await fs.pathExists(envPath))) {
        const envContent = [`PORT=${port}`];
        if (options.envVars) {
          Object.entries(options.envVars).forEach(([key, value]) => {
            envContent.push(`${key}=${value}`);
          });
        }
        await fs.writeFile(envPath, envContent.join('\n') + '\n');
      }

      // Initialize git if requested
      if (options.initGit) {
        try {
          await runCommand('git', ['init'], { cwd: projectPath });
          
          // Create .gitignore if it doesn't exist
          const gitignorePath = path.join(projectPath, '.gitignore');
          if (!(await fs.pathExists(gitignorePath))) {
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
            await fs.writeFile(gitignorePath, gitignoreContent + '\n');
          }
        } catch (error) {
          console.warn('Failed to initialize git:', error);
        }
      }

      // Determine start script
      const templateDefaults = templateManager.getTemplateDefaults(options.templateKey);
      const startScript = templateDefaults.scripts.dev || 'npm run dev';

      // Create project record in database
      const project: Project = {
        id: uuidv4(),
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

      dbManager.createProject(project);

      // Install dependencies if requested
      if (options.installDeps) {
        try {
          await this.installDependencies(project.id);
        } catch (error) {
          console.warn('Failed to install dependencies:', error);
          // Don't fail project creation if dependency installation fails
        }
      }

      return { success: true, project };

    } catch (error) {
      console.error('Failed to create project:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async startProject(projectId: string, envOverrides?: Record<string, string>): Promise<{ success: boolean; pid?: number; error?: string }> {
    try {
      const project = dbManager.getProject(projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      // Check if already running
      if (this.runningProcesses.has(projectId)) {
        return { success: false, error: 'Project is already running' };
      }

      // Check if port is available
      const availablePort = await getPort({ port: project.port });
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
      const { nodePath, npmPath } = getBundledBinPaths();

      let executablePath: string;
      let execArgs: string[];

      if (command === 'npm' || command === 'npx') {
        executablePath = command === 'npm' ? npmPath : getBundledBinPaths().npxPath;
        execArgs = args;
      } else if (command === 'node') {
        executablePath = nodePath;
        execArgs = args;
      } else {
        // For other commands, try to use npm run
        executablePath = npmPath;
        execArgs = ['run', command, ...args];
      }

      // Create log file path
      const logDir = path.join(project.path, '.nova', 'logs');
      await fs.ensureDir(logDir);
      const logFile = path.join(logDir, `${projectId}.log`);

      // Start the process
      const runner = new CommandRunner({
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
      dbManager.updateProject(projectId, { status: 'running' });

      // Emit status change
      this.emitStatusChange(projectId, 'running');

      return { success: true, pid: process.pid }; // Note: This is the parent process PID

    } catch (error) {
      console.error('Failed to start project:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async stopProject(projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const project = dbManager.getProject(projectId);
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
      dbManager.updateProject(projectId, { status: 'stopped' });
      this.emitStatusChange(projectId, 'stopped');

      return { success: true };

    } catch (error) {
      console.error('Failed to stop project:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async restartProject(projectId: string): Promise<{ success: boolean; error?: string }> {
    const stopResult = await this.stopProject(projectId);
    if (!stopResult.success) {
      return stopResult;
    }

    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));

    return await this.startProject(projectId);
  }

  getProjectStatus(projectId: string): ProjectStatus {
    const project = dbManager.getProject(projectId);
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

  async installDependencies(projectId: string): Promise<void> {
    const project = dbManager.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const { npmPath } = getBundledBinPaths();
    
    await runCommand(npmPath, ['install'], {
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

  private sanitizeProjectName(name: string): string {
    // Remove invalid characters and ensure it's a valid directory name
    return name
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .substring(0, 50);
  }

  private parseStartScript(script: string): { command: string; args: string[] } {
    const parts = script.trim().split(/\s+/);
    return {
      command: parts[0],
      args: parts.slice(1)
    };
  }

  private handleProcessExit(projectId: string, code: number | null, signal: string | null): void {
    const status = code === 0 ? 'stopped' : 'error';
    
    // Clean up
    this.logStreams.delete(projectId);
    this.processStartTimes.delete(projectId);

    // Update database
    dbManager.updateProject(projectId, { status });

    // Emit status change
    this.emitStatusChange(projectId, status);
  }

  private emitLog(projectId: string, line: string, stream: 'stdout' | 'stderr'): void {
    // This will be implemented in the main process to emit IPC events
    console.log(`[${projectId}] [${stream.toUpperCase()}] ${line}`);
  }

  private emitStatusChange(projectId: string, status: string): void {
    // This will be implemented in the main process to emit IPC events
    console.log(`[${projectId}] Status changed to: ${status}`);
  }

  private stopAllProjects(): void {
    for (const [projectId] of this.logStreams) {
      this.stopProject(projectId);
    }
  }

  // Get all projects
  getAllProjects(): Project[] {
    return dbManager.getAllProjects();
  }

  // Delete project
  async deleteProject(projectId: string, deleteFiles: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      const project = dbManager.getProject(projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      // Stop if running
      if (this.logStreams.has(projectId)) {
        await this.stopProject(projectId);
      }

      // Delete files if requested
      if (deleteFiles && await fs.pathExists(project.path)) {
        await fs.remove(project.path);
      }

      // Remove from database
      dbManager.deleteProject(projectId);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const projectManager = new ProjectManager();