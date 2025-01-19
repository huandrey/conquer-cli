import { Workspace } from '../models/Workspace.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACTIVE_WORKSPACE_FILE = path.join(__dirname, '..', '..', '.active-workspace');

export class WorkspaceService {
  constructor(storage) {
    this.storage = storage;
  }

  async createWorkspace(name) {
    const workspace = new Workspace(name);
    workspace.id = this._generateId();
    await this.storage.saveWorkspace(workspace);
    return workspace;
  }

  async getWorkspaces() {
    return this.storage.getWorkspaces();
  }

  async getWorkspace(id) {
    return this.storage.getWorkspace(id);
  }

  async deleteWorkspace(id) {
    // Verifica se é o workspace ativo
    const activeWorkspace = await this.getActiveWorkspace();
    if (activeWorkspace && activeWorkspace.id === id) {
      await this._clearActiveWorkspace();
    }

    await this.storage.deleteWorkspace(id);
  }

  async setActiveWorkspace(id) {
    const workspace = await this.getWorkspace(id);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    try {
      await fs.writeFile(ACTIVE_WORKSPACE_FILE, id);
    } catch (error) {
      throw new Error(`Failed to set active workspace: ${error.message}`);
    }
  }

  async getActiveWorkspace() {
    try {
      const id = await fs.readFile(ACTIVE_WORKSPACE_FILE, 'utf8');
      return this.getWorkspace(id);
    } catch (error) {
      // Se o arquivo não existe ou ocorreu outro erro, retorna null
      return null;
    }
  }

  async _clearActiveWorkspace() {
    try {
      await fs.unlink(ACTIVE_WORKSPACE_FILE);
    } catch (error) {
      // Ignora erro se o arquivo não existir
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  _generateId() {
    // Gera um ID único de 8 caracteres
    return Math.random().toString(36).substring(2, 10);
  }

  async exportWorkspace(id, format = 'json') {
    const workspace = await this.getWorkspace(id);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(workspace, null, 2);
      
      case 'csv':
        // Converte tarefas para CSV
        const tasks = workspace.tasks;
        const headers = ['id', 'name', 'status', 'priority', 'dueDate', 'assignees', 'tags'];
        
        const rows = tasks.map(task => [
          task.id,
          task.name,
          task.status,
          task.priority,
          task.dueDate,
          task.assignees.join(';'),
          task.tags.join(';')
        ]);

        return [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  async importWorkspace(data, format = 'json') {
    let workspace;

    switch (format.toLowerCase()) {
      case 'json':
        try {
          const parsed = JSON.parse(data);
          workspace = new Workspace(parsed.name);
          Object.assign(workspace, parsed);
          await this.storage.saveWorkspace(workspace);
        } catch (error) {
          throw new Error(`Failed to import workspace: ${error.message}`);
        }
        break;

      case 'csv':
        try {
          const lines = data.split('\n');
          const headers = lines[0].split(',');
          
          workspace = new Workspace('Imported Workspace');
          workspace.id = this._generateId();

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const task = {};
            
            headers.forEach((header, index) => {
              task[header] = values[index];
            });

            // Converte strings para arrays onde necessário
            task.assignees = task.assignees ? task.assignees.split(';') : [];
            task.tags = task.tags ? task.tags.split(';') : [];

            workspace.addTask(task);
          }

          await this.storage.saveWorkspace(workspace);
        } catch (error) {
          throw new Error(`Failed to import CSV: ${error.message}`);
        }
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    return workspace;
  }
}
