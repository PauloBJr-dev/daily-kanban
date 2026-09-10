import type { Column, KanbanData, Task } from '../types/kanban'

export const DEFAULT_COLUMNS: Column[] = [
  {
    id: 'col-todo',
    title: 'A Fazer',
    order: 0,
    colorTheme: 'blue',
    isPermanent: true,
  },
  {
    id: 'col-progress',
    title: 'Em Progresso',
    order: 1,
    colorTheme: 'amber',
    isPermanent: true,
  },
  {
    id: 'col-review',
    title: 'Em Espera',
    order: 2,
    colorTheme: 'purple',
    isPermanent: true,
  },
  {
    id: 'col-done',
    title: 'Concluído Hoje',
    order: 3,
    colorTheme: 'emerald',
    isPermanent: true,
  },
]

export const SEED_TASKS: Task[] = []

export const INITIAL_DATA: KanbanData = {
  columns: DEFAULT_COLUMNS,
  tasks: SEED_TASKS,
  version: 1,
}
