import { format } from 'date-fns';
import { colors } from './colors.js';

export const formatters = {
  task(task) {
    return `
${colors.priority[task.priority](`[P${task.priority}]`)} ${colors.id(`#${task.id}`)}
${task.name}
${colors.status[task.status](task.status.toUpperCase())}
Prazo: ${colors.date(format(new Date(task.dueDate), 'dd/MM/yyyy'))}
Responsáveis: ${task.assignees.join(', ')}
${task.tags.length ? `Tags: ${task.tags.join(', ')}\n` : ''}
${task.description ? `\nDescrição:\n${task.description}\n` : ''}
${task.blockers.length ? `\nBloqueios:\n${task.blockers.map(b => `- ${b.description}`).join('\n')}\n` : ''}
${task.subtasks.length ? `\nSubtarefas:\n${task.subtasks.map(s => `- [${s.status === 'concluida' ? 'x' : ' '}] ${s.name}`).join('\n')}\n` : ''}
    `.trim();
  },

  dashboard(dashboard) {
    return `
=== Dashboard ===

Tarefas Hoje: ${dashboard.today.length}
Tarefas Atrasadas: ${colors.error(dashboard.overdue.length)}
Tarefas Próximas: ${dashboard.upcoming.length}

Status:
${Object.entries(dashboard.statusDistribution)
  .map(([status, count]) => `${colors.status[status](status)}: ${count}`)
  .join('\n')}

Prioridades:
${Object.entries(dashboard.priorityDistribution)
  .map(([priority, count]) => `${colors.priority[priority](`P${priority}`)}: ${count}`)
  .join('\n')}

=== Tarefas de Hoje ===
${dashboard.today.map(task => formatters.taskSummary(task)).join('\n')}

=== Tarefas Atrasadas ===
${dashboard.overdue.map(task => formatters.taskSummary(task)).join('\n')}
`.trim();
  },

  taskSummary(task) {
    return `${colors.priority[task.priority](`[P${task.priority}]`)} ${colors.id(`#${task.id}`)} ${task.name} - ${colors.status[task.status](task.status)}`;
  },

  template(template) {
    return `
=== Template: ${template.name} ===
${template.description ? `\nDescrição:\n${template.description}\n` : ''}
Prioridade Padrão: ${colors.priority[template.defaultPriority](`P${template.defaultPriority}`)}
Tags Padrão: ${template.defaultTags.join(', ') || 'Nenhuma'}
Responsáveis Padrão: ${template.defaultAssignees.join(', ') || 'Nenhum'}
`.trim();
  }
};
