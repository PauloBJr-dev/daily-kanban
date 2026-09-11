import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storageService } from '../services/storageService'
import { INITIAL_DATA } from '../services/seedData'
import type { KanbanData } from '../types/kanban'

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('retorna INITIAL_DATA quando o localStorage est? vazio', () => {
    const data = storageService.load()
    expect(data.columns).toHaveLength(INITIAL_DATA.columns.length)
    expect(data.tasks).toHaveLength(INITIAL_DATA.tasks.length)
  })

  it('retorna as chaves corretas de storage para usu?rio e visitante', () => {
    expect(storageService.getStorageKey('user-abc')).toBe(
      'organocat_kanban_user_user-abc'
    )
    expect(storageService.getStorageKey(null)).toBe('organocat_kanban_guest')
    expect(storageService.getStorageKey(undefined)).toBe('organocat_kanban_guest')
  })

  it('salva e recupera os dados com sucesso no modo visitante padr?o', () => {
    const customData: KanbanData = {
      columns: [{ id: 'col-1', title: 'Teste', order: 0, colorTheme: 'blue' }],
      tasks: [
        {
          id: 'task-test',
          title: 'Tarefa de Teste',
          columnId: 'col-1',
          priority: 'high',
          tags: ['Teste'],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      version: 1,
    }

    storageService.save(customData)
    expect(localStorage.getItem('organocat_kanban_guest')).not.toBeNull()

    const loaded = storageService.load()
    expect(loaded.columns).toHaveLength(1)
    expect(loaded.columns[0].title).toBe('Teste')
    expect(loaded.tasks).toHaveLength(1)
    expect(loaded.tasks[0].title).toBe('Tarefa de Teste')
  })

  it('isola estritamente os dados entre diferentes usu?rios e visitante', () => {
    const user1Data: KanbanData = {
      columns: [{ id: 'col-u1', title: 'Coluna U1', order: 0, colorTheme: 'blue' }],
      tasks: [
        {
          id: 'task-u1',
          title: 'Tarefa Usu?rio 1',
          columnId: 'col-u1',
          priority: 'urgent',
          tags: ['U1'],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      version: 1,
    }

    const user2Data: KanbanData = {
      columns: [{ id: 'col-u2', title: 'Coluna U2', order: 0, colorTheme: 'purple' }],
      tasks: [
        {
          id: 'task-u2',
          title: 'Tarefa Usu?rio 2',
          columnId: 'col-u2',
          priority: 'low',
          tags: ['U2'],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      version: 1,
    }

    const guestData: KanbanData = {
      columns: [
        { id: 'col-guest', title: 'Coluna Convidado', order: 0, colorTheme: 'amber' },
      ],
      tasks: [],
      version: 1,
    }

    storageService.save(user1Data, 'user-1')
    storageService.save(user2Data, 'user-2')
    storageService.save(guestData, null)

    expect(storageService.load('user-1').tasks[0].title).toBe('Tarefa Usu?rio 1')
    expect(storageService.load('user-2').tasks[0].title).toBe('Tarefa Usu?rio 2')
    expect(storageService.load(null).columns[0].title).toBe('Coluna Convidado')

    // Limpar user-1 n?o afeta user-2 nem convidado
    storageService.clear('user-1')
    expect(localStorage.getItem('organocat_kanban_user_user-1')).toBeNull()
    expect(storageService.load('user-2').tasks[0].title).toBe('Tarefa Usu?rio 2')
    expect(storageService.load(null).columns[0].title).toBe('Coluna Convidado')

    // Limpar visitante
    storageService.clear(null)
    expect(localStorage.getItem('organocat_kanban_guest')).toBeNull()
  })

  it('valida corretamente objetos de KanbanData', () => {
    expect(storageService.validateJSON({ columns: [], tasks: [] })).toBe(true)
    expect(storageService.validateJSON(null)).toBe(false)
    expect(storageService.validateJSON('invalido')).toBe(false)
    expect(storageService.validateJSON({ columns: [] })).toBe(false)
  })

  describe('migra??o de dados legados e visitante', () => {
    it('migra dados da chave legada dailyflow_kanban_data_v1 para a chave atual', () => {
      const legacyData: KanbanData = {
        columns: [{ id: 'col-leg', title: 'Legado', order: 0, colorTheme: 'blue' }],
        tasks: [
          {
            id: 'task-leg',
            title: 'Tarefa Legada',
            columnId: 'col-leg',
            priority: 'medium',
            tags: [],
            subtasks: [],
            createdAt: '2026-08-01T00:00:00.000Z',
            updatedAt: '2026-08-01T00:00:00.000Z',
          },
        ],
        version: 1,
      }

      localStorage.setItem('dailyflow_kanban_data_v1', JSON.stringify(legacyData))

      const loaded = storageService.load('user-migrado')
      expect(loaded.tasks).toHaveLength(1)
      expect(loaded.tasks[0].title).toBe('Tarefa Legada')

      // Verifica se foi salvo na chave nova e removido da legada
      expect(localStorage.getItem('organocat_kanban_user_user-migrado')).not.toBeNull()
      expect(localStorage.getItem('dailyflow_kanban_data_v1')).toBeNull()
    })

    it('migrateGuestData copia dados de visitante quando o usu?rio autenticado n?o possui tarefas', () => {
      const guestData: KanbanData = {
        columns: [{ id: 'col-g', title: 'Visitante', order: 0, colorTheme: 'amber' }],
        tasks: [
          {
            id: 'task-guest-1',
            title: 'Tarefa Criada como Visitante',
            columnId: 'col-g',
            priority: 'urgent',
            tags: ['Offline'],
            subtasks: [],
            createdAt: '2026-09-01T00:00:00.000Z',
            updatedAt: '2026-09-01T00:00:00.000Z',
          },
        ],
        version: 1,
      }

      storageService.save(guestData, null)

      const migrated = storageService.migrateGuestData('user-novo')
      expect(migrated).not.toBeNull()
      expect(migrated?.tasks).toHaveLength(1)
      expect(migrated?.tasks[0].title).toBe('Tarefa Criada como Visitante')

      // Verifica se a chave do usu?rio agora cont?m os dados migrados
      const userLoaded = storageService.load('user-novo')
      expect(userLoaded.tasks[0].title).toBe('Tarefa Criada como Visitante')
    })

    it('migrateGuestData retorna null se o usu?rio j? possui tarefas salvas', () => {
      const userData: KanbanData = {
        columns: [{ id: 'col-u', title: 'Usu?rio', order: 0, colorTheme: 'emerald' }],
        tasks: [
          {
            id: 'task-user-existente',
            title: 'Tarefa Existente do Usu?rio',
            columnId: 'col-u',
            priority: 'low',
            tags: [],
            subtasks: [],
            createdAt: '2026-09-02T00:00:00.000Z',
            updatedAt: '2026-09-02T00:00:00.000Z',
          },
        ],
        version: 1,
      }
      const guestData: KanbanData = {
        columns: [{ id: 'col-g', title: 'Visitante', order: 0, colorTheme: 'amber' }],
        tasks: [
          {
            id: 'task-g',
            title: 'Tarefa Convidado',
            columnId: 'col-g',
            priority: 'high',
            tags: [],
            subtasks: [],
            createdAt: '2026-09-01T00:00:00.000Z',
            updatedAt: '2026-09-01T00:00:00.000Z',
          },
        ],
        version: 1,
      }

      storageService.save(userData, 'user-com-tarefas')
      storageService.save(guestData, null)

      const result = storageService.migrateGuestData('user-com-tarefas')
      expect(result).toBeNull()

      // Dados do usu?rio continuam preservados
      const userLoaded = storageService.load('user-com-tarefas')
      expect(userLoaded.tasks[0].title).toBe('Tarefa Existente do Usu?rio')
    })

    it('migrateGuestData retorna null se o visitante n?o possui tarefas', () => {
      const guestData: KanbanData = {
        columns: [{ id: 'col-g', title: 'Visitante', order: 0, colorTheme: 'amber' }],
        tasks: [],
        version: 1,
      }
      storageService.save(guestData, null)

      const result = storageService.migrateGuestData('user-sem-guest-tasks')
      expect(result).toBeNull()
    })

    it('migrateGuestData retorna null se userId for vazio ou nulo', () => {
      expect(storageService.migrateGuestData('')).toBeNull()
      expect(storageService.migrateGuestData(null as any)).toBeNull()
    })
  })
})
