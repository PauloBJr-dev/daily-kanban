import React, { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Trash2,
  Calendar,
  RotateCcw,
  Tag as TagIcon,
  AlertCircle,
  Pin,
  Check,
} from 'lucide-react'
import type { AcademicNote, StudyStatus, Subject } from '../../types/academic'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    noteData: Omit<AcademicNote, 'id' | 'createdAt' | 'updatedAt'>,
    noteId?: string
  ) => void
  onDelete?: (noteId: string) => void
  note?: AcademicNote | null
  subjects: Subject[]
  availableTags?: string[]
  initialSubjectId?: string
}

const statusOptions: {
  id: StudyStatus
  label: string
  activeClass: string
  dotColor: string
}[] = [
  {
    id: 'to_review',
    label: 'Para Revisar',
    activeClass:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/20',
    dotColor: 'bg-amber-500',
  },
  {
    id: 'in_progress',
    label: 'Em Andamento',
    activeClass:
      'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700 ring-2 ring-sky-400/20',
    dotColor: 'bg-sky-500',
  },
  {
    id: 'mastered',
    label: 'Dominado',
    activeClass:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-400/20',
    dotColor: 'bg-emerald-500',
  },
]

const NoteModalDialog: React.FC<NoteModalProps> = ({
  onClose,
  onSave,
  onDelete,
  note,
  subjects,
  availableTags = [],
  initialSubjectId,
}) => {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [subjectId, setSubjectId] = useState(
    note?.subjectId || initialSubjectId || subjects[0]?.id || ''
  )
  const [status, setStatus] = useState<StudyStatus>(note?.status || 'to_review')
  const [isPinned, setIsPinned] = useState(note?.isPinned || false)
  const [examDate, setExamDate] = useState(note?.examDate || '')
  const [reviewDate, setReviewDate] = useState(note?.reviewDate || '')
  const [tags, setTags] = useState<string[]>(note?.tags ? [...note.tags] : [])

  const [tagInput, setTagInput] = useState('')
  const [titleError, setTitleError] = useState(false)
  const [subjectError, setSubjectError] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Tag handlers
  const handleAddTag = (tagToAdd?: string) => {
    const target = (tagToAdd ?? tagInput).trim().replace(/^#/, '')
    if (!target) return
    if (!tags.includes(target)) {
      setTags((prev) => [...prev, target])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove))
  }

  // Quick date setters
  const setDateToday = (type: 'exam' | 'review') => {
    const today = new Date().toISOString().split('T')[0]
    if (type === 'exam') setExamDate(today)
    else setReviewDate(today)
  }

  const setDateNextWeek = (type: 'exam' | 'review') => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    const nextWeek = d.toISOString().split('T')[0]
    if (type === 'exam') setExamDate(nextWeek)
    else setReviewDate(nextWeek)
  }

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let hasError = false
    if (!title.trim()) {
      setTitleError(true)
      hasError = true
    }
    if (!subjectId) {
      setSubjectError(true)
      hasError = true
    }

    if (hasError) return

    const notePayload: Omit<AcademicNote, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      content: content.trim(),
      subjectId,
      status,
      tags,
      isPinned,
      examDate: examDate || undefined,
      reviewDate: reviewDate || undefined,
    }

    onSave(notePayload, note?.id)
    onClose()
  }

  // Filter suggested tags
  const suggestedTags = availableTags.filter((t) => !tags.includes(t)).slice(0, 6)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl my-0 sm:my-6 rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2
              id="note-modal-title"
              className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
            >
              {note ? 'Editar Anotação Acadêmica' : 'Nova Anotação Acadêmica'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {note
                ? 'Atualize os conceitos, status e datas de revisão.'
                : 'Registre resumos, fórmulas, tópicos e prazos de estudo.'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="note-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Title Input */}
          <div>
            <label
              htmlFor="note-title-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Título da Anotação <span className="text-rose-500">*</span>
            </label>
            <input
              id="note-title-input"
              type="text"
              autoFocus
              placeholder="Ex: Teorema Central do Limite e Intervalos de Confiança"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError(false)
              }}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all ${
                titleError
                  ? 'border-rose-400 ring-2 ring-rose-400/20'
                  : 'border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
            {titleError && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />O título da anotação é obrigatório.
              </p>
            )}
          </div>

          {/* Subject & Status Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Selector */}
            <div>
              <label
                htmlFor="note-subject-select"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Disciplina <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="note-subject-select"
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value)
                    if (subjectError) setSubjectError(false)
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer ${
                    subjectError
                      ? 'border-rose-400 ring-2 ring-rose-400/20'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <option value="" disabled>
                    Selecione uma disciplina
                  </option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} {sub.code ? `(${sub.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {subjectError && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Selecione uma disciplina para a anotação.
                </p>
              )}
            </div>

            {/* Pin to Top toggle checkbox */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <Pin
                    className={`w-3.5 h-3.5 ${
                      isPinned
                        ? 'text-indigo-600 dark:text-indigo-400 fill-current'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>Fixar esta anotação no topo</span>
                </div>
              </label>
            </div>
          </div>

          {/* Status buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Status de Aprendizado
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {statusOptions.map((opt) => {
                const isSelected = status === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatus(opt.id)}
                    className={`flex items-center justify-between py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? opt.activeClass
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-current" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dates: Exam & Review */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Exam Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="note-exam-date"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Data da Prova / Avaliação
                </label>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDateToday('exam')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    Hoje
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={() => setDateNextWeek('exam')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    +7 dias
                  </button>
                  {examDate && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <button
                        type="button"
                        onClick={() => setExamDate('')}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      >
                        Limpar
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  id="note-exam-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Review Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="note-review-date"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Próxima Revisão
                </label>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDateToday('review')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    Hoje
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={() => setDateNextWeek('review')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    +7 dias
                  </button>
                  {reviewDate && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <button
                        type="button"
                        onClick={() => setReviewDate('')}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      >
                        Limpar
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  id="note-review-date"
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                />
                <RotateCcw className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <label
              htmlFor="note-content-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Conteúdo & Resumo
            </label>
            <textarea
              id="note-content-input"
              rows={6}
              placeholder="Escreva anotações, fórmulas, deduções, resumos e referências..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y font-sans leading-relaxed"
            />
          </div>

          {/* Tags Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <TagIcon className="w-3.5 h-3.5" />
              <span>Etiquetas (Tags)</span>
            </label>

            {/* Selected Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-indigo-950 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-slate-400 italic">
                  Nenhuma etiqueta adicionada.
                </span>
              )}
            </div>

            {/* Add tag input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Nova tag... (Pressione Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddTag()}
                disabled={!tagInput.trim()}
                className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inserir</span>
              </button>
            </div>

            {/* Suggestions */}
            {suggestedTags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs text-slate-400">
                <span>Sugestões:</span>
                {suggestedTags.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleAddTag(st)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    +{st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          {note && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(note.id)
                onClose()
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Anotação</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="note-form"
              className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer"
            >
              {note ? 'Salvar Alterações' : 'Criar Anotação'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const NoteModal: React.FC<NoteModalProps> = (props) => {
  if (!props.isOpen) return null

  const componentKey = props.note
    ? props.note.id
    : `new-note-${props.initialSubjectId || 'default'}`

  return <NoteModalDialog key={componentKey} {...props} />
}
