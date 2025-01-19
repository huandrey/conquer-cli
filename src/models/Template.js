export class Template {
  constructor({
    name,
    description = '',
    defaultPriority = 5,
    defaultTags = [],
    defaultAssignees = [],
    subtaskTemplates = []
  }) {
    this.id = null; // Será definido pelo id-generator
    this.name = name;
    this.description = description;
    this.defaultPriority = defaultPriority;
    this.defaultTags = defaultTags;
    this.defaultAssignees = defaultAssignees;
    this.subtaskTemplates = subtaskTemplates;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  createTask(customProps = {}) {
    return new Task({
      name: this.name,
      priority: this.defaultPriority,
      tags: [...this.defaultTags],
      assignees: [...this.defaultAssignees],
      description: this.description,
      ...customProps
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      defaultPriority: this.defaultPriority,
      defaultTags: this.defaultTags,
      defaultAssignees: this.defaultAssignees,
      subtaskTemplates: this.subtaskTemplates,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
