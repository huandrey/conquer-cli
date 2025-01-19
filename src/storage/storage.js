import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class Storage {
  constructor(baseDir = '.conquer-cli') {
    this.baseDir = path.join(process.env.HOME || process.env.USERPROFILE, baseDir);
    this.dataFile = path.join(this.baseDir, 'data.json');
    this.backupDir = path.join(this.baseDir, 'backups');
  }

  async init() {
    try {
      // Cria diretório base se não existir
      await fs.mkdir(this.baseDir, { recursive: true });
      
      // Cria diretório de backups se não existir
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Verifica se arquivo de dados existe, se não, cria com estrutura inicial
      try {
        await fs.access(this.dataFile);
      } catch {
        await fs.writeFile(this.dataFile, JSON.stringify({
          workspaces: [],
          version: '1.0.0',
          lastUpdated: new Date().toISOString()
        }, null, 2));
      }
    } catch (error) {
      throw new Error(`Falha ao inicializar storage: ${error.message}`);
    }
  }

  async getWorkspaces() {
    try {
      const data = await this._readData();
      return data.workspaces;
    } catch (error) {
      throw new Error(`Falha ao ler workspaces: ${error.message}`);
    }
  }

  async getWorkspace(id) {
    try {
      const data = await this._readData();
      return data.workspaces.find(w => w.id === id) || null;
    } catch (error) {
      throw new Error(`Falha ao ler workspace: ${error.message}`);
    }
  }

  async saveWorkspace(workspace) {
    try {
      const data = await this._readData();
      const index = data.workspaces.findIndex(w => w.id === workspace.id);

      if (index !== -1) {
        data.workspaces[index] = workspace;
      } else {
        data.workspaces.push(workspace);
      }

      data.lastUpdated = new Date().toISOString();
      await this._writeData(data);
      await this.backup();

      return workspace;
    } catch (error) {
      throw new Error(`Falha ao salvar workspace: ${error.message}`);
    }
  }

  async deleteWorkspace(id) {
    try {
      const data = await this._readData();
      const index = data.workspaces.findIndex(w => w.id === id);

      if (index !== -1) {
        data.workspaces.splice(index, 1);
        data.lastUpdated = new Date().toISOString();
        await this._writeData(data);
        await this.backup();
        return true;
      }

      return false;
    } catch (error) {
      throw new Error(`Falha ao deletar workspace: ${error.message}`);
    }
  }

  async backup() {
    try {
      const data = await this._readData();
      const timestamp = new Date().toISOString().replace(/[:.-]/g, '');
      const backupFile = path.join(this.backupDir, `backup-${timestamp}.json`);

      await fs.writeFile(backupFile, JSON.stringify(data, null, 2));

      // Mantém apenas os últimos 5 backups
      const backups = await fs.readdir(this.backupDir);
      const backupFiles = backups
        .filter(f => f.startsWith('backup-'))
        .sort()
        .reverse();

      if (backupFiles.length > 5) {
        const toDelete = backupFiles.slice(5);
        await Promise.all(
          toDelete.map(file => 
            fs.unlink(path.join(this.backupDir, file))
          )
        );
      }

      return backupFile;
    } catch (error) {
      throw new Error(`Falha ao criar backup: ${error.message}`);
    }
  }

  async export(format = 'json') {
    try {
      const data = await this._readData();

      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(data, null, 2);

        case 'csv':
          // Converte workspaces e tarefas para formato CSV
          let csv = 'workspace_id,workspace_name,task_id,task_name,status,priority,due_date,assignees,tags\n';
          
          for (const workspace of data.workspaces) {
            for (const task of workspace.tasks) {
              csv += [
                workspace.id,
                workspace.name,
                task.id,
                task.name,
                task.status,
                task.priority,
                task.dueDate,
                task.assignees.join(';'),
                task.tags.join(';')
              ].map(value => `"${value}"`).join(',') + '\n';
            }
          }
          return csv;

        default:
          throw new Error(`Formato não suportado: ${format}`);
      }
    } catch (error) {
      throw new Error(`Falha ao exportar dados: ${error.message}`);
    }
  }

  async import(data, format = 'json') {
    try {
      let importedData;

      switch (format.toLowerCase()) {
        case 'json':
          importedData = typeof data === 'string' ? JSON.parse(data) : data;
          
          // Valida estrutura dos dados
          if (!importedData.workspaces || !Array.isArray(importedData.workspaces)) {
            throw new Error('Estrutura de dados inválida');
          }

          // Faz backup antes de importar
          await this.backup();
          
          // Atualiza dados
          importedData.lastUpdated = new Date().toISOString();
          await this._writeData(importedData);
          break;

        case 'csv':
          const lines = data.split('\n');
          const headers = lines[0].split(',');
          const workspaces = new Map();

          // Processa cada linha do CSV
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, ''));
            const row = headers.reduce((obj, header, index) => {
              obj[header] = values[index];
              return obj;
            }, {});

            // Agrupa por workspace
            if (!workspaces.has(row.workspace_id)) {
              workspaces.set(row.workspace_id, {
                id: row.workspace_id,
                name: row.workspace_name,
                tasks: []
              });
            }

            // Adiciona tarefa ao workspace
            const workspace = workspaces.get(row.workspace_id);
            workspace.tasks.push({
              id: row.task_id,
              name: row.task_name,
              status: row.status,
              priority: parseInt(row.priority),
              dueDate: row.due_date,
              assignees: row.assignees.split(';'),
              tags: row.tags.split(';')
            });
          }

          // Faz backup antes de importar
          await this.backup();

          // Salva dados importados
          await this._writeData({
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            workspaces: Array.from(workspaces.values())
          });
          break;

        default:
          throw new Error(`Formato não suportado: ${format}`);
      }

      return true;
    } catch (error) {
      throw new Error(`Falha ao importar dados: ${error.message}`);
    }
  }

  // Métodos privados auxiliares
  async _readData() {
    try {
      const content = await fs.readFile(this.dataFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Falha ao ler arquivo de dados: ${error.message}`);
    }
  }

  async _writeData(data) {
    try {
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error(`Falha ao escrever arquivo de dados: ${error.message}`);
    }
  }
}
