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

  it('renderiza o título, descrição e prioridade da tarefa sem renderizar tags', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.getByText('Finalizar documentação técnica')).toBeInTheDocument()
    expect(
      screen.getByText('Descrever endpoints e fluxo de autenticação')
    ).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
    expect(screen.queryByText('#Dev')).not.toBeInTheDocument()
    expect(screen.queryByText('#Docs')).not.toBeInTheDocument()
  })

  it('exibe checklist e percentual de progresso com componentes de checkbox estilizados', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.getByText(/Checklist \(1\/2\)/)).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('Endpoints')).toBeInTheDocument()
    expect(screen.getByText('Auth flow')).toBeInTheDocument()

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2)
    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true')
    expect(checkboxes[1]).toHaveAttribute('aria-checked', 'false')
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

  it('dispara onToggleSubtask com stopPropagation ao clicar na checkbox da subtarefa', () => {
    const onToggleSubtask = vi.fn()
    const onEdit = vi.fn()
    render(
      <TaskCard {...defaultProps} onToggleSubtask={onToggleSubtask} onEdit={onEdit} />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1])

    expect(onToggleSubtask).toHaveBeenCalledWith('task-1', 'sub-2')
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('exibe as 4 primeiras subtarefas e permite expandir/colapsar quando houver mais de 4', () => {
    const taskWithManySubtasks: Task = {
      ...sampleTask,
      subtasks: [
        { id: 'sub-1', title: 'Subtarefa 1', completed: true },
        { id: 'sub-2', title: 'Subtarefa 2', completed: false },
        { id: 'sub-3', title: 'Subtarefa 3', completed: false },
        { id: 'sub-4', title: 'Subtarefa 4', completed: false },
        { id: 'sub-5', title: 'Subtarefa 5', completed: false },
        { id: 'sub-6', title: 'Subtarefa 6', completed: false },
      ],
    }

    render(<TaskCard {...defaultProps} task={taskWithManySubtasks} />)

    expect(screen.getByText('Subtarefa 1')).toBeInTheDocument()
    expect(screen.getByText('Subtarefa 2')).toBeInTheDocument()
    expect(screen.getByText('Subtarefa 3')).toBeInTheDocument()
    expect(screen.getByText('Subtarefa 4')).toBeInTheDocument()
    expect(screen.queryByText('Subtarefa 5')).not.toBeInTheDocument()
    expect(screen.queryByText('Subtarefa 6')).not.toBeInTheDocument()

    const expandBtn = screen.getByRole('button', { name: /ver mais 2 subtarefas/i })
    expect(expandBtn).toBeInTheDocument()

    fireEvent.click(expandBtn)
    expect(screen.getByText('Subtarefa 5')).toBeInTheDocument()
    expect(screen.getByText('Subtarefa 6')).toBeInTheDocument()

    const collapseBtn = screen.getByRole('button', { name: /ver menos/i })
    expect(collapseBtn).toBeInTheDocument()

    fireEvent.click(collapseBtn)
    expect(screen.queryByText('Subtarefa 5')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /ver mais 2 subtarefas/i })
    ).toBeInTheDocument()
  })

  it('abre menu e dispara onDelete ao selecionar excluir', () => {
    const onDelete = vi.fn()
    render(<TaskCard {...defaultProps} onDelete={onDelete} />)

    const moreBtn = screen.getByTitle('Mais opções')
    fireEvent.click(moreBtn)

    const deleteBtn = screen.getByText('Excluir')
    fireEvent.click(deleteBtn)

    expect(onDelete).toHaveBeenCalledWith('task-1')
  })

  it('fecha o menu de 3 pontinhos ao clicar fora ou pressionar Escape', () => {
    render(<TaskCard {...defaultProps} />)

    const moreBtn = screen.getByTitle('Mais opções')
    fireEvent.click(moreBtn)
    expect(screen.getByText('Editar')).toBeInTheDocument()

    // Pressionar tecla Escape deve fechar o menu
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('Editar')).not.toBeInTheDocument()

    // Reabrir o menu
    fireEvent.click(moreBtn)
    expect(screen.getByText('Editar')).toBeInTheDocument()

    // Clicar fora (no document body) deve fechar o menu
    fireEvent.mouseDown(document.body)
    expect(screen.queryByText('Editar')).not.toBeInTheDocument()
  })

  it('exibe badge discreto de tempo rastreado acumulado e com cronômetro ativo', () => {
    const taskWithTimer: Task = {
      ...sampleTask,
      timeTracked: {
        inProgressSeconds: 120, // 2 minutos acumulados
        inReviewSeconds: 0,
        currentTimerStartedAt: new Date(Date.now() - 30000).toISOString(), // 30s correndo
        currentTimerColumnId: 'col-progress',
      },
    }

    const { rerender } = render(<TaskCard {...defaultProps} task={taskWithTimer} />)

    const timerBadge = screen.getByTestId('task-timer-badge')
    expect(timerBadge).toBeInTheDocument()
    expect(timerBadge).toHaveAttribute('title', 'Cronômetro ativo')

    // Quando o cronômetro para mas tem tempo acumulado
    const taskStoppedTimer: Task = {
      ...sampleTask,
      timeTracked: {
        inProgressSeconds: 150,
        inReviewSeconds: 0,
        currentTimerStartedAt: null,
        currentTimerColumnId: null,
      },
    }

    rerender(<TaskCard {...defaultProps} task={taskStoppedTimer} />)
    const stoppedTimerBadge = screen.getByTestId('task-timer-badge')
    expect(stoppedTimerBadge).toBeInTheDocument()
    expect(stoppedTimerBadge).toHaveAttribute('title', 'Tempo acumulado')
    expect(stoppedTimerBadge.textContent).toContain('2m 30s')
  })
})
