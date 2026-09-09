import { useState, useEffect, useMemo, useCallback } from 'react'
import type {
  AcademicData,
  AcademicFilterState,
  AcademicNote,
  AcademicStats,
  Subject,
} from '../types/academic'
import { academicStorageService } from '../services/academicStorageService'
import { INITIAL_ACADEMIC_DATA } from '../services/academicSeedData'
import { useAuth } from './useAuth'
import { supabaseAcademicService } from '../services/supabaseAcademicService'

const DEFAULT_FILTERS: AcademicFilterState = {
  searchQuery: '',
  subjectId: 'all',
  status: 'all',
  tag: null,
  onlyPinned: false,
}

export function useAcademicNotes() {
  const { user } = useAuth(false)
  const userId = user?.id ?? null

  const [data, setData] = useState<AcademicData>(() => academicStorageService.load())
  const [filters, setFilters] = useState<AcademicFilterState>(DEFAULT_FILTERS)

  // Synchronize with Supabase when user is authenticated
  useEffect(() => {
    let isMounted = true

    async function syncData() {
      if (!userId) {
        return
      }

      try {
        const cloudData = await supabaseAcademicService.fetchAcademicData(userId)
        if (!isMounted) return

        // Se o Supabase estiver vazio e houver dados locais, fazer upload automático dos dados locais
        if (cloudData.subjects.length === 0 && cloudData.notes.length === 0) {
          const localData = academicStorageService.load()
          if (localData.subjects.length > 0 || localData.notes.length > 0) {
            await supabaseAcademicService.uploadLocalData(userId, localData)
            setData(localData)
            return
          }
        }

        setData(cloudData)
      } catch (err) {
        console.error('Erro ao carregar dados acadêmicos do Supabase:', err)
      }
    }

    void syncData()

    return () => {
      isMounted = false
    }
  }, [userId])

  // Persist to localStorage whenever data changes (visitor mode)
  useEffect(() => {
    if (!userId) {
      academicStorageService.save(data)
    }
  }, [data, userId])

  const addNote = useCallback(
    (noteInput: Omit<AcademicNote, 'id' | 'createdAt' | 'updatedAt'>): AcademicNote => {
      const now = new Date().toISOString()
      const newNote: AcademicNote = {
        ...noteInput,
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      }

      setData((prev) => ({
        ...prev,
        notes: [newNote, ...prev.notes],
      }))

      if (userId) {
        supabaseAcademicService.syncNote(userId, newNote).catch((err) => {
          console.error('Erro ao sincronizar nova anotação no Supabase:', err)
        })
      }

      return newNote
    },
    [userId]
  )

  const updateNote = useCallback(
    (noteId: string, updates: Partial<Omit<AcademicNote, 'id' | 'createdAt'>>) => {
      const now = new Date().toISOString()
      const currentNote = data.notes.find((n) => n.id === noteId)
      if (!currentNote) return

      const updatedNote: AcademicNote = {
        ...currentNote,
        ...updates,
        updatedAt: now,
      }

      setData((prev) => {
        const noteIndex = prev.notes.findIndex((n) => n.id === noteId)
        if (noteIndex === -1) return prev

        const newNotes = [...prev.notes]
        newNotes[noteIndex] = updatedNote
        return { ...prev, notes: newNotes }
      })

      if (userId) {
        supabaseAcademicService.syncNote(userId, updatedNote).catch((err) => {
          console.error('Erro ao sincronizar atualização de anotação no Supabase:', err)
        })
      }
    },
    [data.notes, userId]
  )

  const deleteNote = useCallback(
    (noteId: string) => {
      setData((prev) => ({
        ...prev,
        notes: prev.notes.filter((n) => n.id !== noteId),
      }))

      if (userId) {
        supabaseAcademicService.deleteNote(noteId).catch((err) => {
          console.error('Erro ao deletar anotação no Supabase:', err)
        })
      }
    },
    [userId]
  )

  const restoreNote = useCallback(
    (noteToRestore: AcademicNote) => {
      setData((prev) => {
        if (prev.notes.some((n) => n.id === noteToRestore.id)) return prev
        return {
          ...prev,
          notes: [noteToRestore, ...prev.notes],
        }
      })

      if (userId) {
        supabaseAcademicService.syncNote(userId, noteToRestore).catch((err) => {
          console.error('Erro ao sincronizar anotação restaurada no Supabase:', err)
        })
      }
    },
    [userId]
  )

  const togglePinNote = useCallback(
    (noteId: string) => {
      const now = new Date().toISOString()
      const currentNote = data.notes.find((n) => n.id === noteId)
      if (!currentNote) return

      const updatedNote: AcademicNote = {
        ...currentNote,
        isPinned: !currentNote.isPinned,
        updatedAt: now,
      }

      setData((prev) => {
        const noteIndex = prev.notes.findIndex((n) => n.id === noteId)
        if (noteIndex === -1) return prev

        const newNotes = [...prev.notes]
        newNotes[noteIndex] = updatedNote
        return { ...prev, notes: newNotes }
      })

      if (userId) {
        supabaseAcademicService.syncNote(userId, updatedNote).catch((err) => {
          console.error('Erro ao sincronizar pin de anotação no Supabase:', err)
        })
      }
    },
    [data.notes, userId]
  )

  const addSubject = useCallback(
    (subjectInput: Omit<Subject, 'id'>): Subject => {
      const newSubject: Subject = {
        ...subjectInput,
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      }

      setData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, newSubject],
      }))

      if (userId) {
        supabaseAcademicService.syncSubject(userId, newSubject).catch((err) => {
          console.error('Erro ao sincronizar nova disciplina no Supabase:', err)
        })
      }

      return newSubject
    },
    [userId]
  )

  const updateSubject = useCallback(
    (subjectId: string, updates: Partial<Omit<Subject, 'id'>>) => {
      const currentSubject = data.subjects.find((s) => s.id === subjectId)
      if (!currentSubject) return

      const updatedSubject: Subject = {
        ...currentSubject,
        ...updates,
      }

      setData((prev) => {
        const subjectIndex = prev.subjects.findIndex((s) => s.id === subjectId)
        if (subjectIndex === -1) return prev

        const newSubjects = [...prev.subjects]
        newSubjects[subjectIndex] = updatedSubject
        return { ...prev, subjects: newSubjects }
      })

      if (userId) {
        supabaseAcademicService.syncSubject(userId, updatedSubject).catch((err) => {
          console.error('Erro ao sincronizar atualização de disciplina no Supabase:', err)
        })
      }
    },
    [data.subjects, userId]
  )

  const deleteSubject = useCallback(
    (subjectId: string) => {
      setData((prev) => ({
        ...prev,
        subjects: prev.subjects.filter((s) => s.id !== subjectId),
        notes: prev.notes.filter((n) => n.subjectId !== subjectId),
      }))

      if (userId) {
        supabaseAcademicService.deleteSubject(subjectId).catch((err) => {
          console.error('Erro ao deletar disciplina no Supabase:', err)
        })
      }
    },
    [userId]
  )

  const exportAcademicData = useCallback(() => {
    academicStorageService.exportJSON(data)
  }, [data])

  const importAcademicData = useCallback(
    (newData: AcademicData): boolean => {
      if (academicStorageService.validateJSON(newData)) {
        setData(newData)
        if (userId) {
          supabaseAcademicService.uploadLocalData(userId, newData).catch((err) => {
            console.error(
              'Erro ao sincronizar dados acadêmicos importados no Supabase:',
              err
            )
          })
        }
        return true
      }
      return false
    },
    [userId]
  )

  const resetToSeed = useCallback(() => {
    setData(INITIAL_ACADEMIC_DATA)
    if (userId) {
      supabaseAcademicService
        .uploadLocalData(userId, INITIAL_ACADEMIC_DATA)
        .catch((err) => {
          console.error('Erro ao sincronizar reset acadêmico no Supabase:', err)
        })
    }
  }, [userId])

  // All unique tags available in notes
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    data.notes.forEach((n) => n.tags.forEach((t) => tagsSet.add(t)))
    return Array.from(tagsSet).sort()
  }, [data.notes])

  // Filtered and sorted notes
  const filteredNotes = useMemo(() => {
    const filtered = data.notes.filter((note) => {
      // Search query (title, content, tags)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim()
        const matchesTitle = note.title.toLowerCase().includes(query)
        const matchesContent = note.content.toLowerCase().includes(query)
        const matchesTag = note.tags.some((t) => t.toLowerCase().includes(query))
        if (!matchesTitle && !matchesContent && !matchesTag) {
          return false
        }
      }

      // Subject filter
      if (filters.subjectId !== 'all' && note.subjectId !== filters.subjectId) {
        return false
      }

      // Status filter
      if (filters.status !== 'all' && note.status !== filters.status) {
        return false
      }

      // Tag filter
      if (filters.tag && !note.tags.includes(filters.tag)) {
        return false
      }

      // Only pinned filter
      if (filters.onlyPinned && !note.isPinned) {
        return false
      }

      return true
    })

    // Sort: pinned first, then updatedAt descending
    return [...filtered].sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [data.notes, filters])

  // Computed statistics
  const stats = useMemo<AcademicStats>(() => {
    const totalNotes = data.notes.length
    let toReviewCount = 0
    let inProgressCount = 0
    let masteredCount = 0
    let pinnedCount = 0

    for (const note of data.notes) {
      if (note.status === 'to_review') toReviewCount++
      else if (note.status === 'in_progress') inProgressCount++
      else if (note.status === 'mastered') masteredCount++

      if (note.isPinned) pinnedCount++
    }

    return {
      totalNotes,
      toReviewCount,
      inProgressCount,
      masteredCount,
      subjectsCount: data.subjects.length,
      pinnedCount,
    }
  }, [data.notes, data.subjects])

  return {
    subjects: data.subjects,
    notes: filteredNotes,
    allNotes: data.notes,
    allNotesCount: data.notes.length,
    filters,
    setFilters,
    allTags,
    stats,
    addNote,
    updateNote,
    deleteNote,
    restoreNote,
    togglePinNote,
    addSubject,
    updateSubject,
    deleteSubject,
    exportAcademicData,
    importAcademicData,
    resetToSeed,
  }
}
