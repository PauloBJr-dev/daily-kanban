import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  saveActiveSession,
  fetchActiveSession,
  clearActiveSession,
  logCompletedSession,
  fetchCompletedSessions,
  pomodoroSessionService,
  type ActivePomodoroSession,
} from '../services/pomodoroSessionService'

describe('pomodoroSessionService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('saveActiveSession & clearActiveSession', () => {
    it('salva a sessão ativa de pomodoro no perfil do usuário no Supabase', async () => {
      const activeSession: ActivePomodoroSession = {
        taskId: 'task-99',
        taskTitle: 'Estudar TypeScript',
        mode: 'work',
        startedAt: '2026-09-14T20:00:00.000Z',
        durationSeconds: 1500,
        isRunning: true,
        pausedTimeLeft: null,
      }

      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            update: updateSpy,
          } as any
        }
        return {} as any
      })

      await saveActiveSession('user-1', activeSession)

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          active_pomodoro_session: activeSession,
        })
      )
    })

    it('limpa a sessão ativa com clearActiveSession salvando null', async () => {
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            update: updateSpy,
          } as any
        }
        return {} as any
      })

      await clearActiveSession('user-1')

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          active_pomodoro_session: null,
        })
      )
    })

    it('lança erro caso o update no Supabase falhe', async () => {
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: new Error('Erro de permissão') }),
      })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            update: updateSpy,
          } as any
        }
        return {} as any
      })

      await expect(clearActiveSession('user-1')).rejects.toThrow('Erro de permissão')
    })
  })

  describe('fetchActiveSession', () => {
    it('busca e retorna a sessão ativa do Supabase', async () => {
      const mockSession: ActivePomodoroSession = {
        taskId: 'task-1',
        taskTitle: 'Foco Total',
        mode: 'work',
        startedAt: '2026-09-14T10:00:00.000Z',
        durationSeconds: 1500,
        isRunning: true,
      }

      const maybeSingleSpy = vi.fn().mockResolvedValue({
        data: { active_pomodoro_session: mockSession },
        error: null,
      })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              maybeSingle: maybeSingleSpy,
            }),
          } as any
        }
        return {} as any
      })

      const result = await fetchActiveSession('user-1')
      expect(result).toEqual(mockSession)
    })

    it('retorna null se não houver sessão ativa salva', async () => {
      const maybeSingleSpy = vi.fn().mockResolvedValue({
        data: { active_pomodoro_session: null },
        error: null,
      })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              maybeSingle: maybeSingleSpy,
            }),
          } as any
        }
        return {} as any
      })

      const result = await fetchActiveSession('user-1')
      expect(result).toBeNull()
    })

    it('lança erro se a consulta falhar', async () => {
      const maybeSingleSpy = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Erro de conexão'),
      })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              maybeSingle: maybeSingleSpy,
            }),
          } as any
        }
        return {} as any
      })

      await expect(fetchActiveSession('user-1')).rejects.toThrow('Erro de conexão')
    })
  })

  describe('logCompletedSession', () => {
    it('insere uma nova sessão concluída em pomodoro_sessions com sucesso', async () => {
      const mockInsertedRow = {
        id: 'pomo_123',
        user_id: 'user-1',
        task_id: 'task-10',
        mode: 'work',
        duration_minutes: 25,
        completed_at: '2026-09-14T21:00:00.000Z',
        created_at: '2026-09-14T21:00:00.000Z',
      }

      const singleSpy = vi.fn().mockResolvedValue({
        data: mockInsertedRow,
        error: null,
      })

      const selectSpy = vi.fn().mockReturnValue({
        single: singleSpy,
      })

      const insertSpy = vi.fn().mockReturnValue({
        select: selectSpy,
      })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'pomodoro_sessions') {
          return {
            insert: insertSpy,
          } as any
        }
        return {} as any
      })

      const result = await logCompletedSession('user-1', {
        taskId: 'task-10',
        mode: 'work',
        durationMinutes: 25,
        completedAt: '2026-09-14T21:00:00.000Z',
      })

      expect(result).toEqual({
        id: 'pomo_123',
        userId: 'user-1',
        taskId: 'task-10',
        mode: 'work',
        durationMinutes: 25,
        completedAt: '2026-09-14T21:00:00.000Z',
        createdAt: '2026-09-14T21:00:00.000Z',
      })
      expect(insertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          task_id: 'task-10',
          mode: 'work',
          duration_minutes: 25,
        })
      )
    })

    it('lança erro se a inserção da sessão falhar', async () => {
      const insertSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Erro ao inserir sessão'),
          }),
        }),
      })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'pomodoro_sessions') {
          return {
            insert: insertSpy,
          } as any
        }
        return {} as any
      })

      await expect(
        logCompletedSession('user-1', {
          taskId: null,
          mode: 'break',
          durationMinutes: 5,
          completedAt: '2026-09-14T21:05:00.000Z',
        })
      ).rejects.toThrow('Erro ao inserir sessão')
    })
  })

  describe('fetchCompletedSessions', () => {
    it('busca o histórico de sessões ordenadas por completed_at decrescente', async () => {
      const mockRows = [
        {
          id: 'pomo-2',
          user_id: 'user-1',
          task_id: 'task-2',
          mode: 'work',
          duration_minutes: 50,
          completed_at: '2026-09-14T22:00:00.000Z',
          created_at: '2026-09-14T21:10:00.000Z',
        },
        {
          id: 'pomo-1',
          user_id: 'user-1',
          task_id: null,
          mode: 'break',
          duration_minutes: 10,
          completed_at: '2026-09-14T21:00:00.000Z',
          created_at: '2026-09-14T20:50:00.000Z',
        },
      ]

      const orderSpy = vi.fn().mockResolvedValue({
        data: mockRows,
        error: null,
      })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'pomodoro_sessions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              order: orderSpy,
            }),
          } as any
        }
        return {} as any
      })

      const result = await fetchCompletedSessions('user-1')

      expect(orderSpy).toHaveBeenCalledWith('completed_at', { ascending: false })
      expect(result).toHaveLength(2)
      expect(result[0].durationMinutes).toBe(50)
      expect(result[1].mode).toBe('break')
    })

    it('lança erro quando a busca falha', async () => {
      const orderSpy = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Erro ao listar sessões'),
      })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'pomodoro_sessions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              order: orderSpy,
            }),
          } as any
        }
        return {} as any
      })

      await expect(fetchCompletedSessions('user-1')).rejects.toThrow(
        'Erro ao listar sessões'
      )
    })
  })

  describe('pomodoroSessionService export', () => {
    it('exporta o objeto com todos os métodos utilitários', () => {
      expect(pomodoroSessionService.saveActiveSession).toBeDefined()
      expect(pomodoroSessionService.fetchActiveSession).toBeDefined()
      expect(pomodoroSessionService.clearActiveSession).toBeDefined()
      expect(pomodoroSessionService.logCompletedSession).toBeDefined()
      expect(pomodoroSessionService.fetchCompletedSessions).toBeDefined()
    })
  })
})
