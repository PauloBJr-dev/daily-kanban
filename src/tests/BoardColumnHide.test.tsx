import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { Board } from '../components/Board'
import type { Column, Task } from '../types/kanban'

describe('BoardColumnHide (Opção B - Coluna Colapsada Vertical)', () => {
  const mockColumns: Column[] = [
    { id: 'col-todo', title: 'A Fazer', order: 0, colorTheme: 'blue' },
    { id: 'col-doing', title: 'Em Progresso', order: 1, colorTheme: 'amber' },
    { id: 'col-done', title: 'Concluído', order: 2, colorTheme: 'emerald' },
  ]

  const mockTasks: Task[] = [
    {
      id: 't-1',
      title: 'Tarefa 1',
      columnId: 'col-doing',
      priority: 'high',
      tags: [],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 't-2',
      title: 'Tarefa 2',
      columnId: 'col-doing',
      priority: 'medium',
      tags: [],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const baseProps = {
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
    onMoveColumn: vi.fn(),
    onReorderColumns: vi.fn(),
    onUpdateColumn: vi.fn(),
  }

  it('renderiza o botão de ocultar coluna no cabeçalho com tooltip e aciona onHideColumn', () => {
    const onHideColumn = vi.fn()
    render(<Board {...baseProps} onHideColumn={onHideColumn} />)

    // O botão de ocultar deve existir para as colunas
    const hideDoingBtn = screen.getByRole('button', {
      name: 'Ocultar coluna Em Progresso',
    })
    expect(hideDoingBtn).toBeInTheDocument()
    expect(hideDoingBtn).toHaveAttribute('title', 'Ocultar coluna Em Progresso')

    fireEvent.click(hideDoingBtn)
    expect(onHideColumn).toHaveBeenCalledWith('col-doing')
  })

  it('renderiza a coluna oculta em formato colapsado verticalmente (Opção B) com contador, bolinha e título', () => {
    render(<Board {...baseProps} hiddenColumnIds={['col-doing']} />)

    // A coluna Em Progresso normal não deve ter seu conteúdo completo (como as tarefas) renderizado
    expect(screen.queryByText('Tarefa 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Tarefa 2')).not.toBeInTheDocument()

    // O elemento colapsado vertical deve existir
    const collapsedCol = screen.getByTestId('column-collapsed-col-doing')
    expect(collapsedCol).toBeInTheDocument()
    expect(collapsedCol).toHaveClass('w-12')
    expect(collapsedCol).toHaveClass('min-w-[48px]')

    // Deve exibir o título da coluna
    expect(collapsedCol).toHaveTextContent('Em Progresso')

    // Deve exibir o contador de tarefas (2 tarefas)
    expect(collapsedCol).toHaveTextContent('2')

    // Deve exibir o botão de reexibir com ícone de olho
    const showBtn = screen.getByRole('button', {
      name: 'Reexibir coluna Em Progresso',
    })
    expect(showBtn).toBeInTheDocument()
    expect(showBtn).toHaveAttribute('title', 'Reexibir coluna Em Progresso')
  })

  it('permite reexibir a coluna ao clicar no botão de olho chamando onShowColumn', () => {
    const onShowColumn = vi.fn()
    render(
      <Board {...baseProps} hiddenColumnIds={['col-doing']} onShowColumn={onShowColumn} />
    )

    const showBtn = screen.getByRole('button', {
      name: 'Reexibir coluna Em Progresso',
    })
    fireEvent.click(showBtn)

    expect(onShowColumn).toHaveBeenCalledWith('col-doing')
  })

  it('integra fluxo completo de ocultar e reexibir mantendo sincronia de estado reativo', () => {
    const TestKanbanBoard = () => {
      const [hiddenIds, setHiddenIds] = useState<string[]>([])
      return (
        <Board
          {...baseProps}
          hiddenColumnIds={hiddenIds}
          onHideColumn={(id) => setHiddenIds((prev) => [...prev, id])}
          onShowColumn={(id) =>
            setHiddenIds((prev) => prev.filter((colId) => colId !== id))
          }
        />
      )
    }

    render(<TestKanbanBoard />)

    // Inicialmente visível com suas tarefas
    expect(screen.getByText('Tarefa 1')).toBeInTheDocument()
    expect(screen.queryByTestId('column-collapsed-col-doing')).not.toBeInTheDocument()

    // Clica em ocultar
    const hideBtn = screen.getByRole('button', {
      name: 'Ocultar coluna Em Progresso',
    })
    fireEvent.click(hideBtn)

    // Agora está colapsada
    expect(screen.queryByText('Tarefa 1')).not.toBeInTheDocument()
    const collapsedCol = screen.getByTestId('column-collapsed-col-doing')
    expect(collapsedCol).toBeInTheDocument()

    // Clica em reexibir
    const restoreBtn = screen.getByRole('button', {
      name: 'Reexibir coluna Em Progresso',
    })
    fireEvent.click(restoreBtn)

    // Volta ao normal e tarefas reaparecem
    expect(screen.getByText('Tarefa 1')).toBeInTheDocument()
    expect(screen.queryByTestId('column-collapsed-col-doing')).not.toBeInTheDocument()
  })
})
