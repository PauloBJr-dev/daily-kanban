import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  fetchAcademicData,
  syncSubject,
  deleteSubject,
  syncNote,
  deleteNote,
  uploadLocalData,
  supabaseAcademicService,
} from '../services/supabaseAcademicService'
import type { AcademicData, AcademicNote, Subject } from '../types/academic'

describe('supabaseAcademicService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchAcademicData', () => {
    it('busca e mapeia disciplinas e anotações do Supabase com sucesso', async () => {
      const mockSubjects = [
        {
          id: 'sub-calc',
          user_id: 'user-xyz',
          name: 'Cálculo Diferencial',
          color: 'indigo',
          code: 'MAT-101',
          icon: 'calculator',
          created_at: '2026-09-01T00:00:00.000Z',
          updated_at: '2026-09-01T00:00:00.000Z',
        },
      ]

      const mockNotes = [
        {
          id: 'note-1',
          user_id: 'user-xyz',
          subject_id: 'sub-calc',
          title: 'Derivadas Parciais',
          content: 'Regra da cadeia',
          status: 'in_progress',
          tags: ['Cálculo', 'Derivadas'],
          is_pinned: true,
          exam_date: '2026-09-20',
          review_date: '2026-09-15',
          created_at: '2026-09-01T00:00:00.000Z',
          updated_at: '2026-09-05T00:00:00.000Z',
        },
      ]

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'subjects') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockSubjects, error: null }),
          } as any
        }
        if (table === 'academic_notes') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockNotes, error: null }),
          } as any
        }
        return {} as any
      })

      const result = await fetchAcademicData('user-xyz')

      expect(result.subjects).toHaveLength(1)
      expect(result.subjects[0]).toEqual({
        id: 'sub-calc',
        name: 'Cálculo Diferencial',
        color: 'indigo',
        code: 'MAT-101',
        icon: 'calculator',
      })

      expect(result.notes).toHaveLength(1)
      expect(result.notes[0]).toEqual({
        id: 'note-1',
        title: 'Derivadas Parciais',
        content: 'Regra da cadeia',
        subjectId: 'sub-calc',
        status: 'in_progress',
        tags: ['Cálculo', 'Derivadas'],
        isPinned: true,
        examDate: '2026-09-20',
        reviewDate: '2026-09-15',
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-05T00:00:00.000Z',
      })
      expect(result.version).toBe(1)
    })

    it('lança erro quando busca de matérias falha', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Erro ao buscar matérias'),
        }),
      } as any)

      await expect(fetchAcademicData('user-xyz')).rejects.toThrow(
        'Erro ao buscar matérias'
      )
    })
  })

  describe('syncSubject & deleteSubject', () => {
    it('faz upsert da disciplina com payload correto', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null })
      vi.spyOn(supabase, 'from').mockReturnValue({
        upsert: upsertMock,
      } as any)

      const subject: Subject = {
        id: 'sub-prog',
        name: 'Algoritmos',
        color: 'emerald',
        code: 'CC-102',
      }

      await syncSubject('user-xyz', subject)

      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'sub-prog',
          user_id: 'user-xyz',
          name: 'Algoritmos',
          color: 'emerald',
          code: 'CC-102',
        }),
        { onConflict: 'id,user_id' }
      )
    })

    it('lança erro quando syncSubject falha', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        upsert: vi
          .fn()
          .mockResolvedValue({ error: new Error('Erro ao salvar disciplina') }),
      } as any)

      const subject: Subject = {
        id: 'sub-err',
        name: 'Erro',
        color: 'rose',
      }

      await expect(syncSubject('user-xyz', subject)).rejects.toThrow(
        'Erro ao salvar disciplina'
      )
    })

    it('deleta disciplina e notas vinculadas', async () => {
      const deleteMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })
      vi.spyOn(supabase, 'from').mockReturnValue({
        delete: deleteMock,
      } as any)

      await deleteSubject('sub-prog')
      expect(deleteMock).toHaveBeenCalled()
    })
  })

  describe('syncNote & deleteNote', () => {
    it('faz upsert da anotação com campos mapeados', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null })
      vi.spyOn(supabase, 'from').mockReturnValue({
        upsert: upsertMock,
      } as any)

      const note: AcademicNote = {
        id: 'note-alg',
        title: 'Grafos e DFS',
        content: 'Busca em profundidade',
        subjectId: 'sub-prog',
        status: 'mastered',
        tags: ['Grafos'],
        isPinned: false,
        createdAt: '2026-09-08T00:00:00.000Z',
        updatedAt: '2026-09-08T00:00:00.000Z',
      }

      await syncNote('user-xyz', note)

      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'note-alg',
          user_id: 'user-xyz',
          subject_id: 'sub-prog',
          title: 'Grafos e DFS',
          status: 'mastered',
        }),
        { onConflict: 'id,user_id' }
      )
    })

    it('deleta anotação por ID', async () => {
      const eqMock = vi.fn().mockResolvedValue({ error: null })
      vi.spyOn(supabase, 'from').mockReturnValue({
        delete: vi.fn().mockReturnValue({ eq: eqMock }),
      } as any)

      await deleteNote('note-alg')
      expect(eqMock).toHaveBeenCalledWith('id', 'note-alg')
    })
  })

  describe('uploadLocalData', () => {
    it('faz upload de matérias e notas locais para o Supabase', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null })
      vi.spyOn(supabase, 'from').mockReturnValue({
        upsert: upsertMock,
      } as any)

      const localData: AcademicData = {
        subjects: [{ id: 'sub-1', name: 'Física', color: 'blue' }],
        notes: [
          {
            id: 'note-1',
            title: 'Termodinâmica',
            content: 'Leis da física',
            subjectId: 'sub-1',
            status: 'to_review',
            tags: [],
            isPinned: false,
            createdAt: '2026-09-01T00:00:00.000Z',
            updatedAt: '2026-09-01T00:00:00.000Z',
          },
        ],
        version: 1,
      }

      await uploadLocalData('user-xyz', localData)
      expect(upsertMock).toHaveBeenCalledTimes(2)
    })
  })

  it('exporta supabaseAcademicService com todos os métodos', () => {
    expect(supabaseAcademicService.fetchAcademicData).toBeDefined()
    expect(supabaseAcademicService.syncSubject).toBeDefined()
    expect(supabaseAcademicService.deleteSubject).toBeDefined()
    expect(supabaseAcademicService.syncNote).toBeDefined()
    expect(supabaseAcademicService.deleteNote).toBeDefined()
    expect(supabaseAcademicService.uploadLocalData).toBeDefined()
  })
})
