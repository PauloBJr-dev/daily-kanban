import React, { useState, useMemo, useEffect } from 'react'
import {
  LayoutGrid,
  PanelLeft,
  Pin,
  Maximize2,
  Minimize2,
  Trash2,
  Calendar,
  Plus,
  X,
  Check,
  FileEdit,
} from 'lucide-react'
import type { AcademicNote, StudyStatus, Subject } from '../../../types/academic'
import { getSubjectColor } from '../academicColors'
import { ConfirmDialog } from '../../ConfirmDialog'
import { useToast } from '../../../hooks/useToast'

export interface StudioEditorProps {
  note: AcademicNote | null
  subjects: Subject[]
  onUpdateNote: (id: string, updates: Partial<AcademicNote>) => void
  onDeleteNote?: (id: string) => void
  onTogglePin?: (id: string) => void
  isZenMode: boolean
  onToggleZenMode: () => void
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  onBackToGrid?: () => void
  onNewNote?: () => void
}

const statusOptions: {
  id: StudyStatus
  label: string
  dotClass: string
  badgeClass: string
}[] = [
  {
    id: 'to_review',
    label: 'Para Revisar',
    dotClass: 'bg-amber-500',
    badgeClass:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'in_progress',
    label: 'Em Andamento',
    dotClass: 'bg-indigo-500',
    badgeClass:
      'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 'mastered',
    label: 'Dominado',
    dotClass: 'bg-emerald-500',
    badgeClass:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
]

export const StudioEditor: React.FC<StudioEditorProps> = ({
  note,
  subjects,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
  isZenMode,
  onToggleZenMode,
  isSidebarOpen = true,
  onToggleSidebar,
  onBackToGrid,
  onNewNote,
}) => {
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const toast = useToast()

  // Support Ctrl+S / Cmd+S to explicitly trigger save feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (note) {
          toast.success('Anotação salva com sucesso')
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [note, toast])

  // Reading statistics
  const noteContent = note?.content
  const { wordsCount, charsCount, readingTimeMinutes } = useMemo(() => {
    if (!noteContent) {
      return { wordsCount: 0, charsCount: 0, readingTimeMinutes: 1 }
    }
    const trimmed = noteContent.trim()
    const words = trimmed ? trimmed.split(/\s+/).length : 0
    const chars = noteContent.length
    const minutes = Math.max(1, Math.ceil(words / 200))
    return { wordsCount: words, charsCount: chars, readingTimeMinutes: minutes }
  }, [noteContent])

  // Current subject
  const currentSubject = useMemo(
    () => subjects.find((s) => s.id === note?.subjectId),
    [subjects, note?.subjectId]
  )
  const subjectColor = getSubjectColor(currentSubject?.color)

  const handleAddTagSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!note) return
    const cleanTag = newTagInput.trim().replace(/^#/, '')
    if (cleanTag && !note.tags.includes(cleanTag)) {
      onUpdateNote(note.id, { tags: [...note.tags, cleanTag] })
    }
    setNewTagInput('')
    setIsAddingTag(false)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    if (!note) return
    const updatedTags = note.tags.filter((t) => t !== tagToRemove)
    onUpdateNote(note.id, { tags: updatedTags })
  }

  const handleTogglePin = () => {
    if (!note) return
    if (onTogglePin) {
      onTogglePin(note.id)
    } else {
      onUpdateNote(note.id, { isPinned: !note.isPinned })
    }
  }

  // If no note is selected
  if (!note) {
    return (
      <main
        aria-label="Editor do estúdio vazio"
        className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto"
      >
        {/* Navigation Bar when empty */}
        <header className="px-4 sm:px-8 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBackToGrid && (
              <button
                type="button"
                onClick={onBackToGrid}
                aria-label="Voltar para Grade"
                title="Voltar para Grade"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Voltar para Grade</span>
              </button>
            )}
            {onToggleSidebar && !isSidebarOpen && (
              <button
                type="button"
                onClick={onToggleSidebar}
                aria-label="Expandir barra lateral"
                title="Expandir barra lateral"
                className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Empty state content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-xs">
            <FileEdit className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Nenhuma anotação selecionada
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Selecione uma anotação na lista lateral ou crie uma nova para começar seu
            momento de estudo imersivo.
          </p>
          {onNewNote && (
            <button
              type="button"
              onClick={onNewNote}
              aria-label="Criar nova anotação"
              className="mt-6 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Nova Nota</span>
            </button>
          )}
        </div>
      </main>
    )
  }

  const currentStatusObj =
    statusOptions.find((s) => s.id === note.status) || statusOptions[0]

  return (
    <main
      aria-label="Editor do estúdio"
      className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden relative"
    >
      {/* Top Toolbar */}
      <header className="px-4 sm:px-8 py-2.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-2">
          {/* Back to Grid */}
          {onBackToGrid && (
            <button
              type="button"
              onClick={onBackToGrid}
              aria-label="Voltar para Grade"
              title="Voltar para Grade"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-800/60"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grade</span>
            </button>
          )}

          {/* Toggle Sidebar */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Alternar barra lateral"
              title={isSidebarOpen ? 'Recolher lateral' : 'Expandir lateral'}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          {/* Subject Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 text-xs">
            <span className={`w-2 h-2 rounded-full shrink-0 ${subjectColor.dot}`} />
            <select
              value={note.subjectId}
              onChange={(e) => onUpdateNote(note.id, { subjectId: e.target.value })}
              aria-label="Selecionar disciplina"
              className="bg-transparent font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              {subjects.map((sub) => (
                <option
                  key={sub.id}
                  value={sub.id}
                  className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                >
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 text-xs">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${currentStatusObj.dotClass}`}
            />
            <select
              value={note.status}
              onChange={(e) =>
                onUpdateNote(note.id, { status: e.target.value as StudyStatus })
              }
              aria-label="Selecionar status"
              className="bg-transparent font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option
                  key={opt.id}
                  value={opt.id}
                  className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1.5">
          {/* Exam Date Field */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 text-xs text-slate-600 dark:text-slate-400"
            title="Data da Prova ou Exame"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={note.examDate || ''}
              onChange={(e) =>
                onUpdateNote(note.id, { examDate: e.target.value || undefined })
              }
              aria-label="Data do exame"
              className="bg-transparent text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Pin Button */}
          <button
            type="button"
            onClick={handleTogglePin}
            aria-label={note.isPinned ? 'Desafixar anotação' : 'Fixar anotação'}
            title={note.isPinned ? 'Desafixar anotação' : 'Fixar anotação'}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              note.isPinned
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
          </button>

          {/* Zen Mode Button */}
          <button
            type="button"
            onClick={onToggleZenMode}
            aria-label={isZenMode ? 'Sair do Modo Zen' : 'Modo Zen'}
            title={isZenMode ? 'Sair do Modo Zen' : 'Modo Zen (Foco Imersivo)'}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isZenMode
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isZenMode ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Delete Note Button */}
          {onDeleteNote && (
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(true)}
              aria-label="Excluir anotação"
              title="Excluir anotação"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Writing Canvas (Obsidian/Notion Style) */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-3.5 sm:px-8 py-4 sm:py-6 flex-1 flex flex-col">
          {/* Document Title */}
          <input
            type="text"
            value={note.title}
            onChange={(e) => onUpdateNote(note.id, { title: e.target.value })}
            placeholder="Título da anotação..."
            aria-label="Título da anotação"
            className="text-xl sm:text-3xl font-bold bg-transparent focus:outline-none w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 tracking-tight mb-2"
          />

          {/* Interactive Tags Row */}
          <div className="flex flex-wrap items-center gap-1.5 py-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remover tag ${tag}`}
                  className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Inline Add Tag */}
            {isAddingTag ? (
              <form onSubmit={handleAddTagSubmit} className="inline-flex items-center">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onBlur={() => handleAddTagSubmit()}
                  placeholder="Nova tag..."
                  aria-label="Nova tag"
                  autoFocus
                  className="text-xs px-2.5 py-0.5 rounded-full border border-indigo-400 dark:border-indigo-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none w-24"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                aria-label="Adicionar tag"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tag</span>
              </button>
            )}
          </div>

          {/* Comfortable Writing Area */}
          <textarea
            value={note.content}
            onChange={(e) => onUpdateNote(note.id, { content: e.target.value })}
            placeholder="Comece a escrever sua nota de estudo..."
            aria-label="Conteúdo da anotação"
            className="text-base sm:text-lg leading-relaxed bg-transparent focus:outline-none w-full flex-1 min-h-[400px] resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 pt-3"
          />
        </div>
      </div>

      {/* Focus Footer */}
      <footer className="px-4 sm:px-8 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <span>{wordsCount} palavras</span>
          <span>•</span>
          <span>{charsCount} caracteres</span>
          <span>•</span>
          <span>~{readingTimeMinutes} min de leitura</span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (note) toast.success('Anotação salva com sucesso')
          }}
          title="Salvar anotação (Ctrl+S)"
          className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium hover:opacity-80 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md px-1"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Salvo no navegador</span>
        </button>
      </footer>

      {/* Delete Confirmation Modal */}
      {onDeleteNote && (
        <ConfirmDialog
          isOpen={isConfirmDeleteOpen}
          title="Excluir Anotação"
          message={`Tem certeza que deseja excluir a anotação "${note.title.trim() || 'Sem título'}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir Anotação"
          isDanger
          onConfirm={() => {
            setIsConfirmDeleteOpen(false)
            onDeleteNote(note.id)
          }}
          onClose={() => setIsConfirmDeleteOpen(false)}
        />
      )}
    </main>
  )
}
