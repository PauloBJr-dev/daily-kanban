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

  it('retorna as chaves corretas de storage para usuário e visitante', () => {
    expect(academicStorageService.getStorageKey('user-academic-1')).toBe(
      'organocat_academic_user_user-academic-1'
    )
    expect(academicStorageService.getStorageKey(null)).toBe('organocat_academic_guest')
    expect(academicStorageService.getStorageKey(undefined)).toBe(
      'organocat_academic_guest'
    )
  })

  it('salva e recupera os dados acadêmicos com sucesso no modo visitante padrão', () => {
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
    expect(localStorage.getItem('organocat_academic_guest')).not.toBeNull()

    const loaded = academicStorageService.load()
    expect(loaded.subjects).toHaveLength(1)
    expect(loaded.subjects[0].name).toBe('Física Quântica')
    expect(loaded.notes).toHaveLength(1)
    expect(loaded.notes[0].title).toBe('Equação de Schrödinger')
    expect(loaded.notes[0].isPinned).toBe(true)
  })

  it('isola estritamente os dados entre diferentes usuários e modo visitante', () => {
    const u1Data: AcademicData = {
      subjects: [
        {
          id: 'sub-u1',
          name: 'Biologia',
          color: 'emerald',
          code: 'BIO-101',
          icon: 'Leaf',
        },
      ],
      notes: [
        {
          id: 'note-u1',
          title: 'Genética Mendeliana',
          content: 'Primeira e segunda lei de Mendel.',
          subjectId: 'sub-u1',
          status: 'mastered',
          tags: ['Biologia'],
          isPinned: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      version: 1,
    }

    const u2Data: AcademicData = {
      subjects: [
        {
          id: 'sub-u2',
          name: 'Química Orgânica',
          color: 'rose',
          code: 'QUI-201',
          icon: 'Flask',
        },
      ],
      notes: [],
      version: 1,
    }

    academicStorageService.save(u1Data, 'user-u1')
    academicStorageService.save(u2Data, 'user-u2')

    expect(academicStorageService.load('user-u1').notes[0].title).toBe(
      'Genética Mendeliana'
    )
    expect(academicStorageService.load('user-u2').subjects[0].name).toBe(
      'Química Orgânica'
    )
    expect(academicStorageService.load('user-u2').notes).toHaveLength(0)

    // Clear user-u1
    academicStorageService.clear('user-u1')
    expect(localStorage.getItem('organocat_academic_user_user-u1')).toBeNull()
    expect(academicStorageService.load('user-u2').subjects[0].name).toBe(
      'Química Orgânica'
    )

    // Clear guest
    academicStorageService.save(u1Data, null)
    expect(localStorage.getItem('organocat_academic_guest')).not.toBeNull()
    academicStorageService.clear(null)
    expect(localStorage.getItem('organocat_academic_guest')).toBeNull()
  })

  it('retorna INITIAL_ACADEMIC_DATA se o JSON no localStorage for corrompido ou inválido', () => {
    const key = academicStorageService.getStorageKey()
    localStorage.setItem(key, 'json-invalido-{{}')
    const loadedCorrupted = academicStorageService.load()
    expect(loadedCorrupted.subjects).toHaveLength(INITIAL_ACADEMIC_DATA.subjects.length)

    localStorage.setItem(key, JSON.stringify({ algoDiferente: true }))
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
    const key = academicStorageService.getStorageKey()
    expect(localStorage.getItem(key)).not.toBeNull()

    academicStorageService.clear()
    expect(localStorage.getItem(key)).toBeNull()
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
