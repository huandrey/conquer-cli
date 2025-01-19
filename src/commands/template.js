import inquirer from 'inquirer';
import { colors } from '../ui/colors.js';
import { prompts } from '../ui/prompts.js';
import { formatters } from '../ui/formatters.js';

export default function(program, services) {
 const { workspaceService, templateService } = services;

 program
   .command('template')
   .description('Gerenciar templates')
   .action(async () => {
     const actions = {
       create: 'Criar novo template',
       list: 'Listar templates',
       use: 'Usar template',
       delete: 'Remover template'
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
         const templateData = await prompts.createTemplate();
         const template = await templateService.createTemplate(activeWorkspace.id, templateData);
         console.log(colors.success('Template criado com sucesso!'));
         console.log(formatters.template(template));
         break;

       case actions.list:
         const templates = await templateService.getTemplates(activeWorkspace.id);
         if (templates.length === 0) {
           console.log(colors.info('Nenhum template encontrado.'));
         } else {
           templates.forEach(template => {
             console.log(formatters.template(template));
             console.log('---');
           });
         }
         break;

       case actions.use:
         const allTemplates = await templateService.getTemplates(activeWorkspace.id);
         if (allTemplates.length === 0) {
           console.log(colors.error('Nenhum template disponível.'));
           return;
         }

         const { templateId } = await inquirer.prompt([
           {
             type: 'list',
             name: 'templateId',
             message: 'Selecione o template:',
             choices: allTemplates.map(t => ({
               name: t.name,
               value: t.id
             }))
           }
         ]);

         // Permite customizar alguns campos do template
         const customProps = await inquirer.prompt([
           {
             type: 'input',
             name: 'name',
             message: 'Nome da tarefa (Enter para usar o nome do template):'
           },
           {
             type: 'number',
             name: 'daysUntilDue',
             message: 'Prazo em dias:',
             validate: input => input > 0 || 'Prazo deve ser maior que 0'
           }
         ]);

         const taskFromTemplate = await templateService.createTaskFromTemplate(
           activeWorkspace.id,
           templateId,
           {
             ...customProps,
             dueDate: new Date(Date.now() + customProps.daysUntilDue * 24 * 60 * 60 * 1000)
           }
         );

         console.log(colors.success('Tarefa criada com sucesso a partir do template!'));
         console.log(formatters.task(taskFromTemplate));
         break;

       case actions.delete:
         const templatesToDelete = await templateService.getTemplates(activeWorkspace.id);
         if (templatesToDelete.length === 0) {
           console.log(colors.error('Nenhum template disponível para remover.'));
           return;
         }

         const { templateToDelete } = await inquirer.prompt([
           {
             type: 'list',
             name: 'templateToDelete',
             message: 'Selecione o template para remover:',
             choices: templatesToDelete.map(t => ({
               name: t.name,
               value: t.id
             }))
           }
         ]);

         await templateService.deleteTemplate(activeWorkspace.id, templateToDelete);
         console.log(colors.success('Template removido com sucesso!'));
         break;
     }
   });
}
