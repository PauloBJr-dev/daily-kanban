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
    if (diffDays < 7) return `${diffDays}d atrás`
    return new Date(isoStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
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
        className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md ${
          note.isPinned
            ? 'border-indigo-200/90 dark:border-indigo-800/80 ring-1 ring-indigo-500/10'
            : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        {/* Left side: Subject & Title & Snippet */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Subject badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium border ${subjectColor.bgSubtle} ${subjectColor.text} ${subjectColor.border}`}
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
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                <Pin className="w-3 h-3 fill-indigo-600 dark:fill-indigo-400" />
                Fixada
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onEdit(note)}
            className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer truncate"
          >
            {note.title}
          </h3>

          {/* Snippet */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {note.content}
          </p>

          {/* Tags in list */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {note.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag?.(tag)}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors cursor-pointer"
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
              onClick={() => onTogglePin(note.id)}
              aria-label={note.isPinned ? 'Desafixar anotação' : 'Fixar anotação'}
              title={note.isPinned ? 'Desafixar' : 'Fixar no topo'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                note.isPinned
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Pin
                className={`w-4 h-4 ${
                  note.isPinned ? 'fill-indigo-600 dark:fill-indigo-400' : ''
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => onEdit(note)}
              aria-label="Editar anotação"
              title="Editar anotação"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(note.id)}
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

  // Grid Mode (Standard card layout)
  return (
    <div
      className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
        note.isPinned
          ? 'border-indigo-200 dark:border-indigo-800/80 ring-1 ring-indigo-500/10'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div>
        {/* Header: Subject badge, Status badge, Pin button, Quick menu */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
            {/* Subject badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${subjectColor.bgSubtle} ${subjectColor.text} ${subjectColor.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${subjectColor.dot}`} />
              <span className="truncate max-w-[130px]">
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
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Pin button */}
            <button
              type="button"
              onClick={() => onTogglePin(note.id)}
              aria-label={note.isPinned ? 'Desafixar anotação' : 'Fixar anotação'}
              title={note.isPinned ? 'Desafixar do topo' : 'Fixar no topo'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                note.isPinned
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-60 group-hover:opacity-100'
              }`}
            >
              <Pin
                className={`w-3.5 h-3.5 ${
                  note.isPinned ? 'fill-indigo-600 dark:fill-indigo-400' : ''
                }`}
              />
            </button>

            {/* Menu Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
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
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
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
                      onClick={() => {
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
                      onClick={() => {
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
          onClick={() => onEdit(note)}
          className="text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer leading-snug line-clamp-2"
        >
          {note.title}
        </h3>

        {/* Content Snippet */}
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
          {note.content}
        </p>
      </div>

      {/* Footer: Tags, Dates, and Relative Time */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {note.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag?.(tag)}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Dates row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-2.5">
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

          {/* Timestamp */}
          <span className="inline-flex items-center gap-1 text-slate-400 ml-auto">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(note.updatedAt)}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
