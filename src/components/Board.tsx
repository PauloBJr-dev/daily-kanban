import React, { useState } from 'react'
import { Plus, X, Check } from 'lucide-react'
import type { Column as ColumnType, Task } from '../types/kanban'
import { Column } from './Column'

interface BoardProps {
  columns: ColumnType[]
  tasks: Task[]
  onNewTaskInColumn: (columnId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onMoveTask: (taskId: string, targetColumnId: string, targetIndex?: number) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onStartFocus: (taskId: string, taskTitle: string) => void
  onAddColumn: (title: string, colorTheme: ColumnType['colorTheme']) => void
  onDeleteColumn?: (columnId: string) => void
  focusedTaskId?: string | null
}

export const Board: React.FC<BoardProps> = ({
  columns,
  tasks,
  onNewTaskInColumn,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onToggleSubtask,
  onStartFocus,
  onAddColumn,
  onDeleteColumn,
  focusedTaskId,
}) => {
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<ColumnType['colorTheme']>('blue')

  const themes: {
    id: ColumnType['colorTheme']
    label: string
    colorClass: string
    ringClass: string
  }[] = [
    {
      id: 'blue',
      label: 'Azul',
      colorClass: 'bg-blue-500',
      ringClass: 'ring-blue-400',
    },
    {
      id: 'amber',
      label: 'Âmbar',
      colorClass: 'bg-amber-500',
      ringClass: 'ring-amber-400',
    },
    {
      id: 'purple',
      label: 'Roxo',
      colorClass: 'bg-purple-500',
      ringClass: 'ring-purple-400',
    },
    {
      id: 'emerald',
      label: 'Esmeralda',
      colorClass: 'bg-emerald-500',
      ringClass: 'ring-emerald-400',
    },
    {
      id: 'rose',
      label: 'Rosa',
      colorClass: 'bg-rose-500',
      ringClass: 'ring-rose-400',
    },
    {
      id: 'slate',
      label: 'Neutro',
      colorClass: 'bg-slate-500',
      ringClass: 'ring-slate-400',
    },
  ]

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColumnTitle.trim()) return

    onAddColumn(newColumnTitle.trim(), selectedTheme)
    setNewColumnTitle('')
    setSelectedTheme('blue')
    setIsAddingColumn(false)
  }

  const scrollToColumn = (columnId: string) => {
    if (typeof document === 'undefined') return
    const el = document.getElementById(`column-${columnId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }

  return (
    <div className="w-full">
      {/* Mobile Column Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Navegação rápida de colunas"
        className="flex sm:hidden items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 px-1 no-scrollbar"
      >
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.columnId === col.id)
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => scrollToColumn(col.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium shrink-0 active:scale-95 transition-all cursor-pointer min-h-[36px]"
              aria-label={`Ir para coluna ${col.title}`}
            >
              <span>Ir para {col.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 font-semibold">
                {colTasks.length}
              </span>
            </button>
          )
        })}
      </div>

      {/* Horizontal Scroll Columns Area */}
      <div className="flex items-start gap-4 sm:gap-5 overflow-x-auto pb-6 pt-1 px-1 scroll-smooth snap-x snap-mandatory">
        {columns.map((column) => {
          const colTasks = tasks.filter((t) => t.columnId === column.id)
          return (
            <Column
              key={column.id}
              column={column}
              allColumns={columns}
              tasks={colTasks}
              onNewTaskInColumn={onNewTaskInColumn}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onMoveTask={onMoveTask}
              onToggleSubtask={onToggleSubtask}
              onStartFocus={onStartFocus}
              onDeleteColumn={onDeleteColumn}
              focusedTaskId={focusedTaskId}
            />
          )
        })}

        {/* Add Column Section */}
        <div className="shrink-0 w-72">
          {isAddingColumn ? (
            <form
              onSubmit={handleCreateColumn}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Nova Coluna
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Title input */}
              <input
                type="text"
                autoFocus
                placeholder="Nome da coluna..."
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all mb-3"
              />

              {/* Color theme selection */}
              <div className="mb-4">
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Tema de Cor
                </label>
                <div className="flex items-center justify-between gap-1">
                  {themes.map((t) => {
                    const isSelected = selectedTheme === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTheme(t.id)}
                        title={t.label}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          t.colorClass
                        } ${
                          isSelected
                            ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${t.ringClass} scale-105`
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="flex-1 py-1.5 px-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newColumnTitle.trim()}
                  className="flex-1 py-1.5 px-3 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Criar Coluna
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="w-full min-h-[120px] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex flex-col items-center justify-center gap-2 transition-all duration-150 group cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-900/50"
            >
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-indigo-400 group-hover:text-indigo-600 flex items-center justify-center shadow-xs transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium tracking-tight">Adicionar Coluna</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
