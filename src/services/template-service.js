import { Template } from '../models/Template.js';

export class TemplateService {
  constructor(storage) {
    this.storage = storage;
  }

  async createTemplate(workspaceId, templateData) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const template = new Template(templateData);
    template.id = generateId(); // Implementar
    workspace.templates.push(template);
    
    await this.storage.saveWorkspace(workspace);
    return template;
  }

  async createTaskFromTemplate(workspaceId, templateId, customProps = {}) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const template = workspace.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const task = template.createTask(customProps);
    task.id = generateId(); // Implementar
    workspace.addTask(task);
    
    await this.storage.saveWorkspace(workspace);
    return task;
  }

  async getTemplates(workspaceId) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    return workspace.templates;
  }

  async updateTemplate(workspaceId, templateId, updates) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const template = workspace.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    Object.assign(template, updates);
    template.updatedAt = new Date();
    
    await this.storage.saveWorkspace(workspace);
    return template;
  }
}
