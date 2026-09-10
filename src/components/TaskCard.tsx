import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Clock,
  CheckSquare,
  AlertCircle,
  MoreHorizontal,
  Play,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit2,
  Calendar,
  Check,
} from 'lucide-react'
import type { Column, Priority, Task } from '../types/kanban'

interface TaskCardProps {
  task: Task
  columns: Column[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onMove: (taskId: string, targetColumnId: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onStartFocus: (taskId: string, taskTitle: string) => void
  isFocused?: boolean
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  columns,
  onEdit,
  onDelete,
  onMove,
  onToggleSubtask,
  onStartFocus,
  isFocused = false,
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Automatic Background Timer (1s ticker when active)
  const [nowMs, setNowMs] = useState<number>(() => Date.now())
  const isTimerRunning = Boolean(task.timeTracked?.currentTimerStartedAt)

  useEffect(() => {
    if (!isTimerRunning) return
    const interval = setInterval(() => {
      setNowMs(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const totalTrackedSeconds = useMemo(() => {
    const tt = task.timeTracked
    let sec = (tt?.inProgressSeconds || 0) + (tt?.inReviewSeconds || 0)
    if (tt?.currentTimerStartedAt) {
      const startedAt = new Date(tt.currentTimerStartedAt).getTime()
      if (!isNaN(startedAt)) {
        sec += Math.max(0, Math.floor((nowMs - startedAt) / 1000))
      }
    }
    return sec
  }, [task.timeTracked, nowMs])

  const formatTrackedTime = (totalSeconds: number): string => {
    if (totalSeconds < 60) {
      return `${totalSeconds}s`
    }
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
  }

  // Dismiss menu on click outside or Escape
  useEffect(() => {
    if (!showMenu) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showMenu])

  // Subtask progress
  const totalSubtasks = task.subtasks.length
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length
  const subtaskProgress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  // Subtasks visibility logic (max 4 initial, expand/collapse if > 4)
  const hasMoreSubtasks = totalSubtasks > 4
  const visibleSubtasks =
    hasMoreSubtasks && !isExpanded ? task.subtasks.slice(0, 4) : task.subtasks
  const remainingSubtasks = totalSubtasks - 4

  // Due date analysis
  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = task.dueDate === todayStr
  const isDone = task.columnId === 'col-done' || task.columnId.includes('done')
  const isOverdue = !isDone && task.dueDate ? task.dueDate < todayStr : false

  // Priority styling
  const priorityConfig: Record<
    Priority,
    { label: string; badgeClass: string; dotClass: string }
  > = {
    urgent: {
      label: 'Urgente',
      badgeClass:
        'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900',
      dotClass: 'bg-rose-500',
    },
    high: {
      label: 'Alta',
      badgeClass:
        'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/80 dark:border-orange-900',
      dotClass: 'bg-orange-500',
    },
    medium: {
      label: 'Média',
      badgeClass:
        'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900',
      dotClass: 'bg-amber-500',
    },
    low: {
      label: 'Baixa',
      badgeClass:
        'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      dotClass: 'bg-slate-400',
    },
  }

  const currentPriority = priorityConfig[task.priority]

  // Find next and previous column for quick progression
  const currentColIndex = columns.findIndex((c) => c.id === task.columnId)
  const prevColumn = currentColIndex > 0 ? columns[currentColIndex - 1] : null
  const nextColumn =
    currentColIndex !== -1 && currentColIndex < columns.length - 1
      ? columns[currentColIndex + 1]
      : null

  // Drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative p-4 rounded-2xl bg-white dark:bg-slate-800 transition-all duration-150 select-none cursor-grab active:cursor-grabbing ${
        isDragging
          ? 'opacity-40 scale-95 border-2 border-indigo-400 shadow-none'
          : isFocused
            ? 'border-2 border-indigo-500 dark:border-indigo-400 shadow-xs'
            : 'border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
      } ${isDone ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      {/* Top row: Priority badge + Timer badge + Focused badge + Quick actions */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-tight ${currentPriority.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentPriority.dotClass}`} />
            {currentPriority.label}
          </span>

          {/* Discreet Timer badge */}
          {totalTrackedSeconds > 0 && (
            <span
              data-testid="task-timer-badge"
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                isTimerRunning
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
              title={isTimerRunning ? 'Cronômetro ativo' : 'Tempo acumulado'}
              aria-label={
                isTimerRunning
                  ? `Cronômetro ativo: ${formatTrackedTime(totalTrackedSeconds)}`
                  : `Tempo acumulado: ${formatTrackedTime(totalTrackedSeconds)}`
              }
            >
              {isTimerRunning ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <Clock className="w-3 h-3 text-slate-400" />
              )}
              <span>{formatTrackedTime(totalTrackedSeconds)}</span>
            </span>
          )}

          {/* Focused badge */}
          {isFocused && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 animate-pulse">
              Foco Ativo
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Quick Focus Button */}
          {!isDone && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onStartFocus(task.id, task.title)
              }}
              title="Iniciar Pomodoro nesta tarefa"
              aria-label={`Iniciar Pomodoro para: ${task.title}`}
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick next column button (Desktop only, mobile uses bottom touch bar) */}
          {nextColumn && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMove(task.id, nextColumn.id)
              }}
              title={`Avançar para ${nextColumn.title}`}
              aria-label={`Avançar tarefa para ${nextColumn.title}`}
              className="hidden sm:flex p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Options Dropdown toggle with click-outside and Escape dismiss */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              title="Mais opções"
              aria-label={`Mais opções para: ${task.title}`}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-6 w-36 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 text-xs"
              >
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onEdit(task)
                  }}
                  aria-label="Editar tarefa"
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-700 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onDelete(task.id)
                  }}
                  aria-label="Excluir tarefa"
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 focus-visible:outline-none focus-visible:bg-rose-50 dark:focus-visible:bg-rose-950/40 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Title */}
      <h3
        onClick={() => onEdit(task)}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onEdit(task)
          }
        }}
        aria-label={`Editar tarefa: ${task.title}`}
        className={`text-sm font-medium leading-snug cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-md ${
          isDone
            ? 'line-through text-slate-400 dark:text-slate-500'
            : 'text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400'
        }`}
      >
        {task.title}
      </h3>

      {/* Description (brief) */}
      {task.description && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Subtasks summary with mini progress bar */}
      {totalSubtasks > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-medium">
              <CheckSquare className="w-3 h-3 text-slate-400" />
              Checklist ({completedSubtasks}/{totalSubtasks})
            </span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {Math.round(subtaskProgress)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>

          {/* Interactive subtasks list */}
          <div className="mt-2 space-y-1.5">
            {visibleSubtasks.map((st) => (
              <div
                key={st.id}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSubtask(task.id, st.id)
                }}
                className="flex items-center gap-2 group/subtask cursor-pointer text-xs"
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={st.completed}
                  aria-label={st.title}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleSubtask(task.id, st.id)
                  }}
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-150 shrink-0 cursor-pointer ${
                    st.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs'
                      : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-800'
                  }`}
                >
                  {st.completed && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </button>
                <span
                  className={`text-slate-700 dark:text-slate-300 transition-colors select-none leading-snug break-words ${
                    st.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                  }`}
                >
                  {st.title}
                </span>
              </div>
            ))}
          </div>

          {/* Show more/less button if more than 4 subtasks */}
          {hasMoreSubtasks && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="mt-2 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-1 transition-colors"
            >
              {isExpanded
                ? 'Ver menos'
                : `Ver mais ${remainingSubtasks} ${remainingSubtasks === 1 ? 'subtarefa' : 'subtarefas'}`}
            </button>
          )}
        </div>
      )}

      {/* Footer: Due Date */}
      {task.dueDate && (
        <div className="mt-3 pt-2 flex items-center justify-end text-xs">
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
              isOverdue
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900'
                : isToday
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900'
                  : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-3 h-3 text-rose-500" />
            ) : isToday ? (
              <Clock className="w-3 h-3 text-blue-500" />
            ) : (
              <Calendar className="w-3 h-3" />
            )}
            <span>{isOverdue ? 'Atrasado' : isToday ? 'Hoje' : task.dueDate}</span>
          </div>
        </div>
      )}

      {/* Mobile Touch Quick Move Controls */}
      {(prevColumn || nextColumn) && (
        <div
          className={`sm:hidden pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs ${
            prevColumn && nextColumn
              ? 'grid grid-cols-2 gap-2'
              : 'flex items-center justify-end'
          }`}
        >
          {prevColumn && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMove(task.id, prevColumn.id)
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 font-medium active:scale-95 transition-all cursor-pointer min-h-[38px] overflow-hidden"
              aria-label={`Mover para ${prevColumn.title}`}
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">← {prevColumn.title}</span>
            </button>
          )}

          {nextColumn && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMove(task.id, nextColumn.id)
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 font-medium active:scale-95 transition-all cursor-pointer min-h-[38px] overflow-hidden ${
                !prevColumn ? 'w-full' : ''
              }`}
              aria-label={`Mover para ${nextColumn.title}`}
            >
              <span className="truncate">{nextColumn.title} →</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
