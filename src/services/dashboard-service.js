import { format, isWithinInterval, addDays } from 'date-fns';

export class DashboardService {
  constructor(storage) {
    this.storage = storage;
  }

  async getDashboard(workspaceId) {
    const workspace = await this.storage.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Análise de tarefas
    const taskAnalysis = this._analyzeWorkspaceTasks(workspace.tasks);

    // Métricas gerais
    const metrics = {
      total: workspace.tasks.length,
      today: taskAnalysis.today.length,
      overdue: taskAnalysis.overdue.length,
      upcoming: taskAnalysis.upcoming.length,
      blocked: taskAnalysis.blocked.length
    };

    // Distribuições
    const distributions = {
      status: this._getStatusDistribution(workspace.tasks),
      priority: this._getPriorityDistribution(workspace.tasks)
    };

    // Alertas
    const alerts = this._generateAlerts(taskAnalysis);

    return {
      metrics,
      distributions,
      alerts,
      todayTasks: taskAnalysis.today,
      overdueTasks: taskAnalysis.overdue,
      upcomingTasks: taskAnalysis.upcoming,
      blockedTasks: taskAnalysis.blocked
    };
  }

  _analyzeWorkspaceTasks(tasks) {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    return {
      today: tasks.filter(task => 
        format(new Date(task.dueDate), 'yyyy-MM-dd') === todayStr
      ),
      overdue: tasks.filter(task => 
        new Date(task.dueDate) < today && task.status !== 'concluida'
      ),
      upcoming: tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return isWithinInterval(dueDate, {
          start: addDays(today, 1),
          end: addDays(today, 7)
        });
      }),
      blocked: tasks.filter(task => task.status === 'bloqueada')
    };
  }

  _getStatusDistribution(tasks) {
    const distribution = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    return {
      backlog: distribution.backlog || 0,
      andamento: distribution.andamento || 0,
      review: distribution.review || 0,
      concluida: distribution.concluida || 0,
      bloqueada: distribution.bloqueada || 0
    };
  }

  _getPriorityDistribution(tasks) {
    const distribution = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    return {
      1: distribution[1] || 0, // Urgente
      2: distribution[2] || 0, // Alta
      3: distribution[3] || 0, // Média
      4: distribution[4] || 0, // Baixa
      5: distribution[5] || 0  // Rotina
    };
  }

  _generateAlerts(taskAnalysis) {
    const alerts = [];

    // Alerta de tarefas atrasadas
    if (taskAnalysis.overdue.length > 0) {
      alerts.push({
        type: 'danger',
        message: `Você tem ${taskAnalysis.overdue.length} tarefa(s) atrasada(s)!`
      });
    }

    // Alerta de tarefas bloqueadas
    if (taskAnalysis.blocked.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${taskAnalysis.blocked.length} tarefa(s) está(ão) bloqueada(s)`
      });
    }

    // Alerta de tarefas para hoje
    if (taskAnalysis.today.length > 0) {
      alerts.push({
        type: 'info',
        message: `Você tem ${taskAnalysis.today.length} tarefa(s) para hoje`
      });
    }

    return alerts;
  }
}
