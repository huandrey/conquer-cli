
// src/models/Task.js
export class Task {
  constructor({
    name,
    dueDate,
    assignees = [],
    priority = 5,
    tags = [],
    description = '',
    parentId = null
  }) {
    this.id = null; // Será definido pelo id-generator
    this.name = name;
    this.dueDate = dueDate;
    this.assignees = assignees;
    this.status = 'backlog';
    this.priority = priority;
    this.tags = tags;
    this.description = description;
    this.subtasks = [];
    this.comments = [];
    this.blockers = [];
    this.parentId = parentId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addSubtask(subtask) {
    this.subtasks.push(subtask);
    this.updatedAt = new Date();
  }

  addComment(comment) {
    this.comments.push({
      ...comment,
      createdAt: new Date()
    });
    this.updatedAt = new Date();
  }

  updateStatus(newStatus) {
    const validStatuses = ['backlog', 'andamento', 'review', 'concluida', 'bloqueada'];
    if (validStatuses.includes(newStatus)) {
      this.status = newStatus;
      this.updatedAt = new Date();
    }
  }

  addBlocker(blocker) {
    this.blockers.push({
      ...blocker,
      createdAt: new Date()
    });
    this.status = 'bloqueada';
    this.updatedAt = new Date();
  }

  removeBlocker(blockerId) {
    const index = this.blockers.findIndex(b => b.id === blockerId);
    if (index !== -1) {
      this.blockers.splice(index, 1);
      if (this.blockers.length === 0) {
        this.status = 'andamento';
      }
      this.updatedAt = new Date();
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      dueDate: this.dueDate,
      assignees: this.assignees,
      status: this.status,
      priority: this.priority,
      tags: this.tags,
      description: this.description,
      subtasks: this.subtasks,
      comments: this.comments,
      blockers: this.blockers,
      parentId: this.parentId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
