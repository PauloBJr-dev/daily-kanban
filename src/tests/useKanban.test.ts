import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

import { useKanban } from '../hooks/useKanban'
import { storageService } from '../services/storageService'
import { INITIAL_DATA } from '../services/seedData'
import { supabaseKanbanService } from '../services/supabaseKanbanService'
import { AuthContext, type AuthContextType } from '../context/AuthContext'
import type { User } from '@supabase/supabase-js'
import type { Task } from '../types/kanban'

const mockAuthUser: User = {
  id: 'user-kanban-test',
  app_metadata: {},
  user_metadata: { full_name: 'Kanban Tester' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'tester@example.com',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
}

const mockAuthContextValue: AuthContextType = {
  user: mockAuthUser,
  session: null,
  loading: false,
  isConfigured: true,
  isGuestAcknowledged: true,
  isAuthModalOpen: false,
  openAuthModal: vi.fn(),
  closeAuthModal: vi.fn(),
  signInWithGoogle: vi.fn(),
  signUpWithPassword: vi.fn(),
  signInWithPassword: vi.fn(),
  continueAsGuest: vi.fn(),
  signOut: vi.fn(),
}

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  React.createElement(AuthContext.Provider, { value: mockAuthContextValue }, children)

describe('useKanban', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('Modo Visitante (Offline / Sem Usuário)', () => {
    it('inicializa com os dados padrão do storageService e calcula estatísticas', () => {
      const { result } = renderHook(() => useKanban())

      expect(result.current.columns.length).toBe(INITIAL_DATA.columns.length)
      expect(result.current.allTasksCount).toBe(INITIAL_DATA.tasks.length)
      expect(result.current.tasks.length).toBe(INITIAL_DATA.tasks.length)
      expect(result.current.stats.total).toBe(INITIAL_DATA.tasks.length)
      expect(result.current.allTags).toBeDefined()
    })

    it('permite adicionar uma nova tarefa com estado otimista e persiste no storage', () => {
      const saveSpy = vi.spyOn(storageService, 'save')
      const { result } = renderHook(() => useKanban())

      act(() => {
        result.current.addTask({
          title: 'Nova Tarefa Local',
          columnId: 'col-todo',
          priority: 'high',
          tags: ['Teste'],
          subtasks: [],
        })
      })

      expect(result.current.allTasksCount).toBe(INITIAL_DATA.tasks.length + 1)
      expect(result.current.tasks.some((t) => t.title === 'Nova Tarefa Local')).toBe(true)
      expect(saveSpy).toHaveBeenCalled()
    })

    it('permite atualizar e deletar uma tarefa', () => {
      const { result } = renderHook(() => useKanban())

      let target: Task
      act(() => {
        target = result.current.addTask({
          title: 'Tarefa Inicial',
          columnId: 'col-todo',
          priority: 'medium',
          tags: [],
          subtasks: [],
        })
      })

      act(() => {
        result.current.updateTask(target.id, {
          title: 'Título Atualizado Localmente',
          priority: 'urgent',
        })
      })

      const updated = result.current.tasks.find((t) => t.id === target.id)
      expect(updated?.title).toBe('Título Atualizado Localmente')
      expect(updated?.priority).toBe('urgent')

      act(() => {
        result.current.deleteTask(target.id)
      })

      expect(result.current.tasks.some((t) => t.id === target.id)).toBe(false)
    })

    it('permite restaurar uma tarefa deletada', () => {
      const { result } = renderHook(() => useKanban())

      let target: Task
      act(() => {
        target = result.current.addTask({
          title: 'Tarefa Deletar e Restaurar',
          columnId: 'col-todo',
          priority: 'medium',
          tags: [],
          subtasks: [],
        })
      })

      act(() => {
        result.current.deleteTask(target.id)
      })
      expect(result.current.tasks.some((t) => t.id === target.id)).toBe(false)

      act(() => {
        result.current.restoreTask(target)
      })
      expect(result.current.tasks.some((t) => t.id === target.id)).toBe(true)
    })

    it('permite alternar subtask com toggleSubtask', () => {
      const { result } = renderHook(() => useKanban())

      let createdTask: Task
      act(() => {
        createdTask = result.current.addTask({
          title: 'Tarefa com Subtarefa',
          columnId: 'col-todo',
          priority: 'medium',
          tags: [],
          subtasks: [{ id: 'sub-test-1', title: 'Sub 1', completed: false }],
        })
      })

      const targetSubtask = createdTask!.subtasks[0]
      const initialStatus = targetSubtask.completed

      act(() => {
        result.current.toggleSubtask(createdTask!.id, targetSubtask.id)
      })

      const updatedTask = result.current.tasks.find((t) => t.id === createdTask!.id)!
      const updatedSubtask = updatedTask.subtasks.find((s) => s.id === targetSubtask.id)!
      expect(updatedSubtask.completed).toBe(!initialStatus)
    })

    it('adiciona e remove subtasks dinamicamente', () => {
      const { result } = renderHook(() => useKanban())

      let task: Task
      act(() => {
        task = result.current.addTask({
          title: 'Tarefa com Subtarefas Dinâmicas',
          columnId: 'col-todo',
          priority: 'medium',
          tags: [],
          subtasks: [],
        })
      })

      act(() => {
        result.current.addSubtask(task.id, 'Subtarefa Teste Manual')
      })

      const withSub = result.current.tasks.find((t) => t.id === task.id)!
      const added = withSub.subtasks.find((s) => s.title === 'Subtarefa Teste Manual')
      expect(added).toBeDefined()

      act(() => {
        result.current.removeSubtask(task.id, added!.id)
      })

      const withoutSub = result.current.tasks.find((t) => t.id === task.id)!
      expect(withoutSub.subtasks.some((s) => s.id === added!.id)).toBe(false)
    })

    it('adiciona e remove colunas preservando limites mínimos', () => {
      const { result } = renderHook(() => useKanban())
      const initialCount = result.current.columns.length

      act(() => {
        result.current.addColumn('Coluna Custom', 'purple')
      })

      expect(result.current.columns.length).toBe(initialCount + 1)
      const addedCol = result.current.columns.find((c) => c.title === 'Coluna Custom')!
      expect(addedCol).toBeDefined()

      act(() => {
        result.current.deleteColumn(addedCol.id)
      })

      expect(result.current.columns.length).toBe(initialCount)
    })

    it('exporta e importa dados via JSON com sucesso', () => {
      const { result } = renderHook(() => useKanban())
      const exported = result.current.exportData()
      expect(typeof exported).toBe('string')

      const customPayload = JSON.stringify({
        columns: [{ id: 'col-custom', title: 'Custom', order: 0, colorTheme: 'rose' }],
        tasks: [
          {
            id: 'task-custom',
            title: 'Importada',
            columnId: 'col-custom',
            priority: 'low',
            tags: [],
            subtasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        version: 1,
      })

      act(() => {
        const success = result.current.importData(customPayload)
        expect(success).toBe(true)
      })

      expect(result.current.columns[0].title).toBe('Custom')
      expect(result.current.tasks[0].title).toBe('Importada')

      act(() => {
        const invalidSuccess = result.current.importData('invalid json')
        expect(invalidSuccess).toBe(false)
      })
    })

    it('permite restaurar dados para seed inicial', () => {
      const { result } = renderHook(() => useKanban())

      let task: Task
      act(() => {
        task = result.current.addTask({
          title: 'Tarefa Temporária',
          columnId: 'col-todo',
          priority: 'low',
          tags: [],
          subtasks: [],
        })
      })
      expect(result.current.allTasksCount).toBe(1)

      act(() => {
        result.current.deleteTask(task.id)
      })

      act(() => {
        result.current.resetToSeed()
      })

      expect(result.current.allTasksCount).toBe(INITIAL_DATA.tasks.length)
    })
  })

  describe('Colunas Permanentes, Reordenação e Cronômetro Automático', () => {
    it('impede a exclusão de colunas permanentes padrão', () => {
      const { result } = renderHook(() => useKanban())
      const initialColCount = result.current.columns.length

      // Tentativa de deletar coluna padrão 'col-todo'
      act(() => {
        result.current.deleteColumn('col-todo')
      })
      expect(result.current.columns.length).toBe(initialColCount)
      expect(result.current.columns.some((c) => c.id === 'col-todo')).toBe(true)

      // Tentativa de deletar coluna padrão 'col-done'
      act(() => {
        result.current.deleteColumn('col-done')
      })
      expect(result.current.columns.length).toBe(initialColCount)
      expect(result.current.columns.some((c) => c.id === 'col-done')).toBe(true)
    })

    it('permite atualizar título e tema de cor de uma coluna com updateColumn', () => {
      const { result } = renderHook(() => useKanban())

      act(() => {
        result.current.updateColumn('col-todo', {
          title: 'Backlog Prioritário',
          colorTheme: 'rose',
        })
      })

      const updated = result.current.columns.find((c) => c.id === 'col-todo')
      expect(updated?.title).toBe('Backlog Prioritário')
      expect(updated?.colorTheme).toBe('rose')
    })

    it('reordena colunas com reorderColumns atribuindo índices de order sequenciais', () => {
      const { result } = renderHook(() => useKanban())
      const cols = [...result.current.columns]
      const reversed = [...cols].reverse()

      act(() => {
        result.current.reorderColumns(reversed)
      })

      expect(result.current.columns[0].id).toBe(reversed[0].id)
      expect(result.current.columns[0].order).toBe(0)
      expect(result.current.columns[result.current.columns.length - 1].order).toBe(
        reversed.length - 1
      )
    })

    it('move coluna para esquerda e direita com moveColumn respeitando limites', () => {
      const { result } = renderHook(() => useKanban())
      const firstColId = result.current.columns[0].id
      const secondColId = result.current.columns[1].id

      // Mover a primeira coluna para a esquerda não deve alterar nada (limite esquerdo)
      act(() => {
        result.current.moveColumn(firstColId, 'left')
      })
      expect(result.current.columns[0].id).toBe(firstColId)

      // Mover a primeira coluna para a direita
      act(() => {
        result.current.moveColumn(firstColId, 'right')
      })
      expect(result.current.columns[0].id).toBe(secondColId)
      expect(result.current.columns[1].id).toBe(firstColId)

      // Mover de volta para a esquerda
      act(() => {
        result.current.moveColumn(firstColId, 'left')
      })
      expect(result.current.columns[0].id).toBe(firstColId)
      expect(result.current.columns[1].id).toBe(secondColId)
    })

    it('gerencia cronômetro de tempo automaticamente ao mover tarefas entre colunas', () => {
      const { result } = renderHook(() => useKanban())

      // Adiciona uma tarefa em 'col-todo'
      let createdTask: Task
      act(() => {
        createdTask = result.current.addTask({
          title: 'Tarefa Cronometrada',
          columnId: 'col-todo',
          priority: 'medium',
          tags: [],
          subtasks: [],
        })
      })

      expect(createdTask!.timeTracked?.currentTimerStartedAt).toBeNull()

      // Mover para 'col-progress' (Em progresso) -> deve iniciar o cronômetro
      act(() => {
        result.current.moveTask(createdTask!.id, 'col-progress')
      })

      const inProgressTask = result.current.tasks.find((t) => t.id === createdTask!.id)!
      expect(inProgressTask.timeTracked?.currentTimerStartedAt).toBeTruthy()
      expect(inProgressTask.timeTracked?.currentTimerColumnId).toBe('col-progress')

      // Mover para 'col-done' -> deve acumular o tempo e parar o cronômetro
      act(() => {
        result.current.moveTask(createdTask!.id, 'col-done')
      })

      const doneTask = result.current.tasks.find((t) => t.id === createdTask!.id)!
      expect(doneTask.timeTracked?.currentTimerStartedAt).toBeNull()
      expect(doneTask.timeTracked?.currentTimerColumnId).toBeNull()
      expect(typeof doneTask.timeTracked?.inProgressSeconds).toBe('number')
    })
  })

  describe('Sincronização com Supabase (Usuário Conectado)', () => {
    it('carrega dados da nuvem quando logado com fetchKanbanData', async () => {
      const cloudData = {
        columns: [
          { id: 'col-cloud', title: 'Nuvem', order: 0, colorTheme: 'blue' as const },
        ],
        tasks: [
          {
            id: 'task-cloud',
            title: 'Tarefa Nuvem',
            columnId: 'col-cloud',
            priority: 'high' as const,
            tags: ['Cloud'],
            subtasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }
      vi.spyOn(supabaseKanbanService, 'fetchKanbanData').mockResolvedValueOnce(cloudData)

      const { result } = renderHook(() => useKanban(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(result.current.columns[0].id).toBe('col-cloud')
        expect(result.current.tasks[0].id).toBe('task-cloud')
      })
    })

    it('dispara syncTask em background ao adicionar ou editar tarefa', async () => {
      vi.spyOn(supabaseKanbanService, 'fetchKanbanData').mockResolvedValueOnce({
        columns: INITIAL_DATA.columns,
        tasks: INITIAL_DATA.tasks,
      })
      const syncTaskSpy = vi.spyOn(supabaseKanbanService, 'syncTask').mockResolvedValue()

      const { result } = renderHook(() => useKanban(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(result.current.allTasksCount).toBe(INITIAL_DATA.tasks.length)
      })

      let added: Task
      act(() => {
        added = result.current.addTask({
          title: 'Tarefa Nuvem Sync',
          columnId: 'col-todo',
          priority: 'medium',
          tags: [],
          subtasks: [],
        })
      })

      expect(syncTaskSpy).toHaveBeenCalledWith(
        'user-kanban-test',
        expect.objectContaining({
          title: 'Tarefa Nuvem Sync',
        })
      )

      act(() => {
        result.current.updateTask(added.id, {
          title: 'Tarefa Nuvem Editada',
        })
      })

      expect(syncTaskSpy).toHaveBeenCalledWith(
        'user-kanban-test',
        expect.objectContaining({
          title: 'Tarefa Nuvem Editada',
        })
      )
    })

    it('dispara deleteTask em background de forma otimista ao deletar tarefa', async () => {
      const cloudTask: Task = {
        id: 'task-cloud-123',
        title: 'Tarefa Nuvem',
        columnId: 'col-todo',
        priority: 'high',
        tags: [],
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.spyOn(supabaseKanbanService, 'fetchKanbanData').mockResolvedValueOnce({
        columns: INITIAL_DATA.columns,
        tasks: [cloudTask],
      })
      const deleteTaskSpy = vi
        .spyOn(supabaseKanbanService, 'deleteTask')
        .mockResolvedValue()

      const { result } = renderHook(() => useKanban(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(result.current.allTasksCount).toBe(1)
      })

      const targetId = result.current.tasks[0].id

      act(() => {
        result.current.deleteTask(targetId)
      })

      expect(result.current.tasks.some((t) => t.id === targetId)).toBe(false)
      expect(deleteTaskSpy).toHaveBeenCalledWith(targetId)
    })

    it('dispara syncColumns e deleteColumn em background ao alterar colunas', async () => {
      vi.spyOn(supabaseKanbanService, 'fetchKanbanData').mockResolvedValueOnce({
        columns: INITIAL_DATA.columns,
        tasks: INITIAL_DATA.tasks,
      })
      const syncColumnsSpy = vi
        .spyOn(supabaseKanbanService, 'syncColumns')
        .mockResolvedValue()
      const deleteColumnSpy = vi
        .spyOn(supabaseKanbanService, 'deleteColumn')
        .mockResolvedValue()

      const { result } = renderHook(() => useKanban(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(result.current.columns.length).toBe(INITIAL_DATA.columns.length)
      })

      act(() => {
        result.current.addColumn('Nova Coluna Sync', 'amber')
      })

      expect(result.current.columns.some((c) => c.title === 'Nova Coluna Sync')).toBe(
        true
      )
      expect(syncColumnsSpy).toHaveBeenCalledWith('user-kanban-test', expect.any(Array))

      const addedCol = result.current.columns.find((c) => c.title === 'Nova Coluna Sync')!

      act(() => {
        result.current.deleteColumn(addedCol.id)
      })

      expect(result.current.columns.some((c) => c.id === addedCol.id)).toBe(false)
      expect(deleteColumnSpy).toHaveBeenCalledWith(addedCol.id)
    })
  })
})
