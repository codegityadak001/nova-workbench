import fs from 'fs-extra';
import path from 'path';
import { dbManager, Template } from './db';
import { runCommand, getBundledBinPaths } from './utils/runCommand';

export interface TemplateTokens {
  [key: string]: string;
}

export class TemplateManager {
  private templatesPath: string;

  constructor() {
    // In development, templates are in the project root
    // In production, they're in the resources directory
    if (process.env.NODE_ENV === 'development' || process.env.IS_DEV) {
      this.templatesPath = path.join(__dirname, '..', 'templates');
    } else {
      this.templatesPath = path.join(process.resourcesPath || '', 'templates');
    }
  }

  async listTemplates(): Promise<Template[]> {
    return dbManager.getAllTemplates();
  }

  async getTemplate(key: string): Promise<Template | null> {
    return dbManager.getTemplate(key);
  }

  async copyTemplate(templateKey: string, destPath: string, tokens: TemplateTokens = {}): Promise<void> {
    const template = await this.getTemplate(templateKey);
    if (!template) {
      throw new Error(`Template not found: ${templateKey}`);
    }

    if (template.source !== 'builtin') {
      throw new Error(`Only builtin templates are supported for copying: ${templateKey}`);
    }

    const templatePath = path.join(this.templatesPath, templateKey);
    
    // Check if template directory exists
    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`Template directory not found: ${templatePath}`);
    }

    // Ensure destination doesn't exist
    if (await fs.pathExists(destPath)) {
      throw new Error(`Destination already exists: ${destPath}`);
    }

    // Copy template files
    await fs.copy(templatePath, destPath, {
      filter: (src) => {
        // Skip node_modules and other unwanted directories
        const relativePath = path.relative(templatePath, src);
        return !relativePath.includes('node_modules') && 
               !relativePath.includes('.git') &&
               !relativePath.startsWith('.');
      }
    });

    // Replace tokens in files
    await this.replaceTokensInFiles(destPath, tokens);
  }

  private async replaceTokensInFiles(dirPath: string, tokens: TemplateTokens): Promise<void> {
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
      const filePath = path.join(dirPath, fileName);
      
      if (await fs.pathExists(filePath)) {
        let content = await fs.readFile(filePath, 'utf8');
        
        // Replace tokens
        Object.entries(tokens).forEach(([token, value]) => {
          const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          content = content.replace(regex, value);
        });
        
        await fs.writeFile(filePath, content, 'utf8');
      }
    }
  }

  async scaffoldWithNPX(
    templateCLI: string, 
    destPath: string, 
    projectName: string,
    args: string[] = []
  ): Promise<void> {
    const { npxPath } = getBundledBinPaths();
    const parentDir = path.dirname(destPath);
    
    // Ensure parent directory exists
    await fs.ensureDir(parentDir);

    // Build command arguments
    const cmdArgs = [templateCLI, projectName, ...args];

    try {
      await runCommand(npxPath, cmdArgs, {
        cwd: parentDir,
        timeoutMs: 300000, // 5 minutes timeout
        onStdout: (line) => {
          console.log(`[NPX STDOUT] ${line}`);
        },
        onStderr: (line) => {
          console.log(`[NPX STDERR] ${line}`);
        }
      });
    } catch (error) {
      // If npx fails, we should clean up any partial creation
      if (await fs.pathExists(destPath)) {
        await fs.remove(destPath);
      }
      throw new Error(`Failed to scaffold project with npx: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTemplateInfo(templateKey: string): Promise<any> {
    const template = await this.getTemplate(templateKey);
    if (!template) {
      throw new Error(`Template not found: ${templateKey}`);
    }

    try {
      return JSON.parse(template.meta_json);
    } catch {
      return {};
    }
  }

  async validateTemplatePath(templatePath: string): Promise<boolean> {
    try {
      const packageJsonPath = path.join(templatePath, 'package.json');
      return await fs.pathExists(packageJsonPath);
    } catch {
      return false;
    }
  }

  // Get default configuration for a template type
  getTemplateDefaults(templateType: string): { port: number; scripts: Record<string, string> } {
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

    return defaults[templateType as keyof typeof defaults] || {
      port: 3000,
      scripts: {
        dev: 'npm run dev',
        start: 'npm start'
      }
    };
  }
}

export const templateManager = new TemplateManager();