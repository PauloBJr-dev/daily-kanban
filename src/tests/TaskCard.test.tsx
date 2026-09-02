import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskCard } from '../components/TaskCard'
import type { Column, Task } from '../types/kanban'

describe('TaskCard', () => {
  const mockColumns: Column[] = [
    { id: 'col-todo', title: 'A Fazer', order: 0, colorTheme: 'blue' },
    { id: 'col-doing', title: 'Em Progresso', order: 1, colorTheme: 'amber' },
    { id: 'col-done', title: 'Concluído', order: 2, colorTheme: 'emerald' },
  ]

  const sampleTask: Task = {
    id: 'task-1',
    title: 'Finalizar documentação técnica',
    description: 'Descrever endpoints e fluxo de autenticação',
    columnId: 'col-todo',
    priority: 'high',
    tags: ['Dev', 'Docs'],
    dueDate: '2026-09-02',
    subtasks: [
      { id: 'sub-1', title: 'Endpoints', completed: true },
      { id: 'sub-2', title: 'Auth flow', completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const defaultProps = {
    task: sampleTask,
    columns: mockColumns,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onMove: vi.fn(),
    onToggleSubtask: vi.fn(),
    onStartFocus: vi.fn(),
    isFocused: false,
  }

  it('renderiza o título, descrição, prioridade e tags da tarefa', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.getByText('Finalizar documentação técnica')).toBeInTheDocument()
    expect(
      screen.getByText('Descrever endpoints e fluxo de autenticação')
    ).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
    expect(screen.getByText('#Dev')).toBeInTheDocument()
    expect(screen.getByText('#Docs')).toBeInTheDocument()
  })

  it('exibe checklist e percentual de progresso', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.getByText(/Checklist \(1\/2\)/)).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('Endpoints')).toBeInTheDocument()
    expect(screen.getByText('Auth flow')).toBeInTheDocument()
  })

  it('dispara onEdit ao clicar no título da tarefa', () => {
    const onEdit = vi.fn()
    render(<TaskCard {...defaultProps} onEdit={onEdit} />)

    fireEvent.click(screen.getByText('Finalizar documentação técnica'))
    expect(onEdit).toHaveBeenCalledWith(sampleTask)
  })

  it('dispara onStartFocus ao clicar no botão de play de foco', () => {
    const onStartFocus = vi.fn()
    render(<TaskCard {...defaultProps} onStartFocus={onStartFocus} />)

    const playButton = screen.getByTitle('Iniciar Pomodoro nesta tarefa')
    fireEvent.click(playButton)

    expect(onStartFocus).toHaveBeenCalledWith('task-1', 'Finalizar documentação técnica')
  })

  it('dispara onMove para a próxima coluna ao clicar no botão de avançar', () => {
    const onMove = vi.fn()
    render(<TaskCard {...defaultProps} onMove={onMove} />)

    const moveButton = screen.getByTitle('Avançar para Em Progresso')
    fireEvent.click(moveButton)

    expect(onMove).toHaveBeenCalledWith('task-1', 'col-doing')
  })

  it('dispara onToggleSubtask ao clicar na checkbox da subtarefa', () => {
    const onToggleSubtask = vi.fn()
    render(<TaskCard {...defaultProps} onToggleSubtask={onToggleSubtask} />)

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1])

    expect(onToggleSubtask).toHaveBeenCalledWith('task-1', 'sub-2')
  })

  it('abre menu e dispara onDelete ao selecionar excluir', () => {
    const onDelete = vi.fn()
    render(<TaskCard {...defaultProps} onDelete={onDelete} />)

    // Open options menu
    const moreBtn = screen.getByTitle('Mais opções')
    fireEvent.click(moreBtn)

    const deleteBtn = screen.getByText('Excluir')
    fireEvent.click(deleteBtn)

    expect(onDelete).toHaveBeenCalledWith('task-1')
  })
})
