import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Board } from '../components/Board'
import { TaskCard } from '../components/TaskCard'
import { StudioSidebar } from '../components/academic/studio/StudioSidebar'
import type { Column, Task } from '../types/kanban'
import type { AcademicNote, Subject } from '../types/academic'

describe('Mobile Experience & Touch UX', () => {
  const mockColumns: Column[] = [
    { id: 'col-todo', title: 'A Fazer', order: 0, colorTheme: 'blue' },
    { id: 'col-doing', title: 'Em Progresso', order: 1, colorTheme: 'amber' },
    { id: 'col-done', title: 'Concluído', order: 2, colorTheme: 'emerald' },
  ]

  const mockTasks: Task[] = [
    {
      id: 't-1',
      title: 'Tarefa Mobile 1',
      columnId: 'col-todo',
      priority: 'high',
      tags: ['mobile'],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 't-2',
      title: 'Tarefa Mobile 2',
      columnId: 'col-doing',
      priority: 'medium',
      tags: ['touch'],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  it('renderiza os botões de navegação rápida de coluna no topo do Board para mobile', () => {
    const scrollIntoViewMock = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

    render(
      <Board
        columns={mockColumns}
        tasks={mockTasks}
        onNewTaskInColumn={vi.fn()}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onMoveTask={vi.fn()}
        onToggleSubtask={vi.fn()}
        onStartFocus={vi.fn()}
        onAddColumn={vi.fn()}
      />
    )

    const todoNavBtn = screen.getByRole('button', { name: /ir para coluna a fazer/i })
    expect(todoNavBtn).toBeInTheDocument()

    fireEvent.click(todoNavBtn)
    expect(scrollIntoViewMock).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' })
    )
  })

  it('renderiza os botões rápidos de mover tarefa por toque no TaskCard e aciona onMove', () => {
    const onMove = vi.fn()

    render(
      <TaskCard
        task={mockTasks[0]}
        columns={mockColumns}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMove={onMove}
        onToggleSubtask={vi.fn()}
        onStartFocus={vi.fn()}
      />
    )

    const moveNextBtn = screen.getByRole('button', { name: /mover para em progresso/i })
    expect(moveNextBtn).toBeInTheDocument()

    fireEvent.click(moveNextBtn)
    expect(onMove).toHaveBeenCalledWith('t-1', 'col-doing')
  })

  it('permite mover tarefa para a coluna anterior através do botão touch no TaskCard', () => {
    const onMove = vi.fn()

    render(
      <TaskCard
        task={mockTasks[1]}
        columns={mockColumns}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMove={onMove}
        onToggleSubtask={vi.fn()}
        onStartFocus={vi.fn()}
      />
    )

    const movePrevBtn = screen.getByRole('button', { name: /mover para a fazer/i })
    expect(movePrevBtn).toBeInTheDocument()

    fireEvent.click(movePrevBtn)
    expect(onMove).toHaveBeenCalledWith('t-2', 'col-todo')
  })

  it('renderiza a barra lateral do Studio com backdrop móvel e fecha ao tocar no backdrop ou em uma nota', () => {
    const onToggle = vi.fn()
    const onSelectNote = vi.fn()

    const mockSubjects: Subject[] = [
      { id: 'sub-1', name: 'Arquitetura', color: 'indigo' },
    ]
    const mockNotes: AcademicNote[] = [
      {
        id: 'note-1',
        title: 'Anotação Mobile',
        content: 'Conteúdo',
        subjectId: 'sub-1',
        status: 'in_progress',
        tags: ['mobile'],
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    window.innerWidth = 390

    const { container } = render(
      <StudioSidebar
        notes={mockNotes}
        subjects={mockSubjects}
        selectedNoteId="note-1"
        onSelectNote={onSelectNote}
        onNewNote={vi.fn()}
        isOpen={true}
        onToggle={onToggle}
        searchQuery=""
        onSearchChange={vi.fn()}
        selectedSubjectId="all"
        onSelectSubject={vi.fn()}
      />
    )

    const backdrop = container.querySelector('.bg-slate-950\\/50')
    expect(backdrop).toBeInTheDocument()

    if (backdrop) {
      fireEvent.click(backdrop)
      expect(onToggle).toHaveBeenCalledTimes(1)
    }

    const noteBtn = screen.getByRole('button', {
      name: /selecionar anotação: anotação mobile/i,
    })
    fireEvent.click(noteBtn)
    expect(onSelectNote).toHaveBeenCalledWith('note-1')
    expect(onToggle).toHaveBeenCalledTimes(2)
  })
})
