import React, { useState } from 'react'
import { Plus, Circle, Clock, PauseCircle, CheckCircle2, Trash2 } from 'lucide-react'
import type { Column as ColumnType, Task } from '../types/kanban'
import { TaskCard } from './TaskCard'

interface ColumnProps {
  column: ColumnType
  allColumns: ColumnType[]
  tasks: Task[]
  onNewTaskInColumn: (columnId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onMoveTask: (taskId: string, targetColumnId: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onStartFocus: (taskId: string, taskTitle: string) => void
  onDeleteColumn?: (columnId: string) => void
  focusedTaskId?: string | null
}

export const Column: React.FC<ColumnProps> = ({
  column,
  allColumns,
  tasks,
  onNewTaskInColumn,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onToggleSubtask,
  onStartFocus,
  onDeleteColumn,
  focusedTaskId,
}) => {
  const [isDragOver, setIsDragOver] = useState(false)

  // Header styles per column theme
  const themeConfig: Record<
    ColumnType['colorTheme'],
    {
      dotColor: string
      badgeClass: string
      headerIcon: React.ReactNode
      dropHighlight: string
    }
  > = {
    blue: {
      dotColor: 'bg-blue-500',
      badgeClass:
        'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-100 dark:border-blue-900',
      headerIcon: <Circle className="w-3.5 h-3.5 text-blue-500" />,
      dropHighlight:
        'border-blue-400 bg-blue-50/20 dark:bg-blue-950/20 ring-2 ring-blue-400/30',
    },
    amber: {
      dotColor: 'bg-amber-500',
      badgeClass:
        'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-100 dark:border-amber-900',
      headerIcon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
      dropHighlight:
        'border-amber-400 bg-amber-50/20 dark:bg-amber-950/20 ring-2 ring-amber-400/30',
    },
    purple: {
      dotColor: 'bg-purple-500',
      badgeClass:
        'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-100 dark:border-purple-900',
      headerIcon: <PauseCircle className="w-3.5 h-3.5 text-purple-500" />,
      dropHighlight:
        'border-purple-400 bg-purple-50/20 dark:bg-purple-950/20 ring-2 ring-purple-400/30',
    },
    emerald: {
      dotColor: 'bg-emerald-500',
      badgeClass:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900',
      headerIcon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
      dropHighlight:
        'border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20 ring-2 ring-emerald-400/30',
    },
    rose: {
      dotColor: 'bg-rose-500',
      badgeClass:
        'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-100 dark:border-rose-900',
      headerIcon: <Circle className="w-3.5 h-3.5 text-rose-500" />,
      dropHighlight:
        'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20 ring-2 ring-rose-400/30',
    },
    slate: {
      dotColor: 'bg-slate-500',
      badgeClass:
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      headerIcon: <Circle className="w-3.5 h-3.5 text-slate-500" />,
      dropHighlight:
        'border-slate-400 bg-slate-100/30 dark:bg-slate-800/30 ring-2 ring-slate-400/30',
    },
  }

  const currentTheme = themeConfig[column.colorTheme] || themeConfig.slate

  // Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!isDragOver) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      onMoveTask(taskId, column.id)
    }
  }

  return (
    <div
      id={`column-${column.id}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region"
      aria-label={`Coluna ${column.title}`}
      className={`flex flex-col shrink-0 w-[86vw] max-w-[340px] sm:w-80 sm:max-w-sm rounded-3xl p-3.5 snap-center transition-all duration-200 ${
        isDragOver
          ? `${currentTheme.dropHighlight} scale-[1.01]`
          : 'bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center gap-2">
          {currentTheme.headerIcon}
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {column.title}
          </h2>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${currentTheme.badgeClass}`}
          >
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick add button in header */}
          <button
            onClick={() => onNewTaskInColumn(column.id)}
            title="Adicionar tarefa nesta coluna"
            aria-label={`Adicionar tarefa na coluna ${column.title}`}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Delete column button (only if more than 2 columns) */}
          {allColumns.length > 2 && onDeleteColumn && (
            <button
              onClick={() => onDeleteColumn(column.id)}
              title="Excluir coluna"
              aria-label={`Excluir coluna ${column.title}`}
              className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Task Cards Container */}
      <div className="flex-1 flex flex-col gap-3 min-h-[140px] overflow-y-auto p-1.5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columns={allColumns}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onMove={onMoveTask}
            onToggleSubtask={onToggleSubtask}
            onStartFocus={onStartFocus}
            isFocused={focusedTaskId === task.id}
          />
        ))}

        {/* Drop zone placeholder indicator when dragging over column */}
        {isDragOver && (
          <div
            data-testid="drop-indicator"
            className="py-3.5 px-4 border-2 border-dashed border-indigo-400/80 dark:border-indigo-400/70 bg-indigo-50/40 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse select-none transition-all duration-200 shadow-xs"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Solte para mover para {column.title}</span>
          </div>
        )}

        {/* Empty state hint */}
        {tasks.length === 0 && !isDragOver && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200/70 dark:border-slate-800/80 rounded-2xl text-center select-none">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Nenhuma tarefa aqui
            </p>
            <button
              onClick={() => onNewTaskInColumn(column.id)}
              aria-label={`Adicionar primeira tarefa na coluna ${column.title}`}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-1 focus-visible:outline-none focus-visible:underline cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>
        )}
      </div>

      {/* Bottom Add button */}
      <button
        onClick={() => onNewTaskInColumn(column.id)}
        aria-label={`Adicionar tarefa na coluna ${column.title}`}
        className="mt-3 w-full py-2 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/50 dark:hover:bg-slate-800/40 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Adicionar tarefa</span>
      </button>
    </div>
  )
}
