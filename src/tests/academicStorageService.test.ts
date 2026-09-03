import { describe, it, expect, beforeEach, vi } from 'vitest'
import { academicStorageService } from '../services/academicStorageService'
import { INITIAL_ACADEMIC_DATA } from '../services/academicSeedData'
import type { AcademicData } from '../types/academic'

describe('academicStorageService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('retorna INITIAL_ACADEMIC_DATA quando o localStorage está vazio', () => {
    const data = academicStorageService.load()
    expect(data.subjects).toHaveLength(INITIAL_ACADEMIC_DATA.subjects.length)
    expect(data.notes).toHaveLength(INITIAL_ACADEMIC_DATA.notes.length)
    expect(data.version).toBe(INITIAL_ACADEMIC_DATA.version)
  })

  it('salva e recupera os dados acadêmicos com sucesso', () => {
    const customData: AcademicData = {
      subjects: [
        {
          id: 'sub-test',
          name: 'Física Quântica',
          color: 'purple',
          code: 'FIS-301',
          icon: 'Atom',
        },
      ],
      notes: [
        {
          id: 'note-test',
          title: 'Equação de Schrödinger',
          content: 'Função de onda e densidade de probabilidade.',
          subjectId: 'sub-test',
          status: 'in_progress',
          tags: ['Física', 'Quântica'],
          isPinned: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      version: 1,
    }

    academicStorageService.save(customData)
    const loaded = academicStorageService.load()

    expect(loaded.subjects).toHaveLength(1)
    expect(loaded.subjects[0].name).toBe('Física Quântica')
    expect(loaded.notes).toHaveLength(1)
    expect(loaded.notes[0].title).toBe('Equação de Schrödinger')
    expect(loaded.notes[0].isPinned).toBe(true)
  })

  it('retorna INITIAL_ACADEMIC_DATA se o JSON no localStorage for corrompido ou inválido', () => {
    localStorage.setItem('dailyflow_academic_data_v1', 'json-invalido-{{}')
    const loadedCorrupted = academicStorageService.load()
    expect(loadedCorrupted.subjects).toHaveLength(INITIAL_ACADEMIC_DATA.subjects.length)

    localStorage.setItem(
      'dailyflow_academic_data_v1',
      JSON.stringify({ algoDiferente: true })
    )
    const loadedMissingArrays = academicStorageService.load()
    expect(loadedMissingArrays.subjects).toHaveLength(
      INITIAL_ACADEMIC_DATA.subjects.length
    )
  })

  it('valida corretamente objetos de AcademicData com validateJSON', () => {
    expect(academicStorageService.validateJSON({ subjects: [], notes: [] })).toBe(true)
    expect(
      academicStorageService.validateJSON({
        subjects: [{ id: '1', name: 'Mat', color: 'indigo' }],
        notes: [],
        version: 1,
      })
    ).toBe(true)
    expect(academicStorageService.validateJSON(null)).toBe(false)
    expect(academicStorageService.validateJSON('texto')).toBe(false)
    expect(academicStorageService.validateJSON(123)).toBe(false)
    expect(academicStorageService.validateJSON({ subjects: [] })).toBe(false)
    expect(academicStorageService.validateJSON({ notes: [] })).toBe(false)
  })

  it('limpa os dados do localStorage ao invocar clear()', () => {
    academicStorageService.save({
      subjects: [],
      notes: [],
      version: 1,
    })
    expect(localStorage.getItem('dailyflow_academic_data_v1')).not.toBeNull()

    academicStorageService.clear()
    expect(localStorage.getItem('dailyflow_academic_data_v1')).toBeNull()
  })

  it('executa exportJSON sem lançar erros', () => {
    const createObjectURLSpy = vi.fn().mockReturnValue('blob:mock-url')
    const revokeObjectURLSpy = vi.fn()
    window.URL.createObjectURL = createObjectURLSpy
    window.URL.revokeObjectURL = revokeObjectURLSpy

    expect(() => {
      academicStorageService.exportJSON(INITIAL_ACADEMIC_DATA)
    }).not.toThrow()
    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
  })
})
