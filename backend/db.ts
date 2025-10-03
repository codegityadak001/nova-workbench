import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs-extra';

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

class DatabaseManager {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'nova.db');
  }

  async initialize(): Promise<void> {
    // Ensure the directory exists
    await fs.ensureDir(path.dirname(this.dbPath));
    
    this.db = new Database(this.dbPath);
    this.createTables();
    this.seedTemplates();
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Create projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        path TEXT NOT NULL,
        port INTEGER,
        created_at INTEGER,
        updated_at INTEGER,
        status TEXT,
        start_script TEXT,
        env_json TEXT,
        meta_json TEXT
      )
    `);

    // Create templates table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE,
        name TEXT,
        version TEXT,
        source TEXT,
        path TEXT,
        meta_json TEXT
      )
    `);
  }

  private seedTemplates(): void {
    if (!this.db) throw new Error('Database not initialized');

    const templates = [
      {
        id: 'express-basic',
        key: 'express-basic',
        name: 'Express Basic',
        version: '1.0.0',
        source: 'builtin',
        path: 'templates/express-basic',
        meta_json: JSON.stringify({
          description: 'Basic Express.js server with minimal setup',
          defaultPort: 3000,
          scripts: { dev: 'node server.js', start: 'node server.js' }
        })
      },
      {
        id: 'next-basic',
        key: 'next-basic',
        name: 'Next.js Basic',
        version: '1.0.0',
        source: 'builtin',
        path: 'templates/next-basic',
        meta_json: JSON.stringify({
          description: 'Basic Next.js application with TypeScript',
          defaultPort: 3000,
          scripts: { dev: 'next dev', build: 'next build', start: 'next start' }
        })
      },
      {
        id: 'nuxt-basic',
        key: 'nuxt-basic',
        name: 'Nuxt.js Basic',
        version: '1.0.0',
        source: 'builtin',
        path: 'templates/nuxt-basic',
        meta_json: JSON.stringify({
          description: 'Basic Nuxt.js application with TypeScript',
          defaultPort: 3000,
          scripts: { dev: 'nuxt dev', build: 'nuxt build', start: 'nuxt preview' }
        })
      }
    ];

    const insertTemplate = this.db.prepare(`
      INSERT OR IGNORE INTO templates (id, key, name, version, source, path, meta_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const template of templates) {
      insertTemplate.run(
        template.id,
        template.key,
        template.name,
        template.version,
        template.source,
        template.path,
        template.meta_json
      );
    }
  }

  // Project methods
  createProject(project: Omit<Project, 'created_at' | 'updated_at'>): Project {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    const fullProject: Project = {
      ...project,
      created_at: now,
      updated_at: now
    };

    const stmt = this.db.prepare(`
      INSERT INTO projects (id, name, type, path, port, created_at, updated_at, status, start_script, env_json, meta_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      fullProject.id,
      fullProject.name,
      fullProject.type,
      fullProject.path,
      fullProject.port,
      fullProject.created_at,
      fullProject.updated_at,
      fullProject.status,
      fullProject.start_script,
      fullProject.env_json,
      fullProject.meta_json
    );

    return fullProject;
  }

  getProject(id: string): Project | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
    return stmt.get(id) as Project | null;
  }

  getAllProjects(): Project[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC');
    return stmt.all() as Project[];
  }

  updateProject(id: string, updates: Partial<Project>): void {
    if (!this.db) throw new Error('Database not initialized');

    const fields = Object.keys(updates).filter(key => key !== 'id');
    if (fields.length === 0) return;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field as keyof Project]);
    values.push(Date.now()); // updated_at
    values.push(id); // WHERE id = ?

    const stmt = this.db.prepare(`
      UPDATE projects SET ${setClause}, updated_at = ? WHERE id = ?
    `);

    stmt.run(...values);
  }

  deleteProject(id: string): void {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(id);
  }

  // Template methods
  getAllTemplates(): Template[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM templates ORDER BY name');
    return stmt.all() as Template[];
  }

  getTemplate(key: string): Template | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM templates WHERE key = ?');
    return stmt.get(key) as Template | null;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const dbManager = new DatabaseManager();