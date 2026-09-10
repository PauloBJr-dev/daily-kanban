import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { useAcademicNotes } from '../hooks/useAcademicNotes'
import { academicStorageService } from '../services/academicStorageService'
import { INITIAL_ACADEMIC_DATA } from '../services/academicSeedData'
import { supabaseAcademicService } from '../services/supabaseAcademicService'
import { AuthContext, type AuthContextType } from '../context/AuthContext'
import type { AcademicData, AcademicNote } from '../types/academic'
import type { User } from '@supabase/supabase-js'

const mockAuthUser: User = {
  id: 'user-academic-test',
  app_metadata: {},
  user_metadata: { full_name: 'Academic Tester' },
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

describe('useAcademicNotes', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('Modo Visitante (Offline / Sem Usuário)', () => {
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

      expect(result.current.allTags.length).toBe(0)
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

      let noteToUpdate: AcademicNote | undefined
      act(() => {
        noteToUpdate = result.current.addNote({
          title: 'Nota Inicial',
          content: 'Conteúdo inicial',
          subjectId: 'sub-calc',
          status: 'to_review',
          tags: ['Teste'],
          isPinned: false,
        })
      })

      act(() => {
        result.current.updateNote(noteToUpdate!.id, {
          title: 'Título Modificado com Sucesso',
          status: 'mastered',
        })
      })

      const updated = result.current.allNotes.find((n) => n.id === noteToUpdate!.id)
      expect(updated?.title).toBe('Título Modificado com Sucesso')
      expect(updated?.status).toBe('mastered')

      act(() => {
        result.current.deleteNote(noteToUpdate!.id)
      })

      expect(
        result.current.allNotes.find((n) => n.id === noteToUpdate!.id)
      ).toBeUndefined()
    })

    it('permite alternar o status de fixação (pin) de uma nota', () => {
      const { result } = renderHook(() => useAcademicNotes())

      let note: AcademicNote | undefined
      act(() => {
        note = result.current.addNote({
          title: 'Nota Pin',
          content: 'Conteúdo',
          subjectId: 'sub-calc',
          status: 'to_review',
          tags: ['Pin'],
          isPinned: false,
        })
      })

      const initialPinned = note!.isPinned

      act(() => {
        result.current.togglePinNote(note!.id)
      })

      const afterToggle = result.current.allNotes.find((n) => n.id === note!.id)
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
      expect(result.current.allNotes.some((n) => n.subjectId === newSubjectId)).toBe(
        false
      )
    })

    it('filtra notas por busca textual em título, conteúdo e tags', () => {
      const { result } = renderHook(() => useAcademicNotes())

      act(() => {
        result.current.addNote({
          title: 'Algoritmos em Grafos: Dijkstra',
          content: 'Caminho mínimo em grafos ponderados.',
          subjectId: 'sub-eda',
          status: 'mastered',
          tags: ['Grafos', 'Algoritmos'],
          isPinned: false,
        })
        result.current.addNote({
          title: 'Camada de Transporte',
          content: 'TCP vs UDP e Handshake de 3 Vias',
          subjectId: 'sub-redes',
          status: 'in_progress',
          tags: ['Redes', 'TCP/IP'],
          isPinned: false,
        })
        result.current.addNote({
          title: 'Redes Neurais',
          content: 'Gradiente Descendente e Otimizadores',
          subjectId: 'sub-ia',
          status: 'to_review',
          tags: ['Deep Learning', 'Machine Learning'],
          isPinned: false,
        })
      })

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

      act(() => {
        result.current.addNote({
          title: 'Nota de Cálculo',
          content: 'Derivadas',
          subjectId: 'sub-calc',
          status: 'mastered',
          tags: ['Cálculo'],
          isPinned: true,
        })
        result.current.addNote({
          title: 'Nota de Algoritmos',
          content: 'Árvores',
          subjectId: 'sub-eda',
          status: 'to_review',
          tags: ['ED'],
          isPinned: false,
        })
      })

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

      act(() => {
        result.current.addNote({
          title: 'Nota Antiga Não Fixada',
          content: '',
          subjectId: 'sub-calc',
          status: 'to_review',
          tags: [],
          isPinned: false,
        })
        result.current.addNote({
          title: 'Nota Nova Fixada',
          content: '',
          subjectId: 'sub-calc',
          status: 'to_review',
          tags: [],
          isPinned: true,
        })
      })

      const notes = result.current.notes
      let seenUnpinned = false

      for (const note of notes) {
        if (!note.isPinned) {
          seenUnpinned = true
        } else if (seenUnpinned) {
          expect(note.isPinned).toBe(false)
        }
      }
    })

    it('permite importar dados válidos e rejeita dados inválidos', () => {
      const { result } = renderHook(() => useAcademicNotes())

      const validPayload: AcademicData = {
        subjects: [
          {
            id: 'sub-import',
            name: 'Mecânica Quântica',
            color: 'sky',
            code: 'FIS-401',
          },
        ],
        notes: [
          {
            id: 'note-import-1',
            title: 'Equações de Maxwell',
            content: 'Eletromagnetismo avançado.',
            subjectId: 'sub-import',
            status: 'mastered',
            tags: ['Física'],
            isPinned: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        version: 1,
      }

      let successResult = false
      act(() => {
        successResult = result.current.importAcademicData(validPayload)
      })

      expect(successResult).toBe(true)
      expect(result.current.subjects[0].name).toBe('Mecânica Quântica')
      expect(result.current.notes[0].title).toBe('Equações de Maxwell')

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

      let note: AcademicNote | undefined
      act(() => {
        note = result.current.addNote({
          title: 'Nota para Deletar',
          content: 'Conteúdo',
          subjectId: 'sub-calc',
          status: 'to_review',
          tags: [],
          isPinned: false,
        })
      })
      expect(result.current.allNotesCount).toBe(1)

      act(() => {
        result.current.deleteNote(note!.id)
      })
      expect(result.current.allNotesCount).toBe(0)

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

  describe('Modo Autenticado (Sincronização em Nuvem Supabase)', () => {
    it('carrega dados acadêmicos da nuvem ao montar quando existem no Supabase', async () => {
      const mockCloudSubjects = [
        { id: 'sub-cloud', name: 'Inteligência Artificial', color: 'purple' },
      ]
      const mockCloudNotes = [
        {
          id: 'note-cloud-1',
          title: 'Redes Neurais Convolucionais',
          content: 'Camadas convolucionais e pooling.',
          subjectId: 'sub-cloud',
          status: 'in_progress' as const,
          tags: ['IA', 'Visão Computacional'],
          isPinned: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      vi.spyOn(supabaseAcademicService, 'fetchAcademicData').mockResolvedValueOnce({
        subjects: mockCloudSubjects,
        notes: mockCloudNotes,
        version: 1,
      })

      const { result } = renderHook(() => useAcademicNotes(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(result.current.subjects).toEqual(mockCloudSubjects)
        expect(result.current.notes).toEqual(mockCloudNotes)
      })
    })

    it('faz upload automático dos dados locais se o Supabase estiver vazio na primeira conexão', async () => {
      vi.spyOn(supabaseAcademicService, 'fetchAcademicData').mockResolvedValueOnce({
        subjects: [],
        notes: [],
        version: 1,
      })
      const uploadSpy = vi
        .spyOn(supabaseAcademicService, 'uploadLocalData')
        .mockResolvedValue()

      renderHook(() => useAcademicNotes(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(uploadSpy).toHaveBeenCalled()
      })
    })

    it('dispara syncNote em background de forma otimista ao adicionar e atualizar anotação', async () => {
      vi.spyOn(supabaseAcademicService, 'fetchAcademicData').mockResolvedValueOnce({
        subjects: INITIAL_ACADEMIC_DATA.subjects,
        notes: INITIAL_ACADEMIC_DATA.notes,
        version: 1,
      })
      const syncNoteSpy = vi
        .spyOn(supabaseAcademicService, 'syncNote')
        .mockResolvedValue()

      const { result } = renderHook(() => useAcademicNotes(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(result.current.allNotesCount).toBe(INITIAL_ACADEMIC_DATA.notes.length)
      })

      let addedNote: any
      act(() => {
        addedNote = result.current.addNote({
          title: 'Nota Sincronizada',
          content: 'Conteúdo nuvem.',
          subjectId: 'sub-calc',
          status: 'to_review',
          tags: ['Cloud'],
          isPinned: false,
        })
      })

      expect(syncNoteSpy).toHaveBeenCalledWith(
        'user-academic-test',
        expect.objectContaining({
          title: 'Nota Sincronizada',
        })
      )

      act(() => {
        result.current.updateNote(addedNote.id, {
          title: 'Nota Sincronizada (Atualizada)',
        })
      })

      expect(syncNoteSpy).toHaveBeenCalledWith(
        'user-academic-test',
        expect.objectContaining({
          title: 'Nota Sincronizada (Atualizada)',
        })
      )
    })

    it('dispara deleteNote em background de forma otimista ao deletar anotação', async () => {
      const cloudNote: AcademicNote = {
        id: 'note-cloud-del-1',
        title: 'Nota Nuvem a Deletar',
        content: 'Conteúdo',
        subjectId: 'sub-calc',
        status: 'in_progress',
        tags: [],
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.spyOn(supabaseAcademicService, 'fetchAcademicData').mockResolvedValueOnce({
        subjects: INITIAL_ACADEMIC_DATA.subjects,
        notes: [cloudNote],
        version: 1,
      })
      const deleteNoteSpy = vi
        .spyOn(supabaseAcademicService, 'deleteNote')
        .mockResolvedValue()

      const { result } = renderHook(() => useAcademicNotes(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(result.current.allNotesCount).toBe(1)
      })

      const targetId = result.current.notes[0].id

      act(() => {
        result.current.deleteNote(targetId)
      })

      expect(result.current.notes.some((n) => n.id === targetId)).toBe(false)
      expect(deleteNoteSpy).toHaveBeenCalledWith(targetId)
    })

    it('dispara syncSubject e deleteSubject em background ao adicionar e deletar disciplina', async () => {
      vi.spyOn(supabaseAcademicService, 'fetchAcademicData').mockResolvedValueOnce({
        subjects: INITIAL_ACADEMIC_DATA.subjects,
        notes: INITIAL_ACADEMIC_DATA.notes,
        version: 1,
      })
      const syncSubjectSpy = vi
        .spyOn(supabaseAcademicService, 'syncSubject')
        .mockResolvedValue()
      const deleteSubjectSpy = vi
        .spyOn(supabaseAcademicService, 'deleteSubject')
        .mockResolvedValue()

      const { result } = renderHook(() => useAcademicNotes(), { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(result.current.subjects.length).toBe(INITIAL_ACADEMIC_DATA.subjects.length)
      })

      let addedSub: any
      act(() => {
        addedSub = result.current.addSubject({
          name: 'Matéria Nuvem',
          color: 'indigo',
          code: 'NUV-101',
        })
      })

      expect(result.current.subjects.some((s) => s.id === addedSub.id)).toBe(true)
      expect(syncSubjectSpy).toHaveBeenCalledWith(
        'user-academic-test',
        expect.any(Object)
      )

      act(() => {
        result.current.deleteSubject(addedSub.id)
      })

      expect(result.current.subjects.some((s) => s.id === addedSub.id)).toBe(false)
      expect(deleteSubjectSpy).toHaveBeenCalledWith(addedSub.id)
    })
  })
})
