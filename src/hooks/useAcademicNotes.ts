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

const DEFAULT_FILTERS: AcademicFilterState = {
  searchQuery: '',
  subjectId: 'all',
  status: 'all',
  tag: null,
  onlyPinned: false,
}

export function useAcademicNotes() {
  const [data, setData] = useState<AcademicData>(() => academicStorageService.load())
  const [filters, setFilters] = useState<AcademicFilterState>(DEFAULT_FILTERS)

  // Persist to localStorage whenever data changes
  useEffect(() => {
    academicStorageService.save(data)
  }, [data])

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

      return newNote
    },
    []
  )

  const updateNote = useCallback(
    (noteId: string, updates: Partial<Omit<AcademicNote, 'id' | 'createdAt'>>) => {
      const now = new Date().toISOString()
      setData((prev) => {
        const noteIndex = prev.notes.findIndex((n) => n.id === noteId)
        if (noteIndex === -1) return prev

        const currentNote = prev.notes[noteIndex]
        const updatedNote: AcademicNote = {
          ...currentNote,
          ...updates,
          updatedAt: now,
        }

        const newNotes = [...prev.notes]
        newNotes[noteIndex] = updatedNote
        return { ...prev, notes: newNotes }
      })
    },
    []
  )

  const deleteNote = useCallback((noteId: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }))
  }, [])

  const togglePinNote = useCallback((noteId: string) => {
    const now = new Date().toISOString()
    setData((prev) => {
      const noteIndex = prev.notes.findIndex((n) => n.id === noteId)
      if (noteIndex === -1) return prev

      const currentNote = prev.notes[noteIndex]
      const updatedNote: AcademicNote = {
        ...currentNote,
        isPinned: !currentNote.isPinned,
        updatedAt: now,
      }

      const newNotes = [...prev.notes]
      newNotes[noteIndex] = updatedNote
      return { ...prev, notes: newNotes }
    })
  }, [])

  const addSubject = useCallback((subjectInput: Omit<Subject, 'id'>): Subject => {
    const newSubject: Subject = {
      ...subjectInput,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    }

    setData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }))

    return newSubject
  }, [])

  const updateSubject = useCallback(
    (subjectId: string, updates: Partial<Omit<Subject, 'id'>>) => {
      setData((prev) => {
        const subjectIndex = prev.subjects.findIndex((s) => s.id === subjectId)
        if (subjectIndex === -1) return prev

        const currentSubject = prev.subjects[subjectIndex]
        const updatedSubject: Subject = {
          ...currentSubject,
          ...updates,
        }

        const newSubjects = [...prev.subjects]
        newSubjects[subjectIndex] = updatedSubject
        return { ...prev, subjects: newSubjects }
      })
    },
    []
  )

  const deleteSubject = useCallback((subjectId: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== subjectId),
      notes: prev.notes.filter((n) => n.subjectId !== subjectId),
    }))
  }, [])

  const exportAcademicData = useCallback(() => {
    academicStorageService.exportJSON(data)
  }, [data])

  const importAcademicData = useCallback((newData: AcademicData): boolean => {
    if (academicStorageService.validateJSON(newData)) {
      setData(newData)
      return true
    }
    return false
  }, [])

  const resetToSeed = useCallback(() => {
    setData(INITIAL_ACADEMIC_DATA)
  }, [])

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
    togglePinNote,
    addSubject,
    updateSubject,
    deleteSubject,
    exportAcademicData,
    importAcademicData,
    resetToSeed,
  }
}
