import { Column, KanbanData, Task } from '../types/kanban'

export const DEFAULT_COLUMNS: Column[] = [
  {
    id: 'col-todo',
    title: 'A Fazer',
    order: 0,
    colorTheme: 'blue',
  },
  {
    id: 'col-progress',
    title: 'Em Progresso',
    order: 1,
    colorTheme: 'amber',
  },
  {
    id: 'col-review',
    title: 'Em Espera',
    order: 2,
    colorTheme: 'purple',
  },
  {
    id: 'col-done',
    title: 'Concluído Hoje',
    order: 3,
    colorTheme: 'emerald',
  },
]

// Get today's date formatted as YYYY-MM-DD
const today = new Date().toISOString().split('T')[0]

export const SEED_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Planejar as prioridades do dia',
    description: 'Definir as 3 metas essenciais da jornada diária e organizar horários.',
    columnId: 'col-done',
    priority: 'high',
    tags: ['Rotina', 'Foco'],
    dueDate: today,
    subtasks: [
      { id: 'sub-1-1', title: 'Revisar pendências de ontem', completed: true },
      { id: 'sub-1-2', title: 'Definir 3 prioridades absolutas', completed: true },
    ],
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Desenvolver a nova funcionalidade do projeto',
    description: 'Codificar os componentes principais e validar fluxos de usuário.',
    columnId: 'col-progress',
    priority: 'urgent',
    tags: ['Trabalho', 'Código'],
    dueDate: today,
    subtasks: [
      { id: 'sub-2-1', title: 'Estruturar os tipos e dados', completed: true },
      { id: 'sub-2-2', title: 'Construir a interface limpa', completed: false },
      { id: 'sub-2-3', title: 'Executar testes unitários', completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Revisão de emails e mensagens pendentes',
    description: 'Responder aos contatos importantes e arquivar notificações.',
    columnId: 'col-todo',
    priority: 'medium',
    tags: ['Comunicação'],
    dueDate: today,
    subtasks: [
      { id: 'sub-3-1', title: 'Responder clientes prioritários', completed: false },
      { id: 'sub-3-2', title: 'Limpar caixa de entrada', completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Aguardando feedback da proposta comercial',
    description: 'Documento enviado para aprovação final da gerência.',
    columnId: 'col-review',
    priority: 'low',
    tags: ['Aguardando'],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Treino e hidratação da tarde',
    description: 'Pausa ativa de 30 minutos para alongamento ou caminhada leve.',
    columnId: 'col-todo',
    priority: 'medium',
    tags: ['Saúde', 'Pessoal'],
    dueDate: today,
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const INITIAL_DATA: KanbanData = {
  columns: DEFAULT_COLUMNS,
  tasks: SEED_TASKS,
  version: 1,
}
