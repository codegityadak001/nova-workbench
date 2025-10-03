import { spawn, ChildProcess } from 'child_process';
import { createWriteStream, WriteStream } from 'fs';
import path from 'path';

export interface RunCommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
  onStdout?: (line: string) => void;
  onStderr?: (line: string) => void;
  onExit?: (code: number | null, signal: string | null) => void;
  logFile?: string;
}

export interface RunCommandResult {
  code: number | null;
  signal: string | null;
  stdout: string;
  stderr: string;
}

export class CommandRunner {
  private logStream?: WriteStream;

  constructor(private options: RunCommandOptions = {}) {
    if (options.logFile) {
      this.logStream = createWriteStream(options.logFile, { flags: 'a' });
    }
  }

  async run(commandPath: string, args: string[] = []): Promise<RunCommandResult> {
    return new Promise((resolve, reject) => {
      // Validate command path - only allow known safe executables
      const allowedCommands = ['node', 'npm', 'npx', 'yarn', 'pnpm'];
      const commandName = path.basename(commandPath, path.extname(commandPath));
      
      if (!allowedCommands.includes(commandName) && !commandPath.includes('node_modules')) {
        reject(new Error(`Command not allowed: ${commandName}`));
        return;
      }

      let stdout = '';
      let stderr = '';

      const child = spawn(commandPath, args, {
        cwd: this.options.cwd,
        env: { ...process.env, ...this.options.env },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });

      // Set up timeout
      let timeoutId: NodeJS.Timeout | undefined;
      if (this.options.timeoutMs) {
        timeoutId = setTimeout(() => {
          child.kill('SIGTERM');
          reject(new Error(`Command timed out after ${this.options.timeoutMs}ms`));
        }, this.options.timeoutMs);
      }

      // Handle stdout
      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        stdout += text;
        
        // Split into lines and emit each line
        const lines = text.split(/\r?\n/);
        lines.forEach(line => {
          if (line.trim()) {
            this.options.onStdout?.(line);
            this.logStream?.write(`[STDOUT] ${new Date().toISOString()} ${line}\n`);
          }
        });
      });

      // Handle stderr
      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        stderr += text;
        
        // Split into lines and emit each line
        const lines = text.split(/\r?\n/);
        lines.forEach(line => {
          if (line.trim()) {
            this.options.onStderr?.(line);
            this.logStream?.write(`[STDERR] ${new Date().toISOString()} ${line}\n`);
          }
        });
      });

      // Handle process exit
      child.on('close', (code, signal) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        this.options.onExit?.(code, signal);
        this.logStream?.write(`[EXIT] ${new Date().toISOString()} Process exited with code ${code}, signal ${signal}\n`);

        resolve({
          code,
          signal,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });

      // Handle errors
      child.on('error', (error) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        this.logStream?.write(`[ERROR] ${new Date().toISOString()} ${error.message}\n`);
        reject(error);
      });
    });
  }

  close(): void {
    this.logStream?.end();
  }
}

// Utility function for simple command execution
export async function runCommand(
  commandPath: string,
  args: string[] = [],
  options: RunCommandOptions = {}
): Promise<RunCommandResult> {
  const runner = new CommandRunner(options);
  try {
    return await runner.run(commandPath, args);
  } finally {
    runner.close();
  }
}

// Utility to get safe paths for bundled Node.js tools
export function getBundledBinPaths(): { nodePath: string; npmPath: string; npxPath: string } {
  const isWin = process.platform === 'win32';
  const ext = isWin ? '.exe' : '';
  
  // In development, use system Node.js
  if (process.env.NODE_ENV === 'development' || process.env.IS_DEV) {
    return {
      nodePath: 'node',
      npmPath: 'npm',
      npxPath: 'npx'
    };
  }

  // In production, use bundled Node.js from resources
  const resourcesPath = process.resourcesPath || path.join(__dirname, '..', '..', 'resources');
  const binPath = path.join(resourcesPath, 'node', 'bin');

  return {
    nodePath: path.join(binPath, `node${ext}`),
    npmPath: path.join(binPath, `npm${ext}`),
    npxPath: path.join(binPath, `npx${ext}`)
  };
}