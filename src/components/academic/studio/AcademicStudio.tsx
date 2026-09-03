import React, { useState, useMemo, useCallback, useEffect } from 'react'
import type { AcademicNote, Subject } from '../../../types/academic'
import { useAcademicNotes } from '../../../hooks/useAcademicNotes'
import { StudioSidebar } from './StudioSidebar'
import { StudioEditor } from './StudioEditor'

export interface AcademicStudioProps {
  notes?: AcademicNote[]
  subjects?: Subject[]
  selectedNoteId?: string | null
  onSelectNote?: (id: string | null) => void
  onUpdateNote?: (id: string, updates: Partial<AcademicNote>) => void
  onDeleteNote?: (id: string) => void
  onTogglePin?: (id: string) => void
  onNewNote?: () => void | AcademicNote
  onBackToGrid?: () => void
  className?: string
  isZenMode?: boolean
  onZenModeChange?: (isZen: boolean) => void
}

export const AcademicStudio: React.FC<AcademicStudioProps> = ({
  notes: propNotes,
  subjects: propSubjects,
  selectedNoteId: propSelectedNoteId,
  onSelectNote: propOnSelectNote,
  onUpdateNote: propOnUpdateNote,
  onDeleteNote: propOnDeleteNote,
  onTogglePin: propOnTogglePin,
  onNewNote: propOnNewNote,
  onBackToGrid,
  className = '',
  isZenMode: propIsZenMode,
  onZenModeChange: propOnZenModeChange,
}) => {
  // Hook data fallback when props are not provided
  const hookData = useAcademicNotes()

  const notes = propNotes ?? hookData.allNotes
  const subjects = propSubjects ?? hookData.subjects

  // Internal selection state
  const [internalSelectedNoteId, setInternalSelectedNoteId] = useState<string | null>(
    null
  )

  // Derived selected note ID: controlled prop has priority, else internal state, else first note
  const effectiveSelectedNoteId =
    propSelectedNoteId !== undefined && propSelectedNoteId !== null
      ? propSelectedNoteId
      : (internalSelectedNoteId ?? notes[0]?.id ?? null)

  // Studio UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | 'all'>('all')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [internalZenMode, setInternalZenMode] = useState(false)
  const isZenMode = propIsZenMode !== undefined ? propIsZenMode : internalZenMode

  const handleToggleZenMode = useCallback(() => {
    const next = !isZenMode
    if (propIsZenMode === undefined) {
      setInternalZenMode(next)
    }
    propOnZenModeChange?.(next)
  }, [isZenMode, propIsZenMode, propOnZenModeChange])

  const handleExitZenMode = useCallback(() => {
    if (propIsZenMode === undefined) {
      setInternalZenMode(false)
    }
    propOnZenModeChange?.(false)
  }, [propIsZenMode, propOnZenModeChange])

  // Exit Zen Mode on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        handleExitZenMode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isZenMode, handleExitZenMode])

  // Active note with fallback to first note or null
  const activeNote = useMemo<AcademicNote | null>(() => {
    if (notes.length === 0) return null
    if (effectiveSelectedNoteId) {
      const found = notes.find((n) => n.id === effectiveSelectedNoteId)
      if (found) return found
    }
    return notes[0] || null
  }, [notes, effectiveSelectedNoteId])

  const handleSelectNote = useCallback(
    (id: string) => {
      setInternalSelectedNoteId(id)
      propOnSelectNote?.(id)
    },
    [propOnSelectNote]
  )

  const handleUpdateNote = useCallback(
    (id: string, updates: Partial<AcademicNote>) => {
      if (propOnUpdateNote) {
        propOnUpdateNote(id, updates)
      } else {
        hookData.updateNote(id, updates)
      }
    },
    [propOnUpdateNote, hookData]
  )

  const handleDeleteNote = useCallback(
    (id: string) => {
      if (propOnDeleteNote) {
        propOnDeleteNote(id)
      } else {
        hookData.deleteNote(id)
      }

      // If active note was deleted, select next available or null
      if (activeNote?.id === id) {
        const remaining = notes.filter((n) => n.id !== id)
        const nextId = remaining[0]?.id ?? null
        setInternalSelectedNoteId(nextId)
        propOnSelectNote?.(nextId)
      }
    },
    [propOnDeleteNote, hookData, activeNote?.id, notes, propOnSelectNote]
  )

  const handleTogglePin = useCallback(
    (id: string) => {
      if (propOnTogglePin) {
        propOnTogglePin(id)
      } else {
        hookData.togglePinNote(id)
      }
    },
    [propOnTogglePin, hookData]
  )

  const handleNewNote = useCallback(() => {
    if (propOnNewNote) {
      const created = propOnNewNote()
      if (created && typeof created === 'object' && 'id' in created) {
        setInternalSelectedNoteId((created as AcademicNote).id)
        propOnSelectNote?.((created as AcademicNote).id)
      }
    } else {
      const targetSubjectId =
        selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || ''
      const newNote = hookData.addNote({
        title: 'Nova Anotação',
        content: '',
        subjectId: targetSubjectId,
        status: 'to_review',
        tags: [],
        isPinned: false,
      })
      setInternalSelectedNoteId(newNote.id)
      propOnSelectNote?.(newNote.id)
    }
  }, [propOnNewNote, selectedSubjectId, subjects, hookData, propOnSelectNote])

  return (
    <div
      className={`flex ${
        isZenMode
          ? 'h-screen rounded-none border-0'
          : 'h-[calc(100vh-8rem)] min-h-[600px] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800'
      } w-full bg-white dark:bg-slate-950 shadow-sm overflow-hidden ${className}`}
    >
      {/* Sidebar (Hidden in Zen Mode) */}
      {!isZenMode && (
        <StudioSidebar
          notes={notes}
          subjects={subjects}
          selectedNoteId={activeNote?.id ?? null}
          onSelectNote={handleSelectNote}
          onNewNote={handleNewNote}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={setSelectedSubjectId}
        />
      )}

      {/* Main Canvas Editor */}
      <StudioEditor
        note={activeNote}
        subjects={subjects}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
        onTogglePin={handleTogglePin}
        isZenMode={isZenMode}
        onToggleZenMode={handleToggleZenMode}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onBackToGrid={onBackToGrid}
        onNewNote={handleNewNote}
      />
    </div>
  )
}
