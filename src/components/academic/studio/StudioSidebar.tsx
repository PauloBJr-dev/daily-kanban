import React, { useMemo } from 'react'
import {
  Search,
  X,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Pin,
  FileText,
  Clock,
} from 'lucide-react'
import type { AcademicNote, StudyStatus, Subject } from '../../../types/academic'
import { getSubjectColor } from '../academicColors'

export interface StudioSidebarProps {
  notes: AcademicNote[]
  subjects: Subject[]
  selectedNoteId: string | null
  onSelectNote: (id: string) => void
  onNewNote: () => void
  isOpen: boolean
  onToggle: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedSubjectId: string | 'all'
  onSelectSubject: (subjectId: string | 'all') => void
}

const statusConfig: Record<
  StudyStatus,
  { label: string; dotClass: string; textClass: string; bgClass: string }
> = {
  to_review: {
    label: 'Para Revisar',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-50 dark:bg-amber-950/60',
  },
  in_progress: {
    label: 'Em Andamento',
    dotClass: 'bg-indigo-500',
    textClass: 'text-indigo-700 dark:text-indigo-300',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
  },
  mastered: {
    label: 'Dominado',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
  },
}

function formatRelativeTime(isoStr: string): string {
  try {
    const diffMs = Date.now() - new Date(isoStr).getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 1) return 'Agora há pouco'
    if (diffMins < 60) return `${diffMins}m atrás`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h atrás`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays}d atrás`
    return new Date(isoStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  } catch {
    return ''
  }
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  notes,
  subjects,
  selectedNoteId,
  onSelectNote,
  onNewNote,
  isOpen,
  onToggle,
  searchQuery,
  onSearchChange,
  selectedSubjectId,
  onSelectSubject,
}) => {
  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>()
    for (const sub of subjects) {
      map.set(sub.id, sub)
    }
    return map
  }, [subjects])

  // Filter notes according to search and subject selection
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (selectedSubjectId !== 'all' && note.subjectId !== selectedSubjectId) {
        return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesTitle = note.title.toLowerCase().includes(query)
        const matchesContent = note.content.toLowerCase().includes(query)
        const matchesTags = note.tags.some((tag) => tag.toLowerCase().includes(query))
        if (!matchesTitle && !matchesContent && !matchesTags) {
          return false
        }
      }
      return true
    })
  }, [notes, selectedSubjectId, searchQuery])

  // Separate into pinned and unpinned notes
  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => n.isPinned),
    [filteredNotes]
  )
  const unpinnedNotes = useMemo(
    () => filteredNotes.filter((n) => !n.isPinned),
    [filteredNotes]
  )

  if (!isOpen) {
    return (
      <aside
        aria-label="Barra lateral do caderno recolhida"
        className="w-14 shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col items-center py-4 gap-3 transition-all"
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label="Expandir barra lateral"
          title="Expandir barra lateral"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onNewNote}
          aria-label="Nova anotação"
          title="Nova anotação"
          className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </aside>
    )
  }

  const renderNoteItem = (note: AcademicNote) => {
    const isSelected = selectedNoteId === note.id
    const subject = subjectMap.get(note.subjectId)
    const subjectColor = getSubjectColor(subject?.color)
    const status = statusConfig[note.status] || statusConfig.to_review
    const relativeTime = formatRelativeTime(note.updatedAt)

    return (
      <button
        key={note.id}
        type="button"
        onClick={() => onSelectNote(note.id)}
        aria-label={`Selecionar anotação: ${note.title || 'Sem título'}`}
        className={`w-full text-left p-3 rounded-xl transition-all border cursor-pointer mb-1.5 flex flex-col gap-1.5 ${
          isSelected
            ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-300/80 dark:border-indigo-700 shadow-xs ring-1 ring-indigo-500/20'
            : 'bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-slate-200/60 dark:border-slate-800/60'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-xs sm:text-sm font-semibold truncate flex-1 ${
              isSelected
                ? 'text-indigo-950 dark:text-indigo-100'
                : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {note.title.trim() || 'Sem título'}
          </h4>
          {note.isPinned && (
            <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            {subject && (
              <span
                className={`truncate px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${subjectColor.bgSubtle} ${subjectColor.text} ${subjectColor.border}`}
              >
                {subject.name}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${status.bgClass} ${status.textClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
              <span className="hidden sm:inline">{status.label}</span>
            </span>
          </div>

          {relativeTime && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {relativeTime}
            </span>
          )}
        </div>
      </button>
    )
  }

  return (
    <aside
      aria-label="Barra lateral do caderno"
      className="w-72 sm:w-80 shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col h-full overflow-hidden select-none"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Caderno
          </h2>
          <span className="text-[11px] font-medium px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {filteredNotes.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onNewNote}
            aria-label="+ Nova Nota"
            title="Criar nova anotação"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Nota</span>
          </button>

          <button
            type="button"
            onClick={onToggle}
            aria-label="Recolher barra lateral"
            title="Recolher barra lateral"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 pb-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar notas..."
            aria-label="Buscar notas"
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Limpar busca"
              title="Limpar busca"
              className="absolute right-2.5 p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Subject Quick Filter Chips */}
      <div
        className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none"
        aria-label="Filtro rápido de disciplinas"
      >
        <button
          type="button"
          onClick={() => onSelectSubject('all')}
          aria-label="Todas as disciplinas"
          className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
            selectedSubjectId === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          Todas
        </button>
        {subjects.map((sub) => {
          const subColor = getSubjectColor(sub.color)
          const isSelected = selectedSubjectId === sub.id
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSelectSubject(sub.id)}
              aria-label={`Filtrar por ${sub.name}`}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                isSelected
                  ? `${subColor.bgSubtle} ${subColor.text} ${subColor.border} font-semibold shadow-xs`
                  : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${subColor.dot}`} />
              <span>{sub.name}</span>
            </button>
          )
        })}
      </div>

      {/* Notes List with Fixed and All Notes Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Nenhuma anotação encontrada</p>
            <p className="text-[11px] opacity-70 mt-0.5">
              {searchQuery ? 'Tente outro termo de busca' : 'Crie sua primeira anotação'}
            </p>
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && (
              <section aria-label="Anotações fixadas">
                <div className="flex items-center gap-1.5 px-1 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>Fixadas</span>
                  <span className="text-[10px] ml-auto bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.2 rounded-full">
                    {pinnedNotes.length}
                  </span>
                </div>
                {pinnedNotes.map(renderNoteItem)}
              </section>
            )}

            {/* All / Other Notes Section */}
            <section aria-label="Todas as anotações">
              <div className="flex items-center gap-1.5 px-1 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                <span>Todas as Anotações</span>
                <span className="text-[10px] ml-auto bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.2 rounded-full">
                  {pinnedNotes.length > 0 ? unpinnedNotes.length : filteredNotes.length}
                </span>
              </div>
              {(pinnedNotes.length > 0 ? unpinnedNotes : filteredNotes).map(
                renderNoteItem
              )}
            </section>
          </>
        )}
      </div>
    </aside>
  )
}
