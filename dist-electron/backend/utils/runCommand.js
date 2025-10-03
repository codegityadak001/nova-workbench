"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRunner = void 0;
exports.runCommand = runCommand;
exports.getBundledBinPaths = getBundledBinPaths;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class CommandRunner {
    constructor(options = {}) {
        this.options = options;
        if (options.logFile) {
            this.logStream = (0, fs_1.createWriteStream)(options.logFile, { flags: 'a' });
        }
    }
    async run(commandPath, args = []) {
        return new Promise((resolve, reject) => {
            // Validate command path - only allow known safe executables
            const allowedCommands = ['node', 'npm', 'npx', 'yarn', 'pnpm'];
            const commandName = path_1.default.basename(commandPath, path_1.default.extname(commandPath));
            if (!allowedCommands.includes(commandName) && !commandPath.includes('node_modules')) {
                reject(new Error(`Command not allowed: ${commandName}`));
                return;
            }
            let stdout = '';
            let stderr = '';
            const child = (0, child_process_1.spawn)(commandPath, args, {
                cwd: this.options.cwd,
                env: { ...process.env, ...this.options.env },
                stdio: ['ignore', 'pipe', 'pipe'],
                windowsHide: true
            });
            // Set up timeout
            let timeoutId;
            if (this.options.timeoutMs) {
                timeoutId = setTimeout(() => {
                    child.kill('SIGTERM');
                    reject(new Error(`Command timed out after ${this.options.timeoutMs}ms`));
                }, this.options.timeoutMs);
            }
            // Handle stdout
            child.stdout?.on('data', (data) => {
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
            child.stderr?.on('data', (data) => {
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
    close() {
        this.logStream?.end();
    }
}
exports.CommandRunner = CommandRunner;
// Utility function for simple command execution
async function runCommand(commandPath, args = [], options = {}) {
    const runner = new CommandRunner(options);
    try {
        return await runner.run(commandPath, args);
    }
    finally {
        runner.close();
    }
}
// Utility to get safe paths for bundled Node.js tools
function getBundledBinPaths() {
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
    const resourcesPath = process.resourcesPath || path_1.default.join(__dirname, '..', '..', 'resources');
    const binPath = path_1.default.join(resourcesPath, 'node', 'bin');
    return {
        nodePath: path_1.default.join(binPath, `node${ext}`),
        npmPath: path_1.default.join(binPath, `npm${ext}`),
        npxPath: path_1.default.join(binPath, `npx${ext}`)
    };
}
