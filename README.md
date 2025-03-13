# conquer-cli
Uma CLI poderosa para gerenciamento de tarefas diárias, projetada para desenvolvedores que querem a praticidade de trabalhar direto do terminal.

### Principais características
- 🏢 **Workspaces**: Organize suas tarefas em diferentes contextos (trabalho, pessoal, projetos)
- 📋 **Gestão de Tarefas**: Sistema completo com prioridades, prazos e responsáveis
- 📊 **Dashboard**: Visualize rapidamente suas atividades e métricas  
- 🎯 **Prioridades**: Escala de 1 a 5 (Urgente à Rotina)
- 🔄 **Fluxo de Status**: backlog → andamento → review → concluída
- 🚫 **Gestão de Bloqueios**: Identifique e registre impedimentos
- 📝 **Templates**: Crie modelos para tarefas recorrentes
- 🎨 **Interface Colorida**: Feedback visual claro e intuitivo
- 💾 **Backup Automático**: Seus dados sempre seguros

### Funcionalidades
- Adicione, atualize e gerencie tarefas
- Filtre atividades por data, prioridade e status
- Crie subtarefas para melhor organização
- Adicione comentários e tags
- Veja métricas e distribuição de prioridades
- Exporte e importe dados
- Customize atalhos e aliases

### Por que usar?
- 🚀 **Produtividade**: Gerencie tarefas sem sair do terminal
- 📈 **Organização**: Mantenha um fluxo de trabalho estruturado
- 🎯 **Foco**: Priorize o que realmente importa
- 🔄 **Processo**: Acompanhe o progresso de forma clara
- 💪 **Divisão e Conquista**: Quebre grandes desafios em partes gerenciáveis

### Tecnologias
- Node.js
- Commander.js para CLI
- Inquirer.js para interatividade
- Chalk para estilização
- Sistema de armazenamento em JSON

### Comandos Disponíveis
#### Workspace Management
```bash
# Gerenciar workspaces
todo workspace        # Menu interativo de workspaces
 ├─ create          # Criar novo workspace
 ├─ list           # Listar workspaces
 ├─ select         # Selecionar workspace ativo
 └─ delete         # Remover workspace
 ```

#### Task Management
```bash
 # Gerenciar tarefas
todo task            # Menu interativo de tarefas
  ├─ create         # Criar nova tarefa
  ├─ list           # Listar tarefas (com filtros)
  ├─ view           # Visualizar detalhes da tarefa
  ├─ update         # Atualizar status
  └─ block          # Gerenciar bloqueios
```

#### Template Management
```bash
# Gerenciar templates
todo template        # Menu interativo de templates
  ├─ create         # Criar novo template
  ├─ list           # Listar templates
  ├─ use            # Usar template para criar tarefa
  └─ delete         # Remover template
```

#### Dashboard & Utilities
```bash
# Visualizar e gerenciar
todo dashboard       # Ver overview e métricas
todo config         # Configurar atalhos e aliases

# Ajuda
todo --help         # Mostrar ajuda
todo --version      # Mostrar versão
```

#### Exemplos de Uso
```bash
# Criar um novo workspace para projeto
todo workspace create

# Adicionar uma nova tarefa
todo task create

# Ver tarefas do dia
todo dashboard

# Usar um template existente
todo template use

# Alterar status de uma tarefa
todo task update
```

Gerencie suas tarefas de forma eficiente, direto do seu terminal. Divida para conquistar! 🎯
