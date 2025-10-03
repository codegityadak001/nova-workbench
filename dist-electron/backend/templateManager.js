"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateManager = exports.TemplateManager = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const runCommand_1 = require("./utils/runCommand");
class TemplateManager {
    constructor() {
        // In development, templates are in the project root
        // In production, they're in the resources directory
        if (process.env.NODE_ENV === 'development' || process.env.IS_DEV) {
            this.templatesPath = path_1.default.join(__dirname, '..', 'templates');
        }
        else {
            this.templatesPath = path_1.default.join(process.resourcesPath || '', 'templates');
        }
    }
    async listTemplates() {
        return db_1.dbManager.getAllTemplates();
    }
    async getTemplate(key) {
        return db_1.dbManager.getTemplate(key);
    }
    async copyTemplate(templateKey, destPath, tokens = {}) {
        const template = await this.getTemplate(templateKey);
        if (!template) {
            throw new Error(`Template not found: ${templateKey}`);
        }
        if (template.source !== 'builtin') {
            throw new Error(`Only builtin templates are supported for copying: ${templateKey}`);
        }
        const templatePath = path_1.default.join(this.templatesPath, templateKey);
        // Check if template directory exists
        if (!(await fs_extra_1.default.pathExists(templatePath))) {
            throw new Error(`Template directory not found: ${templatePath}`);
        }
        // Ensure destination doesn't exist
        if (await fs_extra_1.default.pathExists(destPath)) {
            throw new Error(`Destination already exists: ${destPath}`);
        }
        // Copy template files
        await fs_extra_1.default.copy(templatePath, destPath, {
            filter: (src) => {
                // Skip node_modules and other unwanted directories
                const relativePath = path_1.default.relative(templatePath, src);
                return !relativePath.includes('node_modules') &&
                    !relativePath.includes('.git') &&
                    !relativePath.startsWith('.');
            }
        });
        // Replace tokens in files
        await this.replaceTokensInFiles(destPath, tokens);
    }
    async replaceTokensInFiles(dirPath, tokens) {
        const filesToProcess = [
            'package.json',
            'README.md',
            '.env.example',
            'server.js',
            'app.js',
            'index.js',
            'next.config.js',
            'nuxt.config.ts'
        ];
        for (const fileName of filesToProcess) {
            const filePath = path_1.default.join(dirPath, fileName);
            if (await fs_extra_1.default.pathExists(filePath)) {
                let content = await fs_extra_1.default.readFile(filePath, 'utf8');
                // Replace tokens
                Object.entries(tokens).forEach(([token, value]) => {
                    const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                    content = content.replace(regex, value);
                });
                await fs_extra_1.default.writeFile(filePath, content, 'utf8');
            }
        }
    }
    async scaffoldWithNPX(templateCLI, destPath, projectName, args = []) {
        const { npxPath } = (0, runCommand_1.getBundledBinPaths)();
        const parentDir = path_1.default.dirname(destPath);
        // Ensure parent directory exists
        await fs_extra_1.default.ensureDir(parentDir);
        // Build command arguments
        const cmdArgs = [templateCLI, projectName, ...args];
        try {
            await (0, runCommand_1.runCommand)(npxPath, cmdArgs, {
                cwd: parentDir,
                timeoutMs: 300000, // 5 minutes timeout
                onStdout: (line) => {
                    console.log(`[NPX STDOUT] ${line}`);
                },
                onStderr: (line) => {
                    console.log(`[NPX STDERR] ${line}`);
                }
            });
        }
        catch (error) {
            // If npx fails, we should clean up any partial creation
            if (await fs_extra_1.default.pathExists(destPath)) {
                await fs_extra_1.default.remove(destPath);
            }
            throw new Error(`Failed to scaffold project with npx: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getTemplateInfo(templateKey) {
        const template = await this.getTemplate(templateKey);
        if (!template) {
            throw new Error(`Template not found: ${templateKey}`);
        }
        try {
            return JSON.parse(template.meta_json);
        }
        catch {
            return {};
        }
    }
    async validateTemplatePath(templatePath) {
        try {
            const packageJsonPath = path_1.default.join(templatePath, 'package.json');
            return await fs_extra_1.default.pathExists(packageJsonPath);
        }
        catch {
            return false;
        }
    }
    // Get default configuration for a template type
    getTemplateDefaults(templateType) {
        const defaults = {
            express: {
                port: 3000,
                scripts: {
                    dev: 'node server.js',
                    start: 'node server.js'
                }
            },
            'express-basic': {
                port: 3000,
                scripts: {
                    dev: 'node server.js',
                    start: 'node server.js'
                }
            },
            next: {
                port: 3000,
                scripts: {
                    dev: 'next dev',
                    build: 'next build',
                    start: 'next start'
                }
            },
            'next-basic': {
                port: 3000,
                scripts: {
                    dev: 'next dev',
                    build: 'next build',
                    start: 'next start'
                }
            },
            nuxt: {
                port: 3000,
                scripts: {
                    dev: 'nuxt dev',
                    build: 'nuxt build',
                    start: 'nuxt preview'
                }
            },
            'nuxt-basic': {
                port: 3000,
                scripts: {
                    dev: 'nuxt dev',
                    build: 'nuxt build',
                    start: 'nuxt preview'
                }
            }
        };
        return defaults[templateType] || {
            port: 3000,
            scripts: {
                dev: 'npm run dev',
                start: 'npm start'
            }
        };
    }
}
exports.TemplateManager = TemplateManager;
exports.templateManager = new TemplateManager();
