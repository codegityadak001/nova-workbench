export interface NovaAPI {
  // Project operations
  projects: {
    list: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
    create: (options: CreateProjectOptions) => Promise<{ success: boolean; project?: any; error?: string }>;
    start: (id: string, envOverrides?: Record<string, string>) => Promise<{ success: boolean; pid?: number; error?: string }>;
    stop: (id: string) => Promise<{ success: boolean; error?: string }>;
    restart: (id: string) => Promise<{ success: boolean; error?: string }>;
    delete: (id: string, deleteFiles?: boolean) => Promise<{ success: boolean; error?: string }>;
    getStatus: (id: string) => Promise<{ success: boolean; data?: ProjectStatus; error?: string }>;
    installDeps: (id: string) => Promise<{ success: boolean; error?: string }>;
  };

  // Template operations
  templates: {
    list: () => Promise<{ success: boolean; data?: Template[]; error?: string }>;
    get: (key: string) => Promise<{ success: boolean; data?: Template; error?: string }>;
  };

  // System operations
  system: {
    selectDirectory: () => Promise<{ success: boolean; data?: string | null; error?: string }>;
    openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
    showItemInFolder: (path: string) => Promise<{ success: boolean; error?: string }>;
  };

  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}

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

export interface Project {
  id: string;
  name: string;
  type: string;
  path: string;
  port: number;
  created_at: number;
  updated_at: number;
  status: 'running' | 'stopped' | 'error';
  start_script: string;
  env_json: string;
  meta_json: string;
}

export interface Template {
  id: string;
  key: string;
  name: string;
  version: string;
  source: 'builtin' | 'npm' | 'url';
  path: string;
  meta_json: string;
}

export interface ProjectStatus {
  id: string;
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  port?: number;
  uptime?: number;
}

declare global {
  interface Window {
    nova: NovaAPI;
  }
}