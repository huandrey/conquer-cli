export class Workspace {
  constructor(name) {
    this.id = null; // Será definido pelo id-generator
    this.name = name;
    this.tasks = [];
    this.templates = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addTask(task) {
    this.tasks.push(task);
    this.updatedAt = new Date();
  }

  removeTask(taskId) {
    const index = this.tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      tasks: this.tasks,
      templates: this.templates,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
