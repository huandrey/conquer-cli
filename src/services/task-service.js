import { Task } from '../models/Task.js';
import { format, isWithinInterval, addDays, isBefore } from 'date-fns';
import { generateId } from '../utils/id-generator.js'
import { Workspace } from '../models/Workspace.js'

export class TaskService {
  constructor(storage) {
    this.storage = storage;
  }

  async createTask(workspaceId, taskData) {
    const workspaceData = await this.storage.getWorkspace(workspaceId);
    if (!workspaceData) {
      throw new Error('Workspace not found');
    }

    const workspace = new Workspace(workspaceData.name);
    Object.assign(workspace, workspaceData);

    const task = new Task(taskData);
    task.id = generateId(); 
    workspace.addTask(task);
    
    await this.storage.saveWorkspace(workspace);
    return task;
  }

  async getTasksByDate(workspaceId, date) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const targetDate = new Date(date);
    return workspace.tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return format(taskDate, 'yyyy-MM-dd') === format(targetDate, 'yyyy-MM-dd');
    });
  }

  async getTaskById(workspaceId, taskId) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const task = workspace.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  async updateTaskStatus(workspaceId, taskId, newStatus) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const taskIndex = workspace.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const taskData = workspace.tasks[taskIndex];
    const task = new Task(taskData);
    Object.assign(task, taskData);

    // Validar transições de status permitidas
    const validTransitions = {
      'backlog': ['andamento'],
      'andamento': ['review', 'bloqueada'],
      'review': ['concluida', 'andamento'],
      'bloqueada': ['andamento'],
      'concluida': []
    };

    if (!validTransitions[task.status].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${task.status} to ${newStatus}`);
    }

    task.updateStatus(newStatus);
    await this.storage.saveWorkspace(workspace);
    return task;
  }

  async filterByPriority(workspaceId, priority) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    return workspace.tasks.filter(task => task.priority === priority);
  }

  async addBlocker(workspaceId, taskId, blockerData) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const task = workspace.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const blocker = {
      id: generateId(),
      ...blockerData,
      createdAt: new Date()
    };

    task.blockers = task.blockers || [];
    task.blockers.push(blocker);
    task.status = 'bloqueada';
    task.updatedAt = new Date();

    await this.storage.saveWorkspace(workspace);
    return task;
  }

  async removeBlocker(workspaceId, taskId, blockerId) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const task = workspace.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const blockerIndex = task.blockers.findIndex(b => b.id === blockerId);
    if (blockerIndex === -1) {
      throw new Error('Blocker not found');
    }

    task.blockers.splice(blockerIndex, 1);
    
    // Se não houver mais bloqueios, volta para "andamento"
    if (task.blockers.length === 0 && task.status === 'bloqueada') {
      task.status = 'andamento';
    }
    
    task.updatedAt = new Date();

    await this.storage.saveWorkspace(workspace);
    return task;
  }

  async getTasksDashboard(workspaceId) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    const tasks = workspace.tasks;
    const dashboard = {
      today: tasks.filter(task => format(new Date(task.dueDate), 'yyyy-MM-dd') === todayStr),
      overdue: tasks.filter(task => new Date(task.dueDate) < today),
      upcoming: tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return isWithinInterval(dueDate, {
          start: addDays(today, 1),
          end: addDays(today, 7)
        });
      }),
      statusDistribution: tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {}),
      priorityDistribution: tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {})
    };

    return dashboard;
  }

  async getTasksByDateRange(workspaceId, startDate, days) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const endDate = addDays(startDate, days);

    return workspace.tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isWithinInterval(taskDate, { start: startDate, end: endDate });
    });
  }

  async getOverdueTasks(workspaceId) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const now = new Date();
    return workspace.tasks.filter(task => 
      isBefore(new Date(task.dueDate), now) && task.status !== 'concluida'
    );
  }
}
