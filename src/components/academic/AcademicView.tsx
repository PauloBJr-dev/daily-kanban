import React, { useState, useRef, useCallback, useMemo } from 'react'
import { Plus, SearchX, FilePlus, Sparkles } from 'lucide-react'
import { useAcademicNotes } from '../../hooks/useAcademicNotes'
import { useToast } from '../../hooks/useToast'
import { AcademicStats } from './AcademicStats'
import { AcademicFilterBar } from './AcademicFilterBar'
import { NoteCard } from './NoteCard'
import { NoteModal } from './NoteModal'
import { SubjectManagerModal } from './SubjectManagerModal'
import { ConfirmDialog } from '../ConfirmDialog'
import { AcademicStudio } from './studio/AcademicStudio'
import type { AcademicNote, Subject } from '../../types/academic'

export interface AcademicViewHandle {
  openNewNote: (subjectId?: string) => void
  focusSearch: () => void
  setLayoutMode: (mode: 'grid' | 'studio') => void
}

export interface AcademicViewProps {
  className?: string
  isZenMode?: boolean
  onZenModeChange?: (isZen: boolean) => void
  layoutMode?: 'grid' | 'studio'
  onLayoutModeChange?: (mode: 'grid' | 'studio') => void
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
}

export const AcademicView = React.forwardRef<AcademicViewHandle, AcademicViewProps>(
  (props, ref) => {
    const {
      className = '',
      isZenMode: propIsZenMode,
      onZenModeChange: propOnZenModeChange,
      layoutMode: propLayoutMode,
      onLayoutModeChange: propOnLayoutModeChange,
      viewMode: propViewMode,
      onViewModeChange: propOnViewModeChange,
    } = props
    const {
      subjects,
      notes,
      allNotes,
      allNotesCount,
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
      deleteSubject,
      resetToSeed,
    } = useAcademicNotes()

    const toast = useToast()

    // Zen Mode (controlled / uncontrolled fallback)
    const [internalZenMode, setInternalZenMode] = useState(false)
    const isZenMode = propIsZenMode !== undefined ? propIsZenMode : internalZenMode

    const handleZenModeChange = useCallback(
      (zen: boolean) => {
        if (propIsZenMode === undefined) {
          setInternalZenMode(zen)
        }
        propOnZenModeChange?.(zen)
      },
      [propIsZenMode, propOnZenModeChange]
    )

    // Layout mode: 'grid' (standard cards) or 'studio' (immersive split editor)
    const [layoutMode, setLayoutMode] = useState<'grid' | 'studio'>(() => {
      if (propLayoutMode) return propLayoutMode
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dailyflow_academic_layout_mode')
        if (saved === 'grid' || saved === 'studio') return saved
      }
      return 'grid'
    })

    const [prevLayoutProp, setPrevLayoutProp] = useState(propLayoutMode)
    if (propLayoutMode && propLayoutMode !== prevLayoutProp) {
      setPrevLayoutProp(propLayoutMode)
      setLayoutMode(propLayoutMode)
    }

    const handleLayoutModeChange = useCallback(
      (mode: 'grid' | 'studio') => {
        setLayoutMode(mode)
        if (typeof window !== 'undefined') {
          localStorage.setItem('dailyflow_academic_layout_mode', mode)
        }
        propOnLayoutModeChange?.(mode)
        if (mode === 'grid') {
          handleZenModeChange(false)
        }
      },
      [handleZenModeChange, propOnLayoutModeChange]
    )

    const [activeStudioNoteId, setActiveStudioNoteId] = useState<string | null>(null)

    // View mode (grid or list)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
      if (propViewMode) return propViewMode
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dailyflow_academic_view_mode')
        if (saved === 'grid' || saved === 'list') return saved
      }
      return 'grid'
    })

    const [prevViewProp, setPrevViewProp] = useState(propViewMode)
    if (propViewMode && propViewMode !== prevViewProp) {
      setPrevViewProp(propViewMode)
      setViewMode(propViewMode)
    }

    const handleViewModeChange = useCallback(
      (mode: 'grid' | 'list') => {
        setViewMode(mode)
        if (typeof window !== 'undefined') {
          localStorage.setItem('dailyflow_academic_view_mode', mode)
        }
        propOnViewModeChange?.(mode)
      },
      [propOnViewModeChange]
    )

    // Modals state
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
    const [selectedNote, setSelectedNote] = useState<AcademicNote | null>(null)
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false)

    // Ref for search input and file upload
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Confirmation dialog state
    const [confirmState, setConfirmState] = useState<{
      isOpen: boolean
      title: string
      message: string
      confirmText?: string
      isDanger?: boolean
      requireConfirmationWord?: string
      isDoubleConfirm?: boolean
      onConfirm: () => void
    }>({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
    })

    // Map of subjects for fast lookup
    const subjectMap = useMemo(() => {
      const map = new Map<string, Subject>()
      for (const sub of subjects) {
        map.set(sub.id, sub)
      }
      return map
    }, [subjects])

    // Count notes per subject
    const notesCountBySubject = useMemo(() => {
      const counts: Record<string, number> = {}
      for (const note of allNotes) {
        counts[note.subjectId] = (counts[note.subjectId] || 0) + 1
      }
      return counts
    }, [allNotes])

    // Create note directly in Studio mode
    const handleStudioNewNote = useCallback(
      (subjectId?: string) => {
        const targetSubjectId =
          subjectId ||
          (filters.subjectId !== 'all' ? filters.subjectId : subjects[0]?.id || '')
        const newNote = addNote({
          title: 'Nova Anotação',
          content: '',
          subjectId: targetSubjectId,
          status: 'to_review',
          tags: [],
          isPinned: false,
        })
        setActiveStudioNoteId(newNote.id)
        toast.success('Anotação criada com sucesso')
        return newNote
      },
      [filters.subjectId, subjects, addNote, toast]
    )

    // Note management handlers
    const handleOpenNewNote = useCallback(
      (subjectId?: string) => {
        if (layoutMode === 'studio') {
          handleStudioNewNote(subjectId)
          return
        }

        setSelectedNote(null)
        setIsNoteModalOpen(true)
        if (subjectId) {
          setFilters((prev) => ({ ...prev, subjectId }))
        }
      },
      [layoutMode, handleStudioNewNote, setFilters]
    )

    React.useImperativeHandle(
      ref,
      () => ({
        openNewNote: handleOpenNewNote,
        focusSearch: () => {
          if (searchInputRef.current) {
            searchInputRef.current.focus()
            searchInputRef.current.select()
          }
        },
        setLayoutMode: handleLayoutModeChange,
      }),
      [handleOpenNewNote, handleLayoutModeChange]
    )

    const handleOpenEditNote = useCallback(
      (note: AcademicNote) => {
        setActiveStudioNoteId(note.id)
        handleLayoutModeChange('studio')
      },
      [handleLayoutModeChange]
    )

    const handleSaveNote = useCallback(
      (
        notePayload: Omit<AcademicNote, 'id' | 'createdAt' | 'updatedAt'>,
        noteId?: string
      ) => {
        if (noteId) {
          updateNote(noteId, notePayload)
          toast.success('Anotação salva com sucesso')
        } else {
          addNote(notePayload)
          toast.success('Anotação criada com sucesso')
        }
      },
      [addNote, updateNote, toast]
    )

    const requestDeleteNote = useCallback(
      (noteId: string) => {
        const note = allNotes.find((n) => n.id === noteId)
        setConfirmState({
          isOpen: true,
          title: 'Excluir Anotação',
          message: `Tem certeza que deseja excluir a anotação "${note?.title || 'selecionada'}"? Esta ação não pode ser desfeita.`,
          confirmText: 'Excluir Anotação',
          isDanger: true,
          onConfirm: () => {
            deleteNote(noteId)
            toast.info('Anotação excluída', {
              action: {
                label: 'Desfazer',
                onClick: () => {
                  if (note) restoreNote(note)
                },
              },
            })
          },
        })
      },
      [allNotes, deleteNote, restoreNote, toast]
    )

    const handleStudioDeleteNote = useCallback(
      (noteId: string) => {
        const note = allNotes.find((n) => n.id === noteId)
        deleteNote(noteId)
        toast.info('Anotação excluída', {
          action: {
            label: 'Desfazer',
            onClick: () => {
              if (note) restoreNote(note)
            },
          },
        })
      },
      [allNotes, deleteNote, restoreNote, toast]
    )

    const handleTogglePinNote = useCallback(
      (noteId: string) => {
        const note = allNotes.find((n) => n.id === noteId)
        const willBePinned = !note?.isPinned
        togglePinNote(noteId)
        if (willBePinned) {
          toast.success('Anotação fixada no topo')
        } else {
          toast.info('Anotação desafixada')
        }
      },
      [allNotes, togglePinNote, toast]
    )

    const handleAddSubject = useCallback(
      (subjectInput: Omit<Subject, 'id'>) => {
        const newSub = addSubject(subjectInput)
        toast.success('Disciplina criada com sucesso')
        return newSub
      },
      [addSubject, toast]
    )

    const handleDeleteSubject = useCallback(
      (subjectId: string) => {
        deleteSubject(subjectId)
        toast.info('Disciplina excluída')
      },
      [deleteSubject, toast]
    )

    const hasActiveFilters =
      filters.searchQuery !== '' ||
      filters.subjectId !== 'all' ||
      filters.status !== 'all' ||
      filters.tag !== null ||
      filters.onlyPinned

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Content: Studio Mode or Grid/List Mode */}
        {layoutMode === 'studio' ? (
          <AcademicStudio
            notes={allNotes}
            subjects={subjects}
            selectedNoteId={activeStudioNoteId}
            onSelectNote={setActiveStudioNoteId}
            onUpdateNote={updateNote}
            onDeleteNote={handleStudioDeleteNote}
            onTogglePin={handleTogglePinNote}
            onNewNote={handleStudioNewNote}
            onBackToGrid={() => handleLayoutModeChange('grid')}
            isZenMode={isZenMode}
            onZenModeChange={handleZenModeChange}
          />
        ) : (
          <>
            {/* Metrics & Quick Statistics Stitch */}
            <section aria-label="Estatísticas Acadêmicas">
              <AcademicStats
                stats={stats}
                subjects={subjects}
                onStartReview={() =>
                  setFilters((prev) => ({ ...prev, status: 'to_review' }))
                }
              />
            </section>

            {/* Filter and Search Controls Stitch */}
            <section aria-label="Filtros e Busca Acadêmica">
              <AcademicFilterBar
                filters={filters}
                onFilterChange={(updates) =>
                  setFilters((prev) => ({ ...prev, ...updates }))
                }
                subjects={subjects}
                allNotes={allNotes}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                onOpenSubjectManager={() => setIsSubjectModalOpen(true)}
                searchInputRef={searchInputRef}
                totalFiltered={notes.length}
                allNotesCount={allNotesCount}
              />
            </section>

            {/* Main Notes List / Grid */}
            <section aria-label="Lista de Anotações" className="pt-2">
              {notes.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center max-w-lg mx-auto my-6 shadow-xs">
                  {hasActiveFilters ? (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                        <SearchX className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Nenhuma anotação encontrada
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                        Não encontramos anotações correspondentes aos critérios ou busca
                        aplicados.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setFilters({
                            searchQuery: '',
                            subjectId: 'all',
                            status: 'all',
                            tag: null,
                            onlyPinned: false,
                          })
                        }
                        className="mt-4 px-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl transition-colors cursor-pointer"
                      >
                        Limpar todos os filtros
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                        <FilePlus className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Seu caderno está vazio
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                        Comece registrando seus primeiros resumos, fórmulas e tópicos de
                        estudo.
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => handleOpenNewNote()}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Criar Primeira Anotação</span>
                        </button>
                        <button
                          type="button"
                          onClick={resetToSeed}
                          className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Carregar Demonstração</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {notes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        subject={subjectMap.get(note.subjectId)}
                        viewMode="grid"
                        onEdit={handleOpenEditNote}
                        onDelete={requestDeleteNote}
                        onTogglePin={handleTogglePinNote}
                        onSelectTag={(tag) => setFilters((prev) => ({ ...prev, tag }))}
                      />
                    ))}
                  </div>

                  {/* Quick Add / Empty Space Prompt (Stitch Design) */}
                  <div
                    onClick={() => handleOpenNewNote()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleOpenNewNote()
                      }
                    }}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-all bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center justify-center gap-2 cursor-pointer mt-6 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shadow-xs">
                      <FilePlus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold font-sans text-slate-900 dark:text-slate-100">
                        Criar anotação rápida de aula
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Clique aqui para adicionar novas anotações, fórmulas ou resumos ao
                        seu caderno.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  {notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      subject={subjectMap.get(note.subjectId)}
                      viewMode="list"
                      onEdit={handleOpenEditNote}
                      onDelete={requestDeleteNote}
                      onTogglePin={handleTogglePinNote}
                      onSelectTag={(tag) => setFilters((prev) => ({ ...prev, tag }))}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Note Creation / Editing Modal */}
        <NoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onSave={handleSaveNote}
          onDelete={requestDeleteNote}
          note={selectedNote}
          subjects={subjects}
          availableTags={allTags}
        />

        {/* Subject Manager Modal */}
        <SubjectManagerModal
          isOpen={isSubjectModalOpen}
          onClose={() => setIsSubjectModalOpen(false)}
          subjects={subjects}
          notesCountBySubject={notesCountBySubject}
          onAddSubject={handleAddSubject}
          onDeleteSubject={handleDeleteSubject}
        />

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          isDanger={confirmState.isDanger}
          requireConfirmationWord={confirmState.requireConfirmationWord}
          isDoubleConfirm={confirmState.isDoubleConfirm}
          onConfirm={confirmState.onConfirm}
          onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    )
  }
)

AcademicView.displayName = 'AcademicView'
