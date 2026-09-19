import { describe, it, expect, beforeEach, vi } from 'vitest'
import { academicStorageService } from '../services/academicStorageService'
import { INITIAL_ACADEMIC_DATA } from '../services/academicSeedData'
import type { AcademicData } from '../types/academic'

describe('academicStorageService', () => {
  it('carrega dados legados de organocat_academic_guest ou dailyflow_academic_guest como fallback', () => {
    const legacyData = {
      subjects: [
        {
          id: 'sub-leg',
          name: 'História',
          color: 'amber',
          code: 'HIS-101',
          icon: 'Book',
        },
      ],
      notes: [
        {
          id: 'note-leg',
          title: 'Roma Antiga',
          content: 'República e Império.',
          subjectId: 'sub-leg',
          status: 'completed',
          tags: ['História'],
          isPinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      version: 1,
    }
    localStorage.setItem('organocat_academic_guest', JSON.stringify(legacyData))

    const loaded = academicStorageService.load(null)
    expect(loaded.subjects).toHaveLength(1)
    expect(loaded.subjects[0].name).toBe('História')
    expect(loaded.notes[0].title).toBe('Roma Antiga')
    // Deve ter persistido na chave oficial do Organy
    expect(localStorage.getItem('organy_academic_guest')).not.toBeNull()
  })

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('retorna INITIAL_ACADEMIC_DATA quando o localStorage está vazio', () => {
    const data = academicStorageService.load()
    expect(data.subjects).toHaveLength(0)
    expect(data.subjects).toEqual([])
    expect(data.notes).toHaveLength(0)
    expect(data.notes).toEqual([])
    expect(data.version).toBe(INITIAL_ACADEMIC_DATA.version)
  })

  it('retorna as chaves corretas de storage para usuário e visitante', () => {
    expect(academicStorageService.getStorageKey('user-academic-1')).toBe(
      'organy_academic_user_user-academic-1'
    )
    expect(academicStorageService.getStorageKey(null)).toBe('organy_academic_guest')
    expect(academicStorageService.getStorageKey(undefined)).toBe('organy_academic_guest')
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
    expect(localStorage.getItem('organy_academic_guest')).not.toBeNull()

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
    expect(localStorage.getItem('organy_academic_user_user-u1')).toBeNull()
    expect(academicStorageService.load('user-u2').subjects[0].name).toBe(
      'Química Orgânica'
    )

    // Clear guest
    academicStorageService.save(u1Data, null)
    expect(localStorage.getItem('organy_academic_guest')).not.toBeNull()
    academicStorageService.clear(null)
    expect(localStorage.getItem('organy_academic_guest')).toBeNull()
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
  describe('migrateGuestData', () => {
    it('retorna null se userId for vazio ou nulo', () => {
      expect(academicStorageService.migrateGuestData('')).toBeNull()
      expect(academicStorageService.migrateGuestData(null as any)).toBeNull()
    })

    it('migra dados de visitante para o usuário e preserva chave de visitante (zero data loss)', () => {
      const guestData = {
        subjects: [{ id: 'sub-1', name: 'Cálculo', color: 'blue' }],
        notes: [
          {
            id: 'note-1',
            title: 'Limites e Derivadas',
            content: 'Conteúdo de cálculo',
            subjectId: 'sub-1',
            status: 'to_review',
            tags: ['matemática'],
            createdAt: '2026-09-19T00:00:00Z',
            updatedAt: '2026-09-19T00:00:00Z',
          },
        ],
        version: 1,
      }
      localStorage.setItem('organy_academic_guest', JSON.stringify(guestData))

      const result = academicStorageService.migrateGuestData('user-novo-123')
      expect(result).not.toBeNull()
      expect(result?.notes).toHaveLength(1)
      expect(result?.notes[0].title).toBe('Limites e Derivadas')

      // Verifica se os dados foram salvos para o usuário
      const savedUser = academicStorageService.load('user-novo-123')
      expect(savedUser.notes).toHaveLength(1)

      // GARANTIA ZERO PERDA: Verifica se a chave de visitante continuou intacta no localStorage
      expect(localStorage.getItem('organy_academic_guest')).toBe(
        JSON.stringify(guestData)
      )
    })

    it('retorna null se o usuário já possuir anotações salvas', () => {
      const userExisting = {
        subjects: [{ id: 'sub-2', name: 'Física', color: 'red' }],
        notes: [
          {
            id: 'note-2',
            title: 'Mecânica Quântica',
            content: 'Nota existente',
            subjectId: 'sub-2',
            status: 'completed',
            tags: [],
            createdAt: '2026-09-19T00:00:00Z',
            updatedAt: '2026-09-19T00:00:00Z',
          },
        ],
        version: 1,
      }
      academicStorageService.save(userExisting as any, 'user-com-notas')

      const guestData = {
        subjects: [{ id: 'sub-1', name: 'Química', color: 'green' }],
        notes: [
          {
            id: 'note-guest',
            title: 'Nota Guest',
            content: '',
            subjectId: 'sub-1',
            status: 'to_review',
            tags: [],
            createdAt: '',
            updatedAt: '',
          },
        ],
        version: 1,
      }
      localStorage.setItem('organy_academic_guest', JSON.stringify(guestData))

      const result = academicStorageService.migrateGuestData('user-com-notas')
      expect(result).toBeNull()

      // Os dados do usuário permanecem os mesmos
      const userAfter = academicStorageService.load('user-com-notas')
      expect(userAfter.notes[0].title).toBe('Mecânica Quântica')
    })

    it('retorna null se não houver dados de visitante', () => {
      const result = academicStorageService.migrateGuestData('user-vazio')
      expect(result).toBeNull()
    })
  })
})
