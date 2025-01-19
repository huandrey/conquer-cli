// src/commands/workspace.js
import inquirer from 'inquirer';
import { colors } from '../ui/colors.js';
import { prompts } from '../ui/prompts.js';

export default function(program, services) {
 const { workspaceService } = services;

 program
   .command('workspace')
   .description('Gerenciar workspaces')
   .action(async () => {
     const actions = {
       create: 'Criar novo workspace',
       list: 'Listar workspaces', 
       select: 'Selecionar workspace',
       delete: 'Remover workspace'
     };

     const { action } = await inquirer.prompt([
       {
         type: 'list',
         name: 'action',
         message: 'O que você deseja fazer?',
         choices: Object.values(actions)
       }
     ]);

     switch (action) {
       case actions.create:
         const { name } = await prompts.createWorkspace();
         const workspace = await workspaceService.createWorkspace(name);
         console.log(colors.success(`Workspace "${workspace.name}" criado com sucesso!`));
         break;

       case actions.list:
         const workspaces = await workspaceService.getWorkspaces();
         workspaces.forEach(w => {
           console.log(`${colors.id(w.id)} - ${w.name} (${w.tasks.length} tarefas)`);
         });
         break;

       case actions.select:
         const allWorkspaces = await workspaceService.getWorkspaces();
         const { id } = await prompts.selectWorkspace(allWorkspaces);
         await workspaceService.setActiveWorkspace(id);
         const selected = allWorkspaces.find(w => w.id === id);
         console.log(colors.success(`Workspace "${selected.name}" selecionado!`));
         break;

       case actions.delete:
         const workspacesToDelete = await workspaceService.getWorkspaces();
         const { workspaceId } = await prompts.selectWorkspace(workspacesToDelete);
         const { confirm } = await inquirer.prompt([
           {
             type: 'confirm',
             name: 'confirm',
             message: 'Tem certeza? Esta ação não pode ser desfeita.',
             default: false
           }
         ]);
         if (confirm) {
           await workspaceService.deleteWorkspace(workspaceId);
           console.log(colors.success('Workspace removido com sucesso!'));
         }
         break;
     }
   });
}
