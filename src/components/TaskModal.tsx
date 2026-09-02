import React, { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Tag as TagIcon,
  CheckSquare,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react'
import type { Column, Priority, Subtask, Task } from '../types/kanban'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    taskId?: string
  ) => void
  onDelete?: (taskId: string) => void
  task?: Task | null
  columns: Column[]
  initialColumnId?: string
  availableTags?: string[]
}

const TaskModalDialog: React.FC<TaskModalProps> = ({
  onClose,
  onSave,
  onDelete,
  task,
  columns,
  initialColumnId,
  availableTags = [],
}) => {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [columnId, setColumnId] = useState(
    task?.columnId || initialColumnId || columns[0]?.id || 'col-todo'
  )
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium')
  const [dueDate, setDueDate] = useState(task?.dueDate || '')
  const [tags, setTags] = useState<string[]>(task?.tags ? [...task.tags] : [])
  const [subtasks, setSubtasks] = useState<Subtask[]>(
    task?.subtasks ? [...task.subtasks] : []
  )

  const [tagInput, setTagInput] = useState('')
  const [subtaskInput, setSubtaskInput] = useState('')
  const [titleError, setTitleError] = useState(false)

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

  // Subtask handlers
  const handleAddSubtask = () => {
    const trimmed = subtaskInput.trim()
    if (!trimmed) return
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: trimmed,
      completed: false,
    }
    setSubtasks((prev) => [...prev, newSub])
    setSubtaskInput('')
  }

  const handleToggleSubtask = (subId: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s))
    )
  }

  const handleRemoveSubtask = (subId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subId))
  }

  // Tag handlers
  const handleAddTag = (tagToAdd?: string) => {
    const targetTag = (tagToAdd ?? tagInput).trim().replace(/^#/, '')
    if (!targetTag) return
    if (!tags.includes(targetTag)) {
      setTags((prev) => [...prev, targetTag])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove))
  }

  // Quick date shortcuts
  const setDateToday = () => {
    const today = new Date().toISOString().split('T')[0]
    setDueDate(today)
  }

  const setDateTomorrow = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    setDueDate(d.toISOString().split('T')[0])
  }

  // Save handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError(true)
      return
    }

    const isDone = columnId === 'col-done' || columnId.includes('done')

    const taskPayload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      columnId,
      priority,
      tags,
      dueDate: dueDate || undefined,
      subtasks,
      completedAt: isDone ? task?.completedAt || new Date().toISOString() : undefined,
      pomodoroMinutesSpent: task?.pomodoroMinutesSpent || 0,
    }

    onSave(taskPayload, task?.id)
    onClose()
  }

  // Priority button configuration
  const priorityOptions: {
    id: Priority
    label: string
    activeClass: string
    dotColor: string
  }[] = [
    {
      id: 'low',
      label: 'Baixa',
      activeClass:
        'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 ring-2 ring-slate-400/20',
      dotColor: 'bg-slate-400',
    },
    {
      id: 'medium',
      label: 'Média',
      activeClass:
        'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/20',
      dotColor: 'bg-amber-500',
    },
    {
      id: 'high',
      label: 'Alta',
      activeClass:
        'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700 ring-2 ring-orange-400/20',
      dotColor: 'bg-orange-500',
    },
    {
      id: 'urgent',
      label: 'Urgente',
      activeClass:
        'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700 ring-2 ring-rose-400/20',
      dotColor: 'bg-rose-500',
    },
  ]

  // Suggested tags that aren't already added
  const suggestedTags = availableTags.filter((t) => !tags.includes(t)).slice(0, 5)

  // Subtask progress
  const completedCount = subtasks.filter((s) => s.completed).length
  const totalSubtasks = subtasks.length

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl my-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2
              id="task-modal-title"
              className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
            >
              {task ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {task
                ? 'Atualize os detalhes da tarefa e acompanhe seu fluxo.'
                : 'Defina o objetivo, prioridade e etapas para foco total.'}
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
          id="task-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Title Input */}
          <div>
            <label
              htmlFor="task-title-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Título da Tarefa <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              autoFocus
              placeholder="Ex: Revisar layout da nova landing page"
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
                <AlertCircle className="w-3.5 h-3.5" />O título da tarefa é obrigatório.
              </p>
            )}
          </div>

          {/* Column & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Column Selector */}
            <div>
              <label
                htmlFor="task-column-select"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Coluna
              </label>
              <select
                id="task-column-select"
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="task-due-date"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Data de Vencimento
                </label>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={setDateToday}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    Hoje
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={setDateTomorrow}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    Amanhã
                  </button>
                  {dueDate && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <button
                        type="button"
                        onClick={() => setDueDate('')}
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
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Priority visual selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Prioridade
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorityOptions.map((opt) => {
                const isSelected = priority === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPriority(opt.id)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? opt.activeClass
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="task-description-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Descrição & Contexto
            </label>
            <textarea
              id="task-description-input"
              rows={3}
              placeholder="Adicione notas, contexto ou detalhes da tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Checklist / Subtasks Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Checklist de Subtarefas</span>
                {totalSubtasks > 0 && (
                  <span className="normal-case text-[11px] font-normal text-slate-400">
                    ({completedCount}/{totalSubtasks})
                  </span>
                )}
              </label>
            </div>

            {/* Progress bar if subtasks exist */}
            {totalSubtasks > 0 && (
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round((completedCount / totalSubtasks) * 100)}%`,
                  }}
                />
              </div>
            )}

            {/* Existing Subtask List */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto pr-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span
                        className={`text-xs text-slate-800 dark:text-slate-200 truncate ${
                          st.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : ''
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                      title="Remover subtarefa"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick add subtask input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Adicionar item ao checklist... (Pressione Enter)"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSubtask()
                  }
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                disabled={!subtaskInput.trim()}
                className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Tags Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <TagIcon className="w-3.5 h-3.5" />
              <span>Etiquetas (Tags)</span>
            </label>

            {/* Selected Tags Chips */}
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

            {/* Add Tag Input & Suggested Tags */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Nova tag... (Enter)"
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

          {/* Pomodoro info if existing */}
          {task && (task.pomodoroMinutesSpent ?? 0) > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>
                Total de foco registrado:{' '}
                <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                  {task.pomodoroMinutesSpent} minutos
                </strong>
              </span>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          {task && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(task.id)
                onClose()
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Tarefa</span>
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
              form="task-form"
              className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer"
            >
              {task ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const TaskModal: React.FC<TaskModalProps> = (props) => {
  if (!props.isOpen) return null

  // Key ensures component unmounts and remounts with fresh state when target changes
  const componentKey = props.task
    ? props.task.id
    : `new-${props.initialColumnId || 'default'}`

  return <TaskModalDialog key={componentKey} {...props} />
}
