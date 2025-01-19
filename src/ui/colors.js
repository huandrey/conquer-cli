import chalk from 'chalk';

export const colors = {
  priority: {
    1: chalk.red.bold,      // Urgente
    2: chalk.yellow.bold,   // Alta
    3: chalk.blue.bold,     // Média
    4: chalk.green.bold,    // Baixa
    5: chalk.gray.bold      // Rotina
  },
  status: {
    backlog: chalk.gray,
    andamento: chalk.blue,
    review: chalk.yellow,
    concluida: chalk.green,
    bloqueada: chalk.red
  },
  error: chalk.red,
  success: chalk.green,
  warning: chalk.yellow,
  info: chalk.blue,
  date: chalk.cyan,
  id: chalk.gray
};

// src/ui/prompts.js
import inquirer from 'inquirer';

export const prompts = {
  async createWorkspace() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Nome do workspace:',
        validate: input => input.length >= 3 || 'Nome deve ter pelo menos 3 caracteres'
      }
    ]);
  },

  async selectWorkspace(workspaces) {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'id',
        message: 'Selecione o workspace:',
        choices: workspaces.map(w => ({
          name: w.name,
          value: w.id
        }))
      }
    ]);
  },

  async createTask() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Nome da tarefa:',
        validate: input => input.length >= 3 || 'Nome deve ter pelo menos 3 caracteres'
      },
      {
        type: 'number',
        name: 'daysUntilDue',
        message: 'Prazo em dias:',
        validate: input => input > 0 || 'Prazo deve ser maior que 0'
      },
      {
        type: 'input',
        name: 'assignees',
        message: 'Pessoas envolvidas (separadas por vírgula):',
        filter: input => input.split(',').map(s => s.trim()).filter(Boolean)
      },
      {
        type: 'list',
        name: 'priority',
        message: 'Prioridade:',
        choices: [
          { name: 'Urgente', value: 1 },
          { name: 'Alta', value: 2 },
          { name: 'Média', value: 3 },
          { name: 'Baixa', value: 4 },
          { name: 'Rotina', value: 5 }
        ]
      },
      {
        type: 'input',
        name: 'tags',
        message: 'Tags (separadas por vírgula):',
        filter: input => input.split(',').map(s => s.trim()).filter(Boolean)
      },
      {
        type: 'editor',
        name: 'description',
        message: 'Descrição (opcional):'
      }
    ]);
  },

  async updateTaskStatus(currentStatus) {
    const validTransitions = {
      'backlog': ['andamento'],
      'andamento': ['review', 'bloqueada'],
      'review': ['concluida', 'andamento'],
      'bloqueada': ['andamento'],
      'concluida': []
    };

    return inquirer.prompt([
      {
        type: 'list',
        name: 'status',
        message: 'Novo status:',
        choices: validTransitions[currentStatus]
      }
    ]);
  },

  async addBlocker() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Descrição do bloqueio:',
        validate: input => input.length >= 5 || 'Descrição deve ter pelo menos 5 caracteres'
      }
    ]);
  },

  async createTemplate() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Nome do template:',
        validate: input => input.length >= 3 || 'Nome deve ter pelo menos 3 caracteres'
      },
      {
        type: 'editor',
        name: 'description',
        message: 'Descrição do template:'
      },
      {
        type: 'list',
        name: 'defaultPriority',
        message: 'Prioridade padrão:',
        choices: [
          { name: 'Urgente', value: 1 },
          { name: 'Alta', value: 2 },
          { name: 'Média', value: 3 },
          { name: 'Baixa', value: 4 },
          { name: 'Rotina', value: 5 }
        ]
      },
      {
        type: 'input',
        name: 'defaultTags',
        message: 'Tags padrão (separadas por vírgula):',
        filter: input => input.split(',').map(s => s.trim()).filter(Boolean)
      },
      {
        type: 'input',
        name: 'defaultAssignees',
        message: 'Pessoas padrão (separadas por vírgula):',
        filter: input => input.split(',').map(s => s.trim()).filter(Boolean)
      }
    ]);
  }
};
