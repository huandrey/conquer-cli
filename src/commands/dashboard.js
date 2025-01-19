import { colors } from '../ui/colors.js';
import { formatters } from '../ui/formatters.js';

export default function(program, services) {
  const { workspaceService, taskService } = services;

  program
    .command('dashboard')
    .description('Visualizar dashboard')
    .action(async () => {
      const activeWorkspace = await workspaceService.getActiveWorkspace();
      if (!activeWorkspace) {
        console.log(colors.error('Nenhum workspace selecionado. Use o comando "workspace" para selecionar um.'));
        return;
      }

      const dashboard = await taskService.getTasksDashboard(activeWorkspace.id);
      console.log(formatters.dashboard(dashboard));
    });

  // Aliases e atalhos
  program
    .command('config')
    .description('Configurar atalhos e aliases')
    .action(async () => {
      // TODO: Implementar sistema de configuração de atalhos
      console.log(colors.warning('Configuração de atalhos será implementada em breve.'));
    });
}
