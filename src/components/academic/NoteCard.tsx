import React, { useState } from 'react'
import {
  Pin,
  Calendar,
  RotateCcw,
  Clock,
  MoreHorizontal,
  Edit2,
  Trash2,
  Bookmark,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'
import type { AcademicNote, StudyStatus, Subject } from '../../types/academic'
import { getSubjectColor } from './academicColors'

interface NoteCardProps {
  note: AcademicNote
  subject?: Subject
  viewMode?: 'grid' | 'list'
  onEdit: (note: AcademicNote) => void
  onDelete: (noteId: string) => void
  onTogglePin: (noteId: string) => void
  onSelectTag?: (tag: string) => void
}

const statusConfig: Record<
  StudyStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  to_review: {
    label: 'Para Revisar',
    badgeClass:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60',
    dotClass: 'bg-amber-500',
  },
  in_progress: {
    label: 'Em Andamento',
    badgeClass:
      'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80 dark:border-sky-900/60',
    dotClass: 'bg-sky-500',
  },
  mastered: {
    label: 'Dominado',
    badgeClass:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60',
    dotClass: 'bg-emerald-500',
  },
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const today = new Date().toISOString().split('T')[0]
  if (dateStr === today) return 'Hoje'
  try {
    const [year, month, day] = dateStr.split('-')
    if (year && month && day) {
      return `${day}/${month}/${year}`
    }
  } catch {
    // fallback to original
  }
  return dateStr
}

function formatRelativeTime(isoStr: string): string {
  try {
    const diffMs = Date.now() - new Date(isoStr).getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 1) return 'Agora há pouco'
    if (diffHours < 24) return `${diffHours}h atrás`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `Há ${diffDays} dias`
    return new Date(isoStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  } catch {
    return ''
  }
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  subject,
  viewMode = 'grid',
  onEdit,
  onDelete,
  onTogglePin,
  onSelectTag,
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const currentStatus = statusConfig[note.status] || statusConfig.to_review
  const subjectColor = getSubjectColor(subject?.color)

  const isListMode = viewMode === 'list'

  if (isListMode) {
    return (
      <div
        onClick={() => onEdit(note)}
        className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md cursor-pointer ${
          note.isPinned
            ? 'border-blue-300 dark:border-blue-800/80 ring-1 ring-blue-500/10'
            : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40'
        }`}
      >
        {/* Left side: Subject & Title & Snippet */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Subject badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${subjectColor.bgSubtle} ${subjectColor.text} ${subjectColor.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${subjectColor.dot}`} />
              <span className="truncate max-w-[140px]">
                {subject ? subject.name : 'Geral'}
              </span>
              {subject?.code && (
                <span className="text-[10px] opacity-75 font-mono">{subject.code}</span>
              )}
            </span>

            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${currentStatus.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dotClass}`} />
              {currentStatus.label}
            </span>

            {/* Pinned badge in list mode */}
            {note.isPinned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                <Pin className="w-3 h-3 fill-blue-600 dark:fill-blue-400" />
                Fixada
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={(e) => {
              e.stopPropagation()
              onEdit(note)
            }}
            className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer truncate font-sans"
          >
            {note.title}
          </h3>

          {/* Snippet */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-body">
            {note.content}
          </p>

          {/* Tags in list */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {note.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectTag?.(tag)
                  }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right side: Dates & Action buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:items-end gap-1 text-xs text-slate-400">
            {note.examDate && (
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                <Calendar className="w-3 h-3" />
                <span>Prova: {formatDate(note.examDate)}</span>
              </span>
            )}
            {note.reviewDate && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <RotateCcw className="w-3 h-3" />
                <span>Revisão: {formatDate(note.reviewDate)}</span>
              </span>
            )}
            <span className="text-[11px]">{formatRelativeTime(note.updatedAt)}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onTogglePin(note.id)
              }}
              aria-label={note.isPinned ? 'Desafixar anotação' : 'Fixar anotação'}
              title={note.isPinned ? 'Desafixar' : 'Fixar no topo'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                note.isPinned
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Pin
                className={`w-4 h-4 ${
                  note.isPinned ? 'fill-blue-600 dark:fill-blue-400' : ''
                }`}
              />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(note)
              }}
              aria-label="Editar anotação"
              title="Editar anotação"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(note.id)
              }}
              aria-label="Excluir anotação"
              title="Excluir anotação"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Grid Mode (100% Stitch Card Layout)
  return (
    <div
      onClick={() => onEdit(note)}
      className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all p-5 flex flex-col justify-between gap-3.5 shadow-xs hover:shadow-md cursor-pointer ${
        note.isPinned
          ? 'border-blue-300 dark:border-blue-800/80 ring-1 ring-blue-500/10'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40'
      }`}
    >
      <div>
        {/* Header: Subject badge + Date / Relative Time + Actions */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {/* Subject badge with dot */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${subjectColor.bgSubtle} ${subjectColor.text} ${subjectColor.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${subjectColor.dot}`} />
              <span className="truncate max-w-[120px]">
                {subject ? subject.name : 'Geral'}
              </span>
              {subject?.code && (
                <span className="text-[10px] opacity-75 font-mono ml-0.5">
                  {subject.code}
                </span>
              )}
            </span>

            {/* Status indicator badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${currentStatus.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dotClass}`} />
              <span>{currentStatus.label}</span>
            </span>
          </div>

          {/* Action buttons cluster */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mr-1 hidden xs:inline">
              {formatRelativeTime(note.updatedAt)}
            </span>

            {/* Pin button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onTogglePin(note.id)
              }}
              aria-label={note.isPinned ? 'Desafixar anotação' : 'Fixar anotação'}
              title={note.isPinned ? 'Desafixar do topo' : 'Fixar no topo'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                note.isPinned
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-70 group-hover:opacity-100'
              }`}
            >
              <Pin
                className={`w-3.5 h-3.5 ${
                  note.isPinned
                    ? 'fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400'
                    : ''
                }`}
              />
            </button>

            {/* Menu Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu((prev) => !prev)
                }}
                aria-label="Ações da anotação"
                title="Mais opções"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                    }}
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(false)
                        onEdit(note)
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(false)
                        onTogglePin(note.id)
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                      <span>{note.isPinned ? 'Desafixar' : 'Fixar'}</span>
                    </button>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(false)
                        onDelete(note.id)
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={(e) => {
            e.stopPropagation()
            onEdit(note)
          }}
          className="font-sans font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug cursor-pointer line-clamp-2"
        >
          {note.title}
        </h3>

        {/* Bloco de Preview de Conteúdo (Stitch Snippet Box) */}
        <div className="mt-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/70 text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Resumo & Conceito:
          </p>
          <p className="leading-relaxed line-clamp-3 text-slate-600 dark:text-slate-300 font-sans">
            {note.content}
          </p>
        </div>

        {/* Tags in chips arredondados monospaçados no estilo Stitch */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {note.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectTag?.(tag)
                }}
                className="text-[11px] font-medium font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Bottom Meta & Quick Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
        {/* Exam & Review Dates if configured */}
        {(note.examDate || note.reviewDate) && (
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
            {note.examDate && (
              <span
                className="inline-flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400"
                title={`Data de prova: ${note.examDate}`}
              >
                <Calendar className="w-3 h-3" />
                <span>Prova: {formatDate(note.examDate)}</span>
              </span>
            )}

            {note.reviewDate && (
              <span
                className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400"
                title={`Data de revisão: ${note.reviewDate}`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Revisão: {formatDate(note.reviewDate)}</span>
              </span>
            )}
          </div>
        )}

        {/* Bottom Meta & Action Button Stitch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {note.status === 'mastered' ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% dominado</span>
              </span>
            ) : note.status === 'to_review' ? (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Flashcard pendente</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Em andamento</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(note)
            }}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-0.5 cursor-pointer font-sans"
          >
            <span>
              {note.status === 'to_review' ? 'Revisar Agora' : 'Abrir no Editor'}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
