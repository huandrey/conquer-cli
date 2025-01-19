// src/storage/json-storage.js
import fs from 'fs/promises';
import path from 'path';
import { Storage } from './storage.js';

export class JSONStorage extends Storage {
  constructor(baseDir = '.conquer-cli') {
    super();
    this.baseDir = path.join(process.env.HOME || process.env.USERPROFILE, baseDir);
    this.workspacesFile = path.join(this.baseDir, 'workspaces.json');
    this.backupDir = path.join(this.baseDir, 'backups');
  }

  async init() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      await fs.mkdir(this.backupDir, { recursive: true });
      
      try {
        await fs.access(this.workspacesFile);
      } catch {
        await fs.writeFile(this.workspacesFile, JSON.stringify({ workspaces: [] }));
      }
    } catch (error) {
      throw new Error(`Failed to initialize storage: ${error.message}`);
    }
  }

  async getWorkspaces() {
    try {
      const data = await fs.readFile(this.workspacesFile, 'utf8');
      return JSON.parse(data).workspaces;
    } catch (error) {
      throw new Error(`Failed to read workspaces: ${error.message}`);
    }
  }

  async getWorkspace(id) {
    const workspaces = await this.getWorkspaces();
    return workspaces.find(w => w.id === id);
  }

  async saveWorkspace(workspace) {
    try {
      let workspaces = await this.getWorkspaces();
      const index = workspaces.findIndex(w => w.id === workspace.id);

      if (index !== -1) {
        workspaces[index] = workspace;
      } else {
        workspaces.push(workspace);
      }

      await fs.writeFile(
        this.workspacesFile,
        JSON.stringify({ workspaces }, null, 2)
      );

      await this.createBackup();
    } catch (error) {
      throw new Error(`Failed to save workspace: ${error.message}`);
    }
  }

  async deleteWorkspace(id) {
    try {
      let workspaces = await this.getWorkspaces();
      workspaces = workspaces.filter(w => w.id !== id);
      
      await fs.writeFile(
        this.workspacesFile,
        JSON.stringify({ workspaces }, null, 2)
      );

      await this.createBackup();
    } catch (error) {
      throw new Error(`Failed to delete workspace: ${error.message}`);
    }
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `backup-${timestamp}.json`);
      
      const data = await fs.readFile(this.workspacesFile);
      await fs.writeFile(backupFile, data);

      // Manter apenas os últimos 5 backups
      const backups = await fs.readdir(this.backupDir);
      if (backups.length > 5) {
        const oldestBackup = backups.sort()[0];
        await fs.unlink(path.join(this.backupDir, oldestBackup));
      }
    } catch (error) {
      console.error(`Backup failed: ${error.message}`);
    }
  }

  async export(format = 'json') {
    try {
      const data = await fs.readFile(this.workspacesFile, 'utf8');
      
      switch (format.toLowerCase()) {
        case 'json':
          return data;
        case 'csv':
          // Implementar conversão para CSV
          throw new Error('CSV export not implemented yet');
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  async import(data, format = 'json') {
    try {
      switch (format.toLowerCase()) {
        case 'json':
          const parsedData = JSON.parse(data);
          await fs.writeFile(this.workspacesFile, JSON.stringify(parsedData, null, 2));
          break;
        case 'csv':
          // Implementar importação de CSV
          throw new Error('CSV import not implemented yet');
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      await this.createBackup();
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }
}
