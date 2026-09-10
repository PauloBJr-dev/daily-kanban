import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storageService } from '../services/storageService'
import { INITIAL_DATA } from '../services/seedData'
import type { KanbanData } from '../types/kanban'

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('retorna INITIAL_DATA quando o localStorage está vazio', () => {
    const data = storageService.load()
    expect(data.columns).toHaveLength(INITIAL_DATA.columns.length)
    expect(data.tasks).toHaveLength(INITIAL_DATA.tasks.length)
  })

  it('retorna as chaves corretas de storage para usuário e visitante', () => {
    expect(storageService.getStorageKey('user-abc')).toBe(
      'organocat_kanban_user_user-abc'
    )
    expect(storageService.getStorageKey(null)).toBe('organocat_kanban_guest')
    expect(storageService.getStorageKey(undefined)).toBe('organocat_kanban_guest')
  })

  it('salva e recupera os dados com sucesso no modo visitante padrão', () => {
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

  it('isola estritamente os dados entre diferentes usuários e visitante', () => {
    const user1Data: KanbanData = {
      columns: [{ id: 'col-u1', title: 'Coluna U1', order: 0, colorTheme: 'blue' }],
      tasks: [
        {
          id: 'task-u1',
          title: 'Tarefa Usuário 1',
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
          title: 'Tarefa Usuário 2',
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

    expect(storageService.load('user-1').tasks[0].title).toBe('Tarefa Usuário 1')
    expect(storageService.load('user-2').tasks[0].title).toBe('Tarefa Usuário 2')
    expect(storageService.load(null).columns[0].title).toBe('Coluna Convidado')

    // Limpar user-1 não afeta user-2 nem convidado
    storageService.clear('user-1')
    expect(localStorage.getItem('organocat_kanban_user_user-1')).toBeNull()
    expect(storageService.load('user-2').tasks[0].title).toBe('Tarefa Usuário 2')
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
})
