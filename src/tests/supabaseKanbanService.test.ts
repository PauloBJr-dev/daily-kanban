import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  fetchKanbanData,
  syncColumns,
  syncTask,
  deleteTask,
  deleteColumn,
  uploadLocalData,
  supabaseKanbanService,
} from '../services/supabaseKanbanService'
import type { Column, Task } from '../types/kanban'

describe('supabaseKanbanService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchKanbanData', () => {
    it('busca e mapeia colunas e tarefas do Supabase com sucesso', async () => {
      const mockColumnsData = [
        {
          id: 'col-1',
          user_id: 'user-abc',
          title: 'A Fazer',
          order: 0,
          color: 'blue',
          created_at: '2026-09-01T00:00:00.000Z',
          updated_at: '2026-09-01T00:00:00.000Z',
        },
      ]

      const mockTasksData = [
        {
          id: 'task-1',
          user_id: 'user-abc',
          column_id: 'col-1',
          title: 'Implementar Testes',
          description: 'Cobrir 100% dos serviços',
          priority: 'high',
          due_date: '2026-09-10',
          subtasks: [{ id: 'sub-1', title: 'Unitário', completed: false }],
          pomodoro_minutes_spent: 25,
          order: 0,
          created_at: '2026-09-01T00:00:00.000Z',
          updated_at: '2026-09-01T00:00:00.000Z',
        },
      ]

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'kanban_columns') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockColumnsData, error: null }),
          } as any
        }
        if (table === 'tasks') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockTasksData, error: null }),
          } as any
        }
        return {} as any
      })

      const result = await fetchKanbanData('user-abc')

      expect(result.columns).toHaveLength(1)
      expect(result.columns[0]).toEqual({
        id: 'col-1',
        title: 'A Fazer',
        order: 0,
        colorTheme: 'blue',
      })

      expect(result.tasks).toHaveLength(1)
      expect(result.tasks[0]).toEqual({
        id: 'task-1',
        title: 'Implementar Testes',
        description: 'Cobrir 100% dos serviços',
        columnId: 'col-1',
        priority: 'high',
        tags: [],
        dueDate: '2026-09-10',
        subtasks: [{ id: 'sub-1', title: 'Unitário', completed: false }],
        completedAt: undefined,
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
        pomodoroMinutesSpent: 25,
      })
    })

    it('lança erro quando busca de colunas falha', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Falha no banco de dados'),
        }),
      } as any)

      await expect(fetchKanbanData('user-abc')).rejects.toThrow('Falha no banco de dados')
    })
  })

  describe('syncColumns', () => {
    it('faz upsert das colunas com formato correto', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null })
      vi.spyOn(supabase, 'from').mockReturnValue({
        upsert: upsertMock,
      } as any)

      const columns: Column[] = [
        { id: 'col-todo', title: 'A Fazer', order: 0, colorTheme: 'blue' },
      ]

      await syncColumns('user-abc', columns)

      expect(upsertMock).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            id: 'col-todo',
            user_id: 'user-abc',
            title: 'A Fazer',
            color: 'blue',
            order: 0,
          }),
        ],
        { onConflict: 'id,user_id' }
      )
    })

    it('não executa upsert quando array de colunas está vazio', async () => {
      const fromSpy = vi.spyOn(supabase, 'from')
      await syncColumns('user-abc', [])
      expect(fromSpy).not.toHaveBeenCalled()
    })

    it('lança erro quando upsert de colunas falha', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: new Error('Erro de RLS') }),
      } as any)

      await expect(
        syncColumns('user-abc', [
          { id: 'col-1', title: 'Teste', order: 0, colorTheme: 'blue' },
        ])
      ).rejects.toThrow('Erro de RLS')
    })
  })

  describe('syncTask', () => {
    it('faz upsert da tarefa no Supabase com sucesso', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null })
      vi.spyOn(supabase, 'from').mockReturnValue({
        upsert: upsertMock,
      } as any)

      const task: Task = {
        id: 'task-123',
        title: 'Estudar TypeScript',
        description: 'Tipagem avançada',
        columnId: 'col-todo',
        priority: 'high',
        tags: [],
        subtasks: [],
        createdAt: '2026-09-08T00:00:00.000Z',
        updatedAt: '2026-09-08T00:00:00.000Z',
      }

      await syncTask('user-abc', task)

      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'task-123',
          user_id: 'user-abc',
          column_id: 'col-todo',
          title: 'Estudar TypeScript',
          priority: 'high',
        }),
        { onConflict: 'id,user_id' }
      )
    })

    it('lança erro quando upsert de tarefa falha', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: new Error('Erro ao salvar tarefa') }),
      } as any)

      const task: Task = {
        id: 'task-123',
        title: 'Erro',
        columnId: 'col-todo',
        priority: 'medium',
        tags: [],
        subtasks: [],
        createdAt: '2026-09-08T00:00:00.000Z',
        updatedAt: '2026-09-08T00:00:00.000Z',
      }

      await expect(syncTask('user-abc', task)).rejects.toThrow('Erro ao salvar tarefa')
    })
  })

  describe('deleteTask & deleteColumn', () => {
    it('deleta tarefa por ID', async () => {
      const eqMock = vi.fn().mockResolvedValue({ error: null })
      vi.spyOn(supabase, 'from').mockReturnValue({
        delete: vi.fn().mockReturnValue({ eq: eqMock }),
      } as any)

      await deleteTask('task-123')
      expect(eqMock).toHaveBeenCalledWith('id', 'task-123')
    })

    it('deleta coluna e suas respectivas tarefas', async () => {
      const deleteMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      vi.spyOn(supabase, 'from').mockReturnValue({
        delete: deleteMock,
      } as any)

      await deleteColumn('col-custom')
      expect(deleteMock).toHaveBeenCalled()
    })
  })

  describe('uploadLocalData', () => {
    it('faz upload de colunas e tarefas locais em lote', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null })
      vi.spyOn(supabase, 'from').mockReturnValue({
        upsert: upsertMock,
      } as any)

      const columns: Column[] = [
        { id: 'col-1', title: 'Backlog', order: 0, colorTheme: 'slate' },
      ]
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Primeira Tarefa',
          columnId: 'col-1',
          priority: 'low',
          tags: [],
          subtasks: [],
          createdAt: '2026-09-01T00:00:00.000Z',
          updatedAt: '2026-09-01T00:00:00.000Z',
        },
      ]

      await uploadLocalData('user-abc', columns, tasks)
      expect(upsertMock).toHaveBeenCalledTimes(2)
    })
  })

  it('exporta objeto supabaseKanbanService com todos os métodos', () => {
    expect(supabaseKanbanService.fetchKanbanData).toBeDefined()
    expect(supabaseKanbanService.syncColumns).toBeDefined()
    expect(supabaseKanbanService.syncTask).toBeDefined()
    expect(supabaseKanbanService.deleteTask).toBeDefined()
    expect(supabaseKanbanService.deleteColumn).toBeDefined()
    expect(supabaseKanbanService.uploadLocalData).toBeDefined()
  })
})
