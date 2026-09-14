import React, { useState } from 'react'
import { Check, Clock, Table, List, CheckCircle2 } from 'lucide-react'
import type { Column, Task } from '../../types/kanban'
import { formatTaskTimestamp } from './metricsUtils'

interface RecentSessionsPanelProps {
  tasks: Task[]
  columns: Column[]
}

export const RecentSessionsPanel: React.FC<RecentSessionsPanelProps> = ({
  tasks,
  columns,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list')
  const [showAll, setShowAll] = useState(false)

  const isTaskDone = (t: Task) =>
    t.columnId === 'col-done' || t.columnId?.includes('done') || Boolean(t.completedAt)

  const displayedTasks = showAll ? tasks : tasks.slice(0, 6)

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header with Title & Action */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-base font-semibold text-slate-900 dark:text-slate-100">
                Sessões Recentes de Foco
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800 font-label">
                Tarefas Analisadas
              </span>
            </div>
            <p className="font-label text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Histórico dos blocos de concentração cronometrados
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Visualização em Lista"
                aria-label="Visualização em Lista"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Visualização em Tabela"
                aria-label="Visualização em Tabela"
              >
                <Table className="w-3.5 h-3.5" />
              </button>
            </div>

            {tasks.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-label hover:underline cursor-pointer"
              >
                {showAll ? 'Ver menos' : 'Ver todas'}
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {tasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-label">
            Nenhuma tarefa corresponde aos filtros aplicados.
          </div>
        ) : viewMode === 'list' ? (
          /* List Mode (Stitch layout) */
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {displayedTasks.map((task) => {
              const done = isTaskDone(task)
              const minutes = task.pomodoroMinutesSpent || 25
              const cycles = Math.floor(minutes / 25)

              return (
                <div
                  key={task.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        done
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {done ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-semibold truncate font-headline ${
                          done
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-label">
                          {formatTaskTimestamp(task)}
                        </span>
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded font-label"
                          >
                            #{tag}
                          </span>
                        ))}
                        {cycles > 1 && (
                          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-label">
                            {cycles} ciclos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold font-label ${
                        minutes >= 50
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {minutes}m
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Table Mode */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-label">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-2 font-medium">Tarefa</th>
                  <th className="pb-2 font-medium">Coluna</th>
                  <th className="pb-2 font-medium">Prioridade</th>
                  <th className="pb-2 font-medium">Vencimento</th>
                  <th className="pb-2 font-medium text-right">Foco Pomodoro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {displayedTasks.map((t) => {
                  const col = columns.find((c) => c.id === t.columnId)
                  const done = isTaskDone(t)

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          {done ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span
                            className={`font-medium ${
                              done
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400">
                        {col?.title || t.columnId || 'A Fazer'}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 text-[10px] rounded font-medium ${
                            t.priority === 'urgent'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                              : t.priority === 'high'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                                : t.priority === 'medium'
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400">
                        {t.dueDate || '—'}
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                        {t.pomodoroMinutesSpent ? `${t.pomodoroMinutesSpent}m` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-label">
        <span>Produtividade calculada com base no timer de foco.</span>
        <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          Sincronizado há 5 min
        </span>
      </div>
    </div>
  )
}
