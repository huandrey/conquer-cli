// src/commands/index.js
import workspaceCommands from './workspace.js';
import taskCommands from './task.js';
import templateCommands from './template.js';
import dashboardCommands from './dashboard.js';

export function setupCommands(program, services) {
  // Configura cada grupo de comandos
  workspaceCommands(program, services);
  taskCommands(program, services);
  templateCommands(program, services);
  dashboardCommands(program, services);

  return program;
}

// src/commands/dashboard.js
import { colors } from '../ui/colors.js';
import { formatters } from '../ui/formatters.js';

export default function(program, services) {
  const { dashboardService } = services;

  program
    .command('dashboard')
    .description('Visualizar dashboard')
    .action(async () => {
      try {
        const workspace = await services.workspaceService.getActiveWorkspace();
        if (!workspace) {
          console.log(colors.error('Nenhum workspace selecionado. Use o comando "workspace" para selecionar um.'));
          return;
        }

        const dashboard = await dashboardService.getDashboard(workspace.id);

        // Exibe alertas
        dashboard.alerts.forEach(alert => {
          const colorFn = alert.type === 'danger' ? colors.error :
                         alert.type === 'warning' ? colors.warning :
                         colors.info;
          console.log(colorFn(alert.message));
        });

        console.log('\n=== Métricas ===');
        console.log(`Total de tarefas: ${dashboard.metrics.total}`);
        console.log(`Tarefas para hoje: ${dashboard.metrics.today}`);
        console.log(`Tarefas atrasadas: ${colors.error(dashboard.metrics.overdue)}`);
        console.log(`Tarefas bloqueadas: ${colors.warning(dashboard.metrics.blocked)}`);
        console.log(`Tarefas próximas: ${dashboard.metrics.upcoming}`);

        console.log('\n=== Distribuição por Status ===');
        Object.entries(dashboard.distributions.status).forEach(([status, count]) => {
          console.log(`${colors.status[status](status)}: ${count}`);
        });

        console.log('\n=== Distribuição por Prioridade ===');
        Object.entries(dashboard.distributions.priority).forEach(([priority, count]) => {
          console.log(`${colors.priority[priority](`P${priority}`)}: ${count}`);
        });

        if (dashboard.todayTasks.length > 0) {
          console.log('\n=== Tarefas de Hoje ===');
          dashboard.todayTasks.forEach(task => {
            console.log(formatters.taskSummary(task));
          });
        }

        if (dashboard.overdueTasks.length > 0) {
          console.log('\n=== Tarefas Atrasadas ===');
          dashboard.overdueTasks.forEach(task => {
            console.log(formatters.taskSummary(task));
          });
        }

      } catch (error) {
        console.error(colors.error('Erro ao carregar dashboard:'), error.message);
      }
    });
}
