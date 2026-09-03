import React, { useState, useRef, useCallback, useMemo } from 'react'
import {
  Plus,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  SearchX,
  FilePlus,
  Sparkles,
  LayoutGrid,
  PanelsTopLeft,
} from 'lucide-react'
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
}

export const AcademicView = React.forwardRef<AcademicViewHandle, AcademicViewProps>(
  (props, ref) => {
    const {
      className = '',
      isZenMode: propIsZenMode,
      onZenModeChange: propOnZenModeChange,
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
      exportAcademicData,
      importAcademicData,
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
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dailyflow_academic_layout_mode')
        if (saved === 'grid' || saved === 'studio') return saved
      }
      return 'grid'
    })

    const handleLayoutModeChange = useCallback(
      (mode: 'grid' | 'studio') => {
        setLayoutMode(mode)
        if (typeof window !== 'undefined') {
          localStorage.setItem('dailyflow_academic_layout_mode', mode)
        }
        if (mode === 'grid') {
          handleZenModeChange(false)
        }
      },
      [handleZenModeChange]
    )

    const [activeStudioNoteId, setActiveStudioNoteId] = useState<string | null>(null)

    // View mode (grid or list)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dailyflow_academic_view_mode')
        if (saved === 'grid' || saved === 'list') return saved
      }
      return 'grid'
    })

    const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
      setViewMode(mode)
      if (typeof window !== 'undefined') {
        localStorage.setItem('dailyflow_academic_view_mode', mode)
      }
    }, [])

    // Modals state
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
    const [selectedNote, setSelectedNote] = useState<AcademicNote | null>(null)
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false)

    // Ref for search input and file upload
    const searchInputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    const handleExportAcademicData = useCallback(() => {
      exportAcademicData()
      toast.success('Backup JSON exportado com sucesso')
    }, [exportAcademicData, toast])

    const requestResetData = useCallback(() => {
      setConfirmState({
        isOpen: true,
        title: 'Restaurar Dados Padrão Acadêmicos',
        message:
          'Todas as anotações e disciplinas atuais serão substituídas pelo conjunto de demonstração acadêmico inicial.',
        confirmText: 'Restaurar',
        isDanger: false,
        requireConfirmationWord: 'RESTAURAR',
        onConfirm: () => {
          resetToSeed()
          toast.info('Dados de demonstração restaurados')
        },
      })
    }, [resetToSeed, toast])

    // Import JSON handler
    const handleImport = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target?.result as string)
            const success = importAcademicData(parsed)
            if (success) {
              toast.success('Dados importados com sucesso')
            } else {
              toast.error('Arquivo JSON acadêmico inválido ou incompatível.')
            }
          } catch {
            toast.error('Erro ao processar o arquivo JSON.')
          }
        }
        reader.readAsText(file)
        e.target.value = ''
      },
      [importAcademicData, toast]
    )

    const hasActiveFilters =
      filters.searchQuery !== '' ||
      filters.subjectId !== 'all' ||
      filters.status !== 'all' ||
      filters.tag !== null ||
      filters.onlyPinned

    return (
      <div className={`space-y-6 ${className}`}>
        {/* View Header with Title and Actions - Hidden in Zen Mode */}
        {!isZenMode && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </span>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Caderno Acadêmico
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Organize suas matérias, conceitos de estudo, datas de prova e cronograma
                de revisões.
              </p>
            </div>

            {/* Global Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Layout Mode Selector: [ ⊞ Grade ] [ ◫ Studio ] */}
              <div
                role="group"
                aria-label="Modo de exibição acadêmico"
                className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs mr-1"
              >
                <button
                  type="button"
                  onClick={() => handleLayoutModeChange('grid')}
                  aria-label="Modo Grade"
                  aria-pressed={layoutMode === 'grid'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    layoutMode === 'grid'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grade</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLayoutModeChange('studio')}
                  aria-label="Modo Studio"
                  aria-pressed={layoutMode === 'studio'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    layoutMode === 'studio'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <PanelsTopLeft className="w-3.5 h-3.5" />
                  <span>Studio</span>
                </button>
              </div>

              {/* Export JSON */}
              <button
                type="button"
                onClick={handleExportAcademicData}
                aria-label="Exportar anotações acadêmicas em JSON"
                title="Exportar dados (JSON)"
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Import JSON */}
              <label
                aria-label="Importar anotações acadêmicas via arquivo JSON"
                title="Importar dados (JSON)"
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <Upload className="w-4 h-4" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              {/* Reset to seed */}
              <button
                type="button"
                onClick={requestResetData}
                aria-label="Restaurar dados acadêmicos iniciais"
                title="Restaurar dados padrão"
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Nova Anotação CTA */}
              <button
                type="button"
                onClick={() => handleOpenNewNote()}
                aria-label="Criar nova anotação"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer ml-1"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Anotação</span>
              </button>
            </div>
          </div>
        )}

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
            {/* Metrics & Quick Statistics */}
            <section aria-label="Estatísticas Acadêmicas">
              <AcademicStats stats={stats} />
            </section>

            {/* Filter and Search Controls */}
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
                        className="mt-4 px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition-colors cursor-pointer"
                      >
                        Limpar todos os filtros
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
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
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
