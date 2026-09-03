import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAcademicNotes } from '../hooks/useAcademicNotes'
import { academicStorageService } from '../services/academicStorageService'
import { INITIAL_ACADEMIC_DATA } from '../services/academicSeedData'
import type { AcademicData } from '../types/academic'

describe('useAcademicNotes', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('inicializa com os dados padrão e calcula estatísticas corretamente', () => {
    const { result } = renderHook(() => useAcademicNotes())

    expect(result.current.subjects.length).toBe(INITIAL_ACADEMIC_DATA.subjects.length)
    expect(result.current.allNotesCount).toBe(INITIAL_ACADEMIC_DATA.notes.length)
    expect(result.current.notes.length).toBe(INITIAL_ACADEMIC_DATA.notes.length)

    const expectedPinned = INITIAL_ACADEMIC_DATA.notes.filter((n) => n.isPinned).length
    const expectedToReview = INITIAL_ACADEMIC_DATA.notes.filter(
      (n) => n.status === 'to_review'
    ).length
    const expectedInProgress = INITIAL_ACADEMIC_DATA.notes.filter(
      (n) => n.status === 'in_progress'
    ).length
    const expectedMastered = INITIAL_ACADEMIC_DATA.notes.filter(
      (n) => n.status === 'mastered'
    ).length

    expect(result.current.stats).toEqual({
      totalNotes: INITIAL_ACADEMIC_DATA.notes.length,
      toReviewCount: expectedToReview,
      inProgressCount: expectedInProgress,
      masteredCount: expectedMastered,
      subjectsCount: INITIAL_ACADEMIC_DATA.subjects.length,
      pinnedCount: expectedPinned,
    })

    expect(result.current.allTags.length).toBeGreaterThan(0)
  })

  it('permite adicionar uma nova nota com campos preenchidos', () => {
    const { result } = renderHook(() => useAcademicNotes())

    let addedNote: unknown
    act(() => {
      addedNote = result.current.addNote({
        title: 'Nova Nota de Álgebra',
        content: 'Espaços vetoriais e transformações lineares.',
        subjectId: 'sub-calc',
        status: 'to_review',
        tags: ['Álgebra', 'Vetores'],
        isPinned: false,
      })
    })

    expect(result.current.allNotesCount).toBe(INITIAL_ACADEMIC_DATA.notes.length + 1)
    expect(result.current.allNotes[0].title).toBe('Nova Nota de Álgebra')
    expect(result.current.allNotes[0].id).toBeDefined()
    expect(result.current.allNotes[0].createdAt).toBeDefined()
    expect(result.current.allNotes[0].updatedAt).toBeDefined()
    expect(addedNote).toEqual(result.current.allNotes[0])
  })

  it('permite atualizar e deletar uma nota', () => {
    const { result } = renderHook(() => useAcademicNotes())

    const noteToUpdate = result.current.allNotes[0]

    act(() => {
      result.current.updateNote(noteToUpdate.id, {
        title: 'Título Modificado com Sucesso',
        status: 'mastered',
      })
    })

    const updated = result.current.allNotes.find((n) => n.id === noteToUpdate.id)
    expect(updated?.title).toBe('Título Modificado com Sucesso')
    expect(updated?.status).toBe('mastered')

    act(() => {
      result.current.deleteNote(noteToUpdate.id)
    })

    expect(result.current.allNotes.find((n) => n.id === noteToUpdate.id)).toBeUndefined()
  })

  it('permite alternar o status de fixação (pin) de uma nota', () => {
    const { result } = renderHook(() => useAcademicNotes())
    const note = result.current.allNotes[0]
    const initialPinned = note.isPinned

    act(() => {
      result.current.togglePinNote(note.id)
    })

    const afterToggle = result.current.allNotes.find((n) => n.id === note.id)
    expect(afterToggle?.isPinned).toBe(!initialPinned)
  })

  it('permite adicionar, atualizar e deletar uma disciplina (com exclusão em cascata das notas)', () => {
    const { result } = renderHook(() => useAcademicNotes())

    let newSubjectId = ''
    act(() => {
      const created = result.current.addSubject({
        name: 'Compiladores',
        color: 'rose',
        code: 'CC-501',
      })
      newSubjectId = created.id
    })

    expect(result.current.subjects.some((s) => s.id === newSubjectId)).toBe(true)

    act(() => {
      result.current.updateSubject(newSubjectId, {
        name: 'Compiladores e Interpretadores',
      })
    })

    expect(result.current.subjects.find((s) => s.id === newSubjectId)?.name).toBe(
      'Compiladores e Interpretadores'
    )

    // Adiciona nota atrelada a essa disciplina
    act(() => {
      result.current.addNote({
        title: 'Análise Sintática LR(1)',
        content: 'Gramáticas livres de contexto e tabelas de parsing.',
        subjectId: newSubjectId,
        status: 'in_progress',
        tags: ['Compiladores'],
        isPinned: false,
      })
    })

    expect(result.current.allNotes.some((n) => n.subjectId === newSubjectId)).toBe(true)

    // Deleta a disciplina
    act(() => {
      result.current.deleteSubject(newSubjectId)
    })

    expect(result.current.subjects.some((s) => s.id === newSubjectId)).toBe(false)
    expect(result.current.allNotes.some((n) => n.subjectId === newSubjectId)).toBe(false)
  })

  it('filtra notas por busca textual em título, conteúdo e tags', () => {
    const { result } = renderHook(() => useAcademicNotes())

    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        searchQuery: 'dijkstra',
      }))
    })

    expect(result.current.notes.length).toBe(1)
    expect(result.current.notes[0].title).toContain('Dijkstra')

    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        searchQuery: 'handshake',
      }))
    })

    expect(result.current.notes.length).toBe(1)
    expect(result.current.notes[0].title).toContain('Camada de Transporte')

    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        searchQuery: 'deep learning',
      }))
    })

    expect(result.current.notes.length).toBe(1)
    expect(result.current.notes[0].tags).toContain('Deep Learning')
  })

  it('filtra notas por disciplina, status, tag e fixadas', () => {
    const { result } = renderHook(() => useAcademicNotes())

    // Filtro por disciplina
    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        subjectId: 'sub-calc',
      }))
    })

    expect(result.current.notes.every((n) => n.subjectId === 'sub-calc')).toBe(true)

    // Filtro por status
    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        subjectId: 'all',
        status: 'mastered',
      }))
    })

    expect(result.current.notes.every((n) => n.status === 'mastered')).toBe(true)

    // Filtro por tag
    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        status: 'all',
        tag: 'Cálculo',
      }))
    })

    expect(result.current.notes.every((n) => n.tags.includes('Cálculo'))).toBe(true)

    // Filtro por fixadas (onlyPinned)
    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        tag: null,
        onlyPinned: true,
      }))
    })

    expect(result.current.notes.length).toBeGreaterThan(0)
    expect(result.current.notes.every((n) => n.isPinned)).toBe(true)
  })

  it('ordena as notas com fixadas no início seguidas por updatedAt descrescente', () => {
    const { result } = renderHook(() => useAcademicNotes())

    const notes = result.current.notes
    let seenUnpinned = false

    for (const note of notes) {
      if (!note.isPinned) {
        seenUnpinned = true
      }
      if (seenUnpinned) {
        expect(note.isPinned).toBe(false)
      }
    }
  })

  it('permite importar dados válidos e rejeita dados inválidos', () => {
    const { result } = renderHook(() => useAcademicNotes())

    const validData: AcademicData = {
      subjects: [{ id: 'sub-custom', name: 'História', color: 'amber' }],
      notes: [
        {
          id: 'note-c1',
          title: 'Revolução Industrial',
          content: 'Fases da industrialização',
          subjectId: 'sub-custom',
          status: 'mastered',
          tags: ['História'],
          isPinned: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      version: 1,
    }

    let success = false
    act(() => {
      success = result.current.importAcademicData(validData)
    })

    expect(success).toBe(true)
    expect(result.current.subjects).toHaveLength(1)
    expect(result.current.allNotesCount).toBe(1)

    // Tentar importar inválido
    let failureResult = true
    act(() => {
      failureResult = result.current.importAcademicData({
        invalido: true,
      } as unknown as AcademicData)
    })

    expect(failureResult).toBe(false)
    expect(result.current.subjects).toHaveLength(1)
  })

  it('reseta os dados para o seed padrão e permite exportar', () => {
    const { result } = renderHook(() => useAcademicNotes())
    const exportSpy = vi.spyOn(academicStorageService, 'exportJSON')

    act(() => {
      result.current.deleteNote(result.current.allNotes[0].id)
    })
    expect(result.current.allNotesCount).toBe(INITIAL_ACADEMIC_DATA.notes.length - 1)

    act(() => {
      result.current.resetToSeed()
    })
    expect(result.current.allNotesCount).toBe(INITIAL_ACADEMIC_DATA.notes.length)

    act(() => {
      result.current.exportAcademicData()
    })
    expect(exportSpy).toHaveBeenCalled()
  })
})
