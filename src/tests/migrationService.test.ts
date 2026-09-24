import { describe, it, expect, vi, beforeEach } from 'vitest'
import { migrationService } from '../services/migrationService'
import { storageService } from '../services/storageService'
import { supabaseKanbanService } from '../services/supabaseKanbanService'
import { supabaseAcademicService } from '../services/supabaseAcademicService'
import * as supabaseLib from '../lib/supabase'

describe('migrationService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true)
  })

  describe('hasGuestDataToMigrate', () => {
    it('retorna false quando não há dados de visitante', () => {
      expect(migrationService.hasGuestDataToMigrate()).toBe(false)
    })

    it('retorna true quando há tarefas no armazenamento de visitante do Kanban', () => {
      localStorage.setItem(
        'organy_kanban_guest',
        JSON.stringify({
          columns: [],
          tasks: [{ id: 'task-1', title: 'Estudar Vitest', columnId: 'col-todo' }],
        })
      )
      expect(migrationService.hasGuestDataToMigrate()).toBe(true)
    })

    it('retorna true quando há anotações no armazenamento de visitante Acadêmico', () => {
      localStorage.setItem(
        'organy_academic_guest',
        JSON.stringify({
          subjects: [],
          notes: [{ id: 'note-1', title: 'Resumo de Física', content: '' }],
        })
      )
      expect(migrationService.hasGuestDataToMigrate()).toBe(true)
    })
  })

  describe('executeMigration', () => {
    it('retorna erro se userId for inválido ou ausente', async () => {
      const res = await migrationService.executeMigration('')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Usuário não identificado para migração.')
    })

    it('executa com sucesso todas as 6 etapas da esteira de migração', async () => {
      const guestKanban = {
        columns: [{ id: 'col-1', title: 'A Fazer', colorTheme: 'blue', order: 0 }],
        tasks: [
          {
            id: 't-1',
            title: 'Tarefa de Teste',
            columnId: 'col-1',
            priority: 'high',
            tags: [],
            createdAt: '2026-09-19T00:00:00Z',
            updatedAt: '2026-09-19T00:00:00Z',
          },
        ],
      }
      const guestAcademic = {
        subjects: [{ id: 'sub-1', name: 'Biologia', color: 'green' }],
        notes: [
          {
            id: 'n-1',
            title: 'Genética',
            content: 'DNA e RNA',
            subjectId: 'sub-1',
            status: 'to_review',
            tags: [],
            createdAt: '2026-09-19T00:00:00Z',
            updatedAt: '2026-09-19T00:00:00Z',
          },
        ],
        version: 1,
      }

      localStorage.setItem('organy_kanban_guest', JSON.stringify(guestKanban))
      localStorage.setItem('organy_academic_guest', JSON.stringify(guestAcademic))

      const uploadKanbanSpy = vi
        .spyOn(supabaseKanbanService, 'uploadLocalData')
        .mockResolvedValue()
      const uploadAcademicSpy = vi
        .spyOn(supabaseAcademicService, 'uploadLocalData')
        .mockResolvedValue()

      const stepChanges: string[] = []
      const res = await migrationService.executeMigration('user-123', (steps) => {
        const running = steps.find((s) => s.status === 'running')
        if (running && !stepChanges.includes(running.id)) {
          stepChanges.push(running.id)
        }
      })

      expect(res.success).toBe(true)
      expect(uploadKanbanSpy).toHaveBeenCalledWith(
        'user-123',
        expect.any(Array),
        expect.any(Array)
      )
      expect(uploadAcademicSpy).toHaveBeenCalledWith('user-123', expect.any(Object))

      // GARANTIA ZERO LOSS: As chaves de visitante foram preservadas intactas
      expect(localStorage.getItem('organy_kanban_guest')).toBe(
        JSON.stringify(guestKanban)
      )
      expect(localStorage.getItem('organy_academic_guest')).toBe(
        JSON.stringify(guestAcademic)
      )

      // Backup de segurança criado
      expect(localStorage.getItem('organy_migration_backup_user-123')).not.toBeNull()
      expect(localStorage.getItem('organy_migration_completed_user-123')).toBe('true')
    })

    it('interrompe a migração e reporta erro caso a sincronização na nuvem falhe', async () => {
      const guestKanban = {
        columns: [{ id: 'col-1', title: 'A Fazer', colorTheme: 'blue', order: 0 }],
        tasks: [
          {
            id: 't-1',
            title: 'Tarefa',
            columnId: 'col-1',
            priority: 'medium',
            tags: [],
            createdAt: '',
            updatedAt: '',
          },
        ],
      }
      localStorage.setItem('organy_kanban_guest', JSON.stringify(guestKanban))

      vi.spyOn(supabaseKanbanService, 'uploadLocalData').mockRejectedValue(
        new Error('Falha de conexão com o banco de dados')
      )

      const res = await migrationService.executeMigration('user-fail')
      expect(res.success).toBe(false)
      expect(res.failedStepId).toBe('kanban_cloud')
      expect(res.error).toBe('Falha de conexão com o banco de dados')

      // Dados continuam seguros localmente
      expect(localStorage.getItem('organy_kanban_guest')).not.toBeNull()
      expect(storageService.load('user-fail').tasks.length).toBe(1)
    })

    it('permite retentativa a partir dos passos pendentes', async () => {
      const guestKanban = {
        columns: [{ id: 'col-1', title: 'A Fazer', colorTheme: 'blue', order: 0 }],
        tasks: [
          {
            id: 't-1',
            title: 'Tarefa',
            columnId: 'col-1',
            priority: 'medium',
            tags: [],
            createdAt: '',
            updatedAt: '',
          },
        ],
      }
      localStorage.setItem('organy_kanban_guest', JSON.stringify(guestKanban))

      const uploadKanbanSpy = vi
        .spyOn(supabaseKanbanService, 'uploadLocalData')
        .mockRejectedValueOnce(new Error('Falha temporária de rede'))
        .mockResolvedValueOnce()

      vi.spyOn(supabaseAcademicService, 'uploadLocalData').mockResolvedValue()

      // 1ª tentativa: Falha
      const firstTry = await migrationService.executeMigration('user-retry')
      expect(firstTry.success).toBe(false)
      expect(firstTry.failedStepId).toBe('kanban_cloud')

      // 2ª tentativa: Sucesso
      const secondTry = await migrationService.executeMigration('user-retry')
      expect(secondTry.success).toBe(true)
      expect(uploadKanbanSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('downloadBackup', () => {
    it('gera e aciona download de arquivo JSON de contingência', () => {
      const createObjectURLSpy = vi.fn().mockReturnValue('blob:backup-url')
      const revokeObjectURLSpy = vi.fn()
      window.URL.createObjectURL = createObjectURLSpy
      window.URL.revokeObjectURL = revokeObjectURLSpy

      expect(() => {
        migrationService.downloadBackup()
      }).not.toThrow()

      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:backup-url')
    })
  })
})
