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
      expect(result.current.tasks.length).toBeGreaterThan(0)
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
      const target = result.current.tasks[0]

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
      const target = result.current.tasks[0]

      act(() => {
        result.current.deleteTask(target.id)
      })
      expect(result.current.tasks.some((t) => t.id === target.id)).toBe(false)

      act(() => {
        result.current.restoreTask(target)
      })
      expect(result.current.tasks.some((t) => t.id === target.id)).toBe(true)
    })

    it('permite mover tarefa de coluna e adiciona completedAt quando for para concluído', () => {
      const { result } = renderHook(() => useKanban())
      const target = result.current.tasks.find((t) => t.columnId !== 'col-done')!

      act(() => {
        result.current.moveTask(target.id, 'col-done')
      })

      const moved = result.current.tasks.find((t) => t.id === target.id)
      expect(moved?.columnId).toBe('col-done')
      expect(moved?.completedAt).toBeDefined()
    })

    it('permite manipular subtarefas (adicionar, alternar e remover)', () => {
      const { result } = renderHook(() => useKanban())
      const target = result.current.tasks[0]

      act(() => {
        result.current.addSubtask(target.id, 'Subtarefa de Teste')
      })

      const withSub = result.current.tasks.find((t) => t.id === target.id)!
      const newSub = withSub.subtasks.find((s) => s.title === 'Subtarefa de Teste')!
      expect(newSub).toBeDefined()
      expect(newSub.completed).toBe(false)

      act(() => {
        result.current.toggleSubtask(target.id, newSub.id)
      })

      const toggled = result.current.tasks.find((t) => t.id === target.id)!
      expect(toggled.subtasks.find((s) => s.id === newSub.id)?.completed).toBe(true)

      act(() => {
        result.current.removeSubtask(target.id, newSub.id)
      })

      const removed = result.current.tasks.find((t) => t.id === target.id)!
      expect(removed.subtasks.find((s) => s.id === newSub.id)).toBeUndefined()
    })

    it('permite adicionar e excluir coluna (com suas respectivas tarefas)', () => {
      const { result } = renderHook(() => useKanban())

      act(() => {
        result.current.addColumn('Revisão de Código', 'purple')
      })

      expect(result.current.columns.some((c) => c.title === 'Revisão de Código')).toBe(
        true
      )
      const newCol = result.current.columns.find((c) => c.title === 'Revisão de Código')!

      act(() => {
        result.current.deleteColumn(newCol.id)
      })

      expect(result.current.columns.some((c) => c.id === newCol.id)).toBe(false)
    })

    it('importa e reseta dados corretamente', () => {
      const { result } = renderHook(() => useKanban())

      act(() => {
        result.current.resetToSeed()
      })
      expect(result.current.allTasksCount).toBe(INITIAL_DATA.tasks.length)

      const customData = {
        columns: [
          { id: 'col-solo', title: 'Única', order: 0, colorTheme: 'blue' as const },
        ],
        tasks: [],
        version: 1,
      }

      let importSuccess = false
      act(() => {
        importSuccess = result.current.importData(customData)
      })

      expect(importSuccess).toBe(true)
      expect(result.current.columns).toHaveLength(1)
    })
  })

  describe('Modo Autenticado (Sincronização em Nuvem Supabase)', () => {
    it('carrega dados da nuvem ao montar quando existem tarefas no Supabase', async () => {
      const mockCloudColumns = [
        {
          id: 'col-cloud',
          title: 'Coluna Nuvem',
          order: 0,
          colorTheme: 'emerald' as const,
        },
      ]
      const mockCloudTasks = [
        {
          id: 'task-cloud-1',
          title: 'Tarefa na Nuvem',
          columnId: 'col-cloud',
          priority: 'urgent' as const,
          tags: [],
          subtasks: [],
          createdAt: '2026-09-08T00:00:00.000Z',
          updatedAt: '2026-09-08T00:00:00.000Z',
        },
      ]

      vi.spyOn(supabaseKanbanService, 'fetchKanbanData').mockResolvedValueOnce({
        columns: mockCloudColumns,
        tasks: mockCloudTasks,
      })

      const { result } = renderHook(() => useKanban(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(result.current.columns).toHaveLength(1)
        expect(result.current.columns[0].id).toBe('col-cloud')
      })

      expect(result.current.tasks.some((t) => t.id === 'task-cloud-1')).toBe(true)
    })

    it('faz upload automático dos dados locais se o Supabase estiver vazio na primeira conexão', async () => {
      vi.spyOn(supabaseKanbanService, 'fetchKanbanData').mockResolvedValueOnce({
        columns: [],
        tasks: [],
      })
      const uploadSpy = vi
        .spyOn(supabaseKanbanService, 'uploadLocalData')
        .mockResolvedValue()

      renderHook(() => useKanban(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(uploadSpy).toHaveBeenCalledWith(
          'user-kanban-test',
          expect.any(Array),
          expect.any(Array)
        )
      })
    })

    it('dispara syncTask em background de forma otimista ao adicionar e atualizar tarefa', async () => {
      vi.spyOn(supabaseKanbanService, 'fetchKanbanData').mockResolvedValueOnce({
        columns: INITIAL_DATA.columns,
        tasks: INITIAL_DATA.tasks,
      })
      const syncTaskSpy = vi.spyOn(supabaseKanbanService, 'syncTask').mockResolvedValue()

      const { result } = renderHook(() => useKanban(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(result.current.allTasksCount).toBe(INITIAL_DATA.tasks.length)
      })

      let addedTask: any
      act(() => {
        addedTask = result.current.addTask({
          title: 'Tarefa Nuvem Imediata',
          columnId: 'col-todo',
          priority: 'medium',
          tags: [],
          subtasks: [],
        })
      })

      // Atualização otimista de 0ms
      expect(result.current.tasks.some((t) => t.id === addedTask.id)).toBe(true)
      expect(syncTaskSpy).toHaveBeenCalledWith(
        'user-kanban-test',
        expect.objectContaining({
          title: 'Tarefa Nuvem Imediata',
        })
      )

      act(() => {
        result.current.updateTask(addedTask.id, { title: 'Tarefa Nuvem Editada' })
      })

      expect(result.current.tasks.find((t) => t.id === addedTask.id)?.title).toBe(
        'Tarefa Nuvem Editada'
      )
      expect(syncTaskSpy).toHaveBeenCalledWith(
        'user-kanban-test',
        expect.objectContaining({
          title: 'Tarefa Nuvem Editada',
        })
      )
    })

    it('dispara deleteTask em background de forma otimista ao deletar tarefa', async () => {
      vi.spyOn(supabaseKanbanService, 'fetchKanbanData').mockResolvedValueOnce({
        columns: INITIAL_DATA.columns,
        tasks: INITIAL_DATA.tasks,
      })
      const deleteTaskSpy = vi
        .spyOn(supabaseKanbanService, 'deleteTask')
        .mockResolvedValue()

      const { result } = renderHook(() => useKanban(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(result.current.allTasksCount).toBe(INITIAL_DATA.tasks.length)
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
