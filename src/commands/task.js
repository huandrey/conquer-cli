import inquirer from 'inquirer';
import { colors } from '../ui/colors.js';
import { prompts } from '../ui/prompts.js';
import { formatters } from '../ui/formatters.js';

export default function (program, services) {
  const { workspaceService, taskService } = services;

  program
    .command('task')
    .description('Gerenciar tarefas')
    .action(async () => {
      const actions = {
        create: 'Criar nova tarefa',
        list: 'Listar tarefas',
        view: 'Visualizar tarefa',
        update: 'Atualizar status',
        block: 'Adicionar/remover bloqueio'
      };

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'O que você deseja fazer?',
          choices: Object.values(actions)
        }
      ]);

      const activeWorkspace = await workspaceService.getActiveWorkspace();
      if (!activeWorkspace) {
        console.log(colors.error('Nenhum workspace selecionado. Use o comando "workspace" para selecionar um.'));
        return;
      }

      switch (action) {
        case actions.create:
          const taskData = await prompts.createTask();
          const task = await taskService.createTask(activeWorkspace.id, {
            ...taskData,
            dueDate: new Date(Date.now() + taskData.daysUntilDue * 24 * 60 * 60 * 1000)
          });
          console.log(colors.success('Tarefa criada com sucesso!'));
          console.log(formatters.task(task));
          break;

        case actions.list:
          const { filter } = await inquirer.prompt([
            {
              type: 'list',
              name: 'filter',
              message: 'Filtrar por:',
              choices: [
                'Todas',
                'Hoje',
                'Próximos 7 dias',
                'Atrasadas',
                'Por prioridade'
              ]
            }
          ]);

          let tasks = [];
          switch (filter) {
            case 'Hoje':
              tasks = await taskService.getTasksByDate(activeWorkspace.id, new Date());
              break;
            case 'Próximos 7 dias':
              tasks = await taskService.getTasksByDateRange(activeWorkspace.id, new Date(), 7);
              break;
            case 'Atrasadas':
              tasks = await taskService.getOverdueTasks(activeWorkspace.id);
              break;
            case 'Por prioridade':
              const { priority } = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'priority',
                  message: 'Selecione a prioridade:',
                  choices: [
                    { name: 'Urgente', value: 1 },
                    { name: 'Alta', value: 2 },
                    { name: 'Média', value: 3 },
                    { name: 'Baixa', value: 4 },
                    { name: 'Rotina', value: 5 }
                  ]
                }
              ]);
              tasks = await taskService.filterByPriority(activeWorkspace.id, priority);
              break;
            default:
              tasks = activeWorkspace.tasks;
          }

          if (tasks.length === 0) {
            console.log(colors.info('Nenhuma tarefa encontrada.'));
          } else {
            tasks.forEach(task => {
              console.log(formatters.taskSummary(task));
            });
          }
          break;

        case actions.view:
          const { taskId: taskIdToView  } = await inquirer.prompt([
            {
              type: 'input',
              name: 'taskId',
              message: 'ID da tarefa:'
            }
          ]);

          try {
            const taskToView = await taskService.getTaskById(activeWorkspace.id, taskIdToView);
            console.log(formatters.task(taskToView));
          } catch (error) {
            console.log(colors.error(error.message));
          }
          break;

        case actions.update:
          const { taskId: taskIdToUpdate } = await inquirer.prompt([
            {
              type: 'input',
              name: 'taskId',
              message: 'ID da tarefa:'
            }
          ]);

          const taskToUpdate = await taskService.getTaskById(activeWorkspace.id, taskIdToUpdate);
          const { newStatus } = await prompts.updateTaskStatus(taskToUpdate.status);

          try {
            const updatedTask = await taskService.updateTaskStatus(
              activeWorkspace.id,
              taskIdToUpdate,
              newStatus
            );
            console.log(colors.success('Status atualizado com sucesso!'));
            console.log(formatters.task(updatedTask));
          } catch (error) {
            console.log(colors.error(error.message));
          }
          break;

        case actions.block:
          // Primeiro, pedir o ID da tarefa
          const { taskId: taskIdToBlock } = await inquirer.prompt([
            {
              type: 'input',
              name: 'taskId',
              message: 'ID da tarefa:'
            }
          ]);

          try {
            const taskToBlock = await taskService.getTaskById(activeWorkspace.id, taskIdToBlock);

            if (taskToBlock.blockers.length > 0) {
              const { action } = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'action',
                  message: 'O que você deseja fazer?',
                  choices: [
                    'Adicionar novo bloqueio',
                    'Remover bloqueio existente'
                  ]
                }
              ]);

              if (action === 'Remover bloqueio existente') {
                const { blockerId } = await inquirer.prompt([
                  {
                    type: 'list',
                    name: 'blockerId',
                    message: 'Selecione o bloqueio para remover:',
                    choices: taskToBlock.blockers.map(b => ({
                      name: b.description,
                      value: b.id
                    }))
                  }
                ]);

                await taskService.removeBlocker(activeWorkspace.id, taskIdToBlock, blockerId);
                console.log(colors.success('Bloqueio removido com sucesso!'));
                return;
              }
            }

            // Adicionar novo bloqueio
            const blockerData = await prompts.addBlocker();
            await taskService.addBlocker(activeWorkspace.id, taskIdToBlock, blockerData);
            console.log(colors.success('Bloqueio adicionado com sucesso!'));
          } catch (error) {
            console.log(colors.error(error.message));
          }
          break;
      }
    });
}
