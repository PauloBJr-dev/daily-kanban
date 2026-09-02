import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Board } from '../components/Board'
import type { Column, Task } from '../types/kanban'

describe('Board', () => {
  const mockColumns: Column[] = [
    { id: 'col-todo', title: 'A Fazer', order: 0, colorTheme: 'blue' },
    { id: 'col-doing', title: 'Em Progresso', order: 1, colorTheme: 'amber' },
    { id: 'col-done', title: 'Concluído', order: 2, colorTheme: 'emerald' },
  ]

  const mockTasks: Task[] = [
    {
      id: 't-1',
      title: 'Tarefa 1',
      columnId: 'col-todo',
      priority: 'medium',
      tags: [],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 't-2',
      title: 'Tarefa 2',
      columnId: 'col-doing',
      priority: 'high',
      tags: [],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const defaultProps = {
    columns: mockColumns,
    tasks: mockTasks,
    onNewTaskInColumn: vi.fn(),
    onEditTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onMoveTask: vi.fn(),
    onToggleSubtask: vi.fn(),
    onStartFocus: vi.fn(),
    onAddColumn: vi.fn(),
    onDeleteColumn: vi.fn(),
  }

  it('renderiza todas as colunas e suas tarefas respectivas', () => {
    render(<Board {...defaultProps} />)

    expect(screen.getByText('A Fazer')).toBeInTheDocument()
    expect(screen.getByText('Em Progresso')).toBeInTheDocument()
    expect(screen.getByText('Concluído')).toBeInTheDocument()
    expect(screen.getByText('Tarefa 1')).toBeInTheDocument()
    expect(screen.getByText('Tarefa 2')).toBeInTheDocument()
  })

  it('permite adicionar uma nova coluna com nome e tema de cor', () => {
    const onAddColumn = vi.fn()
    render(<Board {...defaultProps} onAddColumn={onAddColumn} />)

    // Open add column form
    const addColBtn = screen.getByText('Adicionar Coluna')
    fireEvent.click(addColBtn)

    expect(screen.getByText('Nova Coluna')).toBeInTheDocument()

    // Type column name
    const input = screen.getByPlaceholderText('Nome da coluna...')
    fireEvent.change(input, { target: { value: 'Bloqueado' } })

    // Select color theme (e.g. Rosa)
    const roseThemeBtn = screen.getByTitle('Rosa')
    fireEvent.click(roseThemeBtn)

    // Submit
    const submitBtn = screen.getByText('Criar Coluna')
    fireEvent.click(submitBtn)

    expect(onAddColumn).toHaveBeenCalledWith('Bloqueado', 'rose')
  })
})
