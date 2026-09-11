import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MetricsView } from '../components/metrics/MetricsView'
import type { Task } from '../types/kanban'

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Tarefa Urgente',
    description: 'Desc 1',
    columnId: 'col-todo',
    priority: 'urgent',
    tags: ['dev'],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Tarefa Concluída Hoje',
    description: 'Desc 2',
    columnId: 'col-done',
    priority: 'high',
    tags: ['design'],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Tarefa Baixa Prioridade',
    description: 'Desc 3',
    columnId: 'col-progress',
    priority: 'low',
    tags: ['dev'],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe('MetricsView Component', () => {
  it('renderiza o cabeçalho analítico e os 4 cartões de KPIs principais', () => {
    render(<MetricsView tasks={mockTasks} focusTimeMinutes={50} />)

    expect(screen.getByText('Painel de Métricas & Produtividade')).toBeInTheDocument()

    // 4 KPI Cards
    expect(screen.getByText('Metas de Hoje')).toBeInTheDocument()
    expect(screen.getByText('Taxa Geral de Conclusão')).toBeInTheDocument()
    expect(screen.getByText('Prioridade Urgente')).toBeInTheDocument()
    expect(screen.getByText('Tarefas Atrasadas')).toBeInTheDocument()

    // Tempo de Foco Pomodoro
    expect(screen.getAllByText('Foco Pomodoro')[0]).toBeInTheDocument()
    expect(screen.getByText('50 min')).toBeInTheDocument()
  })

  it('permite filtrar tarefas através do FilterBar integrado', () => {
    render(<MetricsView tasks={mockTasks} focusTimeMinutes={25} />)

    // Initial table shows all tasks
    expect(screen.getByText('Tarefa Urgente')).toBeInTheDocument()
    expect(screen.getByText('Tarefa Concluída Hoje')).toBeInTheDocument()
    expect(screen.getByText('Tarefa Baixa Prioridade')).toBeInTheDocument()

    // Filter by search query
    const searchInput = screen.getByPlaceholderText('Buscar tarefas...')
    fireEvent.change(searchInput, { target: { value: 'Urgente' } })

    expect(screen.getByText('Tarefa Urgente')).toBeInTheDocument()
    expect(screen.queryByText('Tarefa Concluída Hoje')).not.toBeInTheDocument()
    expect(screen.queryByText('Tarefa Baixa Prioridade')).not.toBeInTheDocument()
  })

  it('filtra tarefas por prioridade no FilterBar', () => {
    render(<MetricsView tasks={mockTasks} />)

    const prioritySelect = screen.getByLabelText('Filtrar por prioridade')
    fireEvent.change(prioritySelect, { target: { value: 'urgent' } })

    expect(screen.getByText('Tarefa Urgente')).toBeInTheDocument()
    expect(screen.queryByText('Tarefa Concluída Hoje')).not.toBeInTheDocument()
  })

  it('exibe distribuição por coluna e lista de tarefas filtradas', () => {
    render(<MetricsView tasks={mockTasks} />)

    expect(screen.getByText('Por Coluna')).toBeInTheDocument()
    expect(screen.getByText('Por Prioridade')).toBeInTheDocument()
    expect(screen.getByText('Tarefas Analisadas')).toBeInTheDocument()
  })
})
