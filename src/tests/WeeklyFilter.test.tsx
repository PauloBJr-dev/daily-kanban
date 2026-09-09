import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent, within } from '@testing-library/react'

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))
import {
  useKanban,
  getISOWeekRange,
  isTaskInDateRange,
  parseTaskDate,
} from '../hooks/useKanban'
import { FilterBar } from '../components/FilterBar'
import { storageService } from '../services/storageService'
import type { FilterState, KanbanData, Task } from '../types/kanban'

describe('Weekly Smart Filter (Filtro Semanal Inteligente)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('Cálculo de Intervalos ISO da Semana (getISOWeekRange)', () => {
    it('calcula o intervalo Segunda a Domingo para uma data no meio da semana', () => {
      // 2026-09-08 é uma Terça-feira
      const baseDate = new Date(2026, 8, 8, 14, 30, 0)
      const { start, end } = getISOWeekRange('this_week', baseDate)

      // Segunda-feira deve ser 2026-09-07 às 00:00:00
      expect(start.getFullYear()).toBe(2026)
      expect(start.getMonth()).toBe(8) // Setembro (0-indexado)
      expect(start.getDate()).toBe(7)
      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)

      // Domingo deve ser 2026-09-13 às 23:59:59
      expect(end.getFullYear()).toBe(2026)
      expect(end.getMonth()).toBe(8)
      expect(end.getDate()).toBe(13)
      expect(end.getHours()).toBe(23)
      expect(end.getMinutes()).toBe(59)
    })

    it('calcula o intervalo Segunda a Domingo quando a data base for Domingo', () => {
      // 2026-09-13 é Domingo
      const baseDate = new Date(2026, 8, 13, 20, 0, 0)
      const { start, end } = getISOWeekRange('this_week', baseDate)

      expect(start.getDate()).toBe(7) // Segunda anterior
      expect(end.getDate()).toBe(13) // Domingo corrente
    })

    it('calcula o intervalo de semana passada corretamente', () => {
      // 2026-09-08 é Terça-feira
      const baseDate = new Date(2026, 8, 8, 12, 0, 0)
      const { start, end } = getISOWeekRange('last_week', baseDate)

      // Semana passada: Segunda 2026-08-31 a Domingo 2026-09-06
      expect(start.getFullYear()).toBe(2026)
      expect(start.getMonth()).toBe(7) // Agosto
      expect(start.getDate()).toBe(31)

      expect(end.getFullYear()).toBe(2026)
      expect(end.getMonth()).toBe(8) // Setembro
      expect(end.getDate()).toBe(6)
    })
  })

  describe('Validação de Data da Tarefa (isTaskInDateRange / parseTaskDate)', () => {
    it('reconhece datas no formato ISO e formato YYYY-MM-DD', () => {
      const parsedISO = parseTaskDate('2026-09-08T10:00:00.000Z')
      expect(parsedISO).not.toBeNull()

      const parsedDateOnly = parseTaskDate('2026-09-08')
      expect(parsedDateOnly).not.toBeNull()
      expect(parsedDateOnly?.getDate()).toBe(8)
    })

    it('retorna true quando task.completedAt está dentro do intervalo', () => {
      const start = new Date(2026, 8, 7, 0, 0, 0)
      const end = new Date(2026, 8, 13, 23, 59, 59)

      const task: Task = {
        id: 'task-test-1',
        title: 'Tarefa Teste',
        columnId: 'col-done',
        priority: 'medium',
        tags: [],
        subtasks: [],
        completedAt: new Date(2026, 8, 9, 15, 0, 0).toISOString(),
        createdAt: new Date(2026, 8, 1).toISOString(),
        updatedAt: new Date(2026, 8, 9).toISOString(),
      }

      expect(isTaskInDateRange(task, start, end)).toBe(true)
    })

    it('utiliza updatedAt e createdAt como fallback se completedAt não estiver definido', () => {
      const start = new Date(2026, 8, 7, 0, 0, 0)
      const end = new Date(2026, 8, 13, 23, 59, 59)

      const taskWithoutCompletedAt: Task = {
        id: 'task-test-fallback',
        title: 'Fallback Test',
        columnId: 'col-done',
        priority: 'high',
        tags: [],
        subtasks: [],
        updatedAt: new Date(2026, 8, 10, 11, 0, 0).toISOString(),
        createdAt: new Date(2026, 7, 10).toISOString(),
      }

      expect(isTaskInDateRange(taskWithoutCompletedAt, start, end)).toBe(true)
    })

    it('retorna false quando a conclusão ocorreu fora do intervalo', () => {
      const start = new Date(2026, 8, 7, 0, 0, 0)
      const end = new Date(2026, 8, 13, 23, 59, 59)

      const oldTask: Task = {
        id: 'task-old',
        title: 'Antiga',
        columnId: 'col-done',
        priority: 'low',
        tags: [],
        subtasks: [],
        completedAt: new Date(2026, 7, 15).toISOString(),
        createdAt: new Date(2026, 7, 10).toISOString(),
        updatedAt: new Date(2026, 7, 15).toISOString(),
      }

      expect(isTaskInDateRange(oldTask, start, end)).toBe(false)
    })
  })

  describe('Comportamento do Hook useKanban com Filtro Semanal', () => {
    const mockThisWeekDate = new Date()
    const thisWeekISO = mockThisWeekDate.toISOString()

    // Data de 8 dias atrás (Semana Passada)
    const mockLastWeekDate = new Date(mockThisWeekDate)
    mockLastWeekDate.setDate(mockThisWeekDate.getDate() - 7)
    const lastWeekISO = mockLastWeekDate.toISOString()

    // Data de 3 semanas atrás (Antiga)
    const mockOldDate = new Date(mockThisWeekDate)
    mockOldDate.setDate(mockThisWeekDate.getDate() - 21)
    const oldISO = mockOldDate.toISOString()

    const mockKanbanData: KanbanData = {
      columns: [
        { id: 'col-todo', title: 'A Fazer', order: 0, colorTheme: 'blue' },
        { id: 'col-progress', title: 'Em Progresso', order: 1, colorTheme: 'amber' },
        { id: 'col-done', title: 'Concluído', order: 2, colorTheme: 'emerald' },
      ],
      tasks: [
        {
          id: 'task-todo-old',
          title: 'Tarefa Pendente Antiga',
          columnId: 'col-todo',
          priority: 'urgent',
          tags: ['Trabalho'],
          subtasks: [],
          createdAt: oldISO,
          updatedAt: oldISO,
        },
        {
          id: 'task-progress-last-week',
          title: 'Tarefa Em Progresso da Semana Passada',
          columnId: 'col-progress',
          priority: 'high',
          tags: ['Estudos'],
          subtasks: [],
          createdAt: lastWeekISO,
          updatedAt: lastWeekISO,
        },
        {
          id: 'task-done-this-week',
          title: 'Tarefa Concluída Esta Semana',
          columnId: 'col-done',
          priority: 'medium',
          tags: ['Rotina'],
          subtasks: [],
          completedAt: thisWeekISO,
          createdAt: thisWeekISO,
          updatedAt: thisWeekISO,
        },
        {
          id: 'task-done-last-week',
          title: 'Tarefa Concluída Semana Passada',
          columnId: 'col-done',
          priority: 'low',
          tags: ['Saúde'],
          subtasks: [],
          completedAt: lastWeekISO,
          createdAt: lastWeekISO,
          updatedAt: lastWeekISO,
        },
        {
          id: 'task-done-ancient',
          title: 'Tarefa Concluída Muito Antiga',
          columnId: 'col-done',
          priority: 'low',
          tags: ['Arquivo'],
          subtasks: [],
          completedAt: oldISO,
          createdAt: oldISO,
          updatedAt: oldISO,
        },
      ],
      version: 1,
    }

    beforeEach(() => {
      vi.spyOn(storageService, 'load').mockReturnValue(mockKanbanData)
    })

    it('inicia com weekScope: "this_week" por padrão', () => {
      const { result } = renderHook(() => useKanban())
      expect(result.current.filters.weekScope).toBe('this_week')
    })

    it('regra crucial: tarefas pendentes em "col-todo" e "col-progress" permanecem sempre visíveis e transitam para a próxima semana', () => {
      const { result } = renderHook(() => useKanban())

      // 'this_week'
      const taskIds = result.current.tasks.map((t) => t.id)
      expect(taskIds).toContain('task-todo-old')
      expect(taskIds).toContain('task-progress-last-week')

      // Troca para 'last_week'
      act(() => {
        result.current.setFilters((prev) => ({ ...prev, weekScope: 'last_week' }))
      })
      const taskIdsLastWeek = result.current.tasks.map((t) => t.id)
      expect(taskIdsLastWeek).toContain('task-todo-old')
      expect(taskIdsLastWeek).toContain('task-progress-last-week')

      // Troca para 'all'
      act(() => {
        result.current.setFilters((prev) => ({ ...prev, weekScope: 'all' }))
      })
      const taskIdsAll = result.current.tasks.map((t) => t.id)
      expect(taskIdsAll).toContain('task-todo-old')
      expect(taskIdsAll).toContain('task-progress-last-week')
    })

    it('com weekScope="this_week", filtra apenas as tarefas concluídas da semana corrente', () => {
      const { result } = renderHook(() => useKanban())

      const doneTasks = result.current.tasks.filter((t) => t.columnId === 'col-done')
      const doneIds = doneTasks.map((t) => t.id)

      expect(doneIds).toContain('task-done-this-week')
      expect(doneIds).not.toContain('task-done-last-week')
      expect(doneIds).not.toContain('task-done-ancient')
    })

    it('com weekScope="last_week", exibe apenas as concluídas da semana passada', () => {
      const { result } = renderHook(() => useKanban())

      act(() => {
        result.current.setFilters((prev) => ({ ...prev, weekScope: 'last_week' }))
      })

      const doneTasks = result.current.tasks.filter((t) => t.columnId === 'col-done')
      const doneIds = doneTasks.map((t) => t.id)

      expect(doneIds).toContain('task-done-last-week')
      expect(doneIds).not.toContain('task-done-this-week')
      expect(doneIds).not.toContain('task-done-ancient')
    })

    it('com weekScope="all", exibe todo o histórico de concluídas', () => {
      const { result } = renderHook(() => useKanban())

      act(() => {
        result.current.setFilters((prev) => ({ ...prev, weekScope: 'all' }))
      })

      const doneTasks = result.current.tasks.filter((t) => t.columnId === 'col-done')
      const doneIds = doneTasks.map((t) => t.id)

      expect(doneIds).toContain('task-done-this-week')
      expect(doneIds).toContain('task-done-last-week')
      expect(doneIds).toContain('task-done-ancient')
      expect(doneTasks.length).toBe(3)
    })

    it('ao mover tarefa para col-done, define completedAt e exibe na semana atual', () => {
      const { result } = renderHook(() => useKanban())

      act(() => {
        result.current.moveTask('task-todo-old', 'col-done')
      })

      const moved = result.current.tasks.find((t) => t.id === 'task-todo-old')
      expect(moved).toBeDefined()
      expect(moved?.columnId).toBe('col-done')
      expect(moved?.completedAt).toBeDefined()

      // Continua visível pois foi concluída nesta semana
      expect(result.current.tasks.map((t) => t.id)).toContain('task-todo-old')
    })

    it('calcula métrica weekCompletedCount corretamente em stats', () => {
      const { result } = renderHook(() => useKanban())
      expect(result.current.stats.weekCompletedCount).toBe(1)
    })
  })

  describe('Componente FilterBar - Interface Zen e Controles Semanais', () => {
    const defaultFilters: FilterState = {
      searchQuery: '',
      priority: 'all',
      tag: null,
      scope: 'all',
      weekScope: 'this_week',
    }

    it('renderiza os botões de filtro semanal (Esta Semana, Semana Passada, Todas)', () => {
      const onFilterChange = vi.fn()
      render(
        <FilterBar
          filters={defaultFilters}
          onFilterChange={onFilterChange}
          totalFiltered={5}
          allTasksCount={5}
        />
      )

      const weeklyGroup = screen.getByLabelText('Filtro semanal do Kanban')
      expect(weeklyGroup).toBeInTheDocument()
      expect(within(weeklyGroup).getByText('Esta Semana')).toBeInTheDocument()
      expect(within(weeklyGroup).getByText('Semana Passada')).toBeInTheDocument()
      expect(within(weeklyGroup).getByText('Todas')).toBeInTheDocument()
    })

    it('chama onFilterChange com weekScope ao clicar nos botões semanais', () => {
      const onFilterChange = vi.fn()
      render(
        <FilterBar
          filters={defaultFilters}
          onFilterChange={onFilterChange}
          totalFiltered={5}
          allTasksCount={5}
        />
      )

      const lastWeekBtn = screen.getByRole('button', {
        name: /Filtrar por Semana Passada/i,
      })
      fireEvent.click(lastWeekBtn)
      expect(onFilterChange).toHaveBeenCalledWith({ weekScope: 'last_week' })

      const allBtn = screen.getByRole('button', {
        name: /Filtrar por Todas/i,
      })
      fireEvent.click(allBtn)
      expect(onFilterChange).toHaveBeenCalledWith({ weekScope: 'all' })
    })

    it('removeu completamente o seletor de tags e não renderiza tags no FilterBar', () => {
      const onFilterChange = vi.fn()
      render(
        <FilterBar
          filters={defaultFilters}
          onFilterChange={onFilterChange}
          allTags={['Urgente', 'Trabalho', 'Estudos']}
          totalFiltered={5}
          allTasksCount={5}
        />
      )

      // Não deve existir select de tags nem texto "Todas Etiquetas"
      expect(screen.queryByLabelText(/Filtrar por etiqueta/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Todas Etiquetas/i)).not.toBeInTheDocument()
    })

    it('input de busca exibe placeholder "Buscar tarefas..." sem menção a tags', () => {
      const onFilterChange = vi.fn()
      render(
        <FilterBar
          filters={defaultFilters}
          onFilterChange={onFilterChange}
          totalFiltered={5}
          allTasksCount={5}
        />
      )

      const input = screen.getByPlaceholderText('Buscar tarefas...')
      expect(input).toBeInTheDocument()
      expect(screen.queryByPlaceholderText(/tags/i)).not.toBeInTheDocument()
    })

    it('botão limpar filtros restaura weekScope para "this_week"', () => {
      const onFilterChange = vi.fn()
      render(
        <FilterBar
          filters={{
            ...defaultFilters,
            weekScope: 'last_week',
          }}
          onFilterChange={onFilterChange}
          totalFiltered={3}
          allTasksCount={5}
        />
      )

      const clearBtn = screen.getByRole('button', { name: /Limpar todos os filtros/i })
      fireEvent.click(clearBtn)

      expect(onFilterChange).toHaveBeenCalledWith({
        searchQuery: '',
        priority: 'all',
        tag: null,
        scope: 'all',
        weekScope: 'this_week',
      })
    })
  })
})
