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

  it('salva e recupera os dados com sucesso', () => {
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
    const loaded = storageService.load()

    expect(loaded.columns).toHaveLength(1)
    expect(loaded.columns[0].title).toBe('Teste')
    expect(loaded.tasks).toHaveLength(1)
    expect(loaded.tasks[0].title).toBe('Tarefa de Teste')
  })

  it('valida corretamente objetos de KanbanData', () => {
    expect(storageService.validateJSON({ columns: [], tasks: [] })).toBe(true)
    expect(storageService.validateJSON(null)).toBe(false)
    expect(storageService.validateJSON('invalido')).toBe(false)
    expect(storageService.validateJSON({ columns: [] })).toBe(false)
  })
})
