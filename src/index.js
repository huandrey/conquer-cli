#!/usr/bin/env node
import { Command } from 'commander';
import { JSONStorage } from './storage/json-storage.js';
import { WorkspaceService } from './services/workspace-service.js';
import { TaskService } from './services/task-service.js';
import { TemplateService } from './services/template-service.js';
import { setupCommands } from './commands/index.js';
import { colors } from './ui/colors.js';

async function main() {
  try {
    // Inicializa o armazenamento
    const storage = new JSONStorage();
    await storage.init();

    // Inicializa os serviços
    const services = {
      workspaceService: new WorkspaceService(storage),
      taskService: new TaskService(storage),
      templateService: new TemplateService(storage)
    };

    // Configura o programa CLI
    const program = new Command();
    program
      .name('todo')
      .description('CLI para gerenciamento de tarefas')
      .version('1.0.0');

    // Configura os comandos
    setupCommands(program, services);

    // Adiciona comando de ajuda personalizado
    program
      .on('--help', () => {
        console.log('');
        console.log('Exemplos:');
        console.log('  $ todo workspace              # Gerenciar workspaces');
        console.log('  $ todo task                   # Gerenciar tarefas');
        console.log('  $ todo template               # Gerenciar templates');
        console.log('  $ todo dashboard              # Visualizar dashboard');
      });

    // Trata quando nenhum comando é fornecido
    if (process.argv.length === 2) {
      console.log(colors.info('Bem-vindo ao Todo CLI!'));
      program.help();
    }

    // Processa os argumentos
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(colors.error('Erro:'), error.message);
    process.exit(1);
  }
}

// Executa o programa
main().catch(error => {
  console.error(colors.error('Erro fatal:'), error);
  process.exit(1);
});
