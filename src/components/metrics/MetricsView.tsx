import React, { useState, useMemo, useRef } from 'react'
import {
  Flame,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  BarChart2,
  ListTodo,
} from 'lucide-react'
import type { Column, FilterState, Task } from '../../types/kanban'
import { FilterBar } from '../FilterBar'
import { QuickStats } from '../QuickStats'
import { getISOWeekRange, isTaskInDateRange } from '../../hooks/useKanban'

const DEFAULT_METRIC_COLUMNS: Column[] = [
  { id: 'col-todo', title: 'A Fazer', order: 0, colorTheme: 'slate' },
  { id: 'col-progress', title: 'Em Progresso', order: 1, colorTheme: 'amber' },
  { id: 'col-review', title: 'Em Espera', order: 2, colorTheme: 'blue' },
  { id: 'col-done', title: 'Concluído Hoje', order: 3, colorTheme: 'emerald' },
]

const getTaskColumn = (task: Task): string => task.columnId || 'col-todo'

const isTaskDone = (task: Task): boolean => {
  const col = getTaskColumn(task)
  return col === 'col-done' || col.includes('done')
}

export interface MetricsViewProps {
  tasks: Task[]
  columns?: Column[]
  allTags?: string[]
  focusTimeMinutes?: number
}

export const MetricsView: React.FC<MetricsViewProps> = ({
  tasks,
  columns = DEFAULT_METRIC_COLUMNS,
  allTags = [],
  focusTimeMinutes,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    priority: 'all',
    tag: null,
    scope: 'all',
    weekScope: 'this_week',
  })

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  // Filter tasks dynamically based on metrics filters
  const filteredTasks = useMemo(() => {
    const { start: thisWeekStart, end: thisWeekEnd } = getISOWeekRange('this_week')
    const { start: lastWeekStart, end: lastWeekEnd } = getISOWeekRange('last_week')

    return tasks.filter((task) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(query)
        const matchesDesc = task.description?.toLowerCase().includes(query) ?? false
        const matchesTag = task.tags.some((t) => t.toLowerCase().includes(query))
        if (!matchesTitle && !matchesDesc && !matchesTag) return false
      }

      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false
      }

      // Scope filter
      if (filters.scope === 'today') {
        return task.dueDate === todayStr
      }
      if (filters.scope === 'upcoming') {
        return task.dueDate && task.dueDate > todayStr
      }
      if (filters.scope === 'overdue') {
        const isDone = isTaskDone(task)
        return !isDone && task.dueDate && task.dueDate < todayStr
      }
      if (filters.scope === 'completed') {
        return isTaskDone(task)
      }

      // Weekly Filter
      const isDone = isTaskDone(task)
      if (isDone) {
        if (filters.weekScope === 'this_week') {
          if (!isTaskInDateRange(task, thisWeekStart, thisWeekEnd)) return false
        } else if (filters.weekScope === 'last_week') {
          if (!isTaskInDateRange(task, lastWeekStart, lastWeekEnd)) return false
        }
      }

      return true
    })
  }, [tasks, filters, todayStr])

  // Recalculate KPIs based on filtered tasks
  const stats = useMemo(() => {
    const total = filteredTasks.length
    const doneTasks = filteredTasks.filter((t) => isTaskDone(t))
    const completedCount = doneTasks.length

    const todayTasks = filteredTasks.filter((t) => t.dueDate === todayStr)
    const todayCompleted = todayTasks.filter((t) => isTaskDone(t)).length

    const overdueCount = filteredTasks.filter((t) => {
      const isDone = isTaskDone(t)
      return !isDone && t.dueDate && t.dueDate < todayStr
    }).length

    const urgentCount = filteredTasks.filter((t) => {
      const isDone = isTaskDone(t)
      return !isDone && t.priority === 'urgent'
    }).length

    const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0

    const { start: thisWeekStart, end: thisWeekEnd } = getISOWeekRange('this_week')
    const weekCompletedCount = doneTasks.filter((t) =>
      isTaskInDateRange(t, thisWeekStart, thisWeekEnd)
    ).length

    return {
      total,
      completedCount,
      todayTotal: todayTasks.length,
      todayCompleted,
      overdueCount,
      urgentCount,
      completionRate,
      weekCompletedCount,
    }
  }, [filteredTasks, todayStr])

  // Pomodoro Focus Minutes
  const totalPomodoroMinutes = useMemo(() => {
    if (focusTimeMinutes !== undefined) return focusTimeMinutes
    return filteredTasks.reduce((acc, t) => acc + (t.pomodoroMinutesSpent || 0), 0)
  }, [filteredTasks, focusTimeMinutes])

  const pomodoroFormatted = useMemo(() => {
    const hours = Math.floor(totalPomodoroMinutes / 60)
    const mins = totalPomodoroMinutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins} min`
  }, [totalPomodoroMinutes])

  // Priority Distribution Breakdown
  const priorityDistribution = useMemo(() => {
    const total = filteredTasks.length
    const counts = {
      urgent: filteredTasks.filter((t) => t.priority === 'urgent').length,
      high: filteredTasks.filter((t) => t.priority === 'high').length,
      medium: filteredTasks.filter((t) => t.priority === 'medium').length,
      low: filteredTasks.filter((t) => t.priority === 'low').length,
    }
    return [
      {
        id: 'urgent',
        label: 'Urgente',
        count: counts.urgent,
        pct: total > 0 ? Math.round((counts.urgent / total) * 100) : 0,
        color: 'bg-rose-500',
        textColor: 'text-rose-600 dark:text-rose-400',
      },
      {
        id: 'high',
        label: 'Alta',
        count: counts.high,
        pct: total > 0 ? Math.round((counts.high / total) * 100) : 0,
        color: 'bg-orange-500',
        textColor: 'text-orange-600 dark:text-orange-400',
      },
      {
        id: 'medium',
        label: 'Média',
        count: counts.medium,
        pct: total > 0 ? Math.round((counts.medium / total) * 100) : 0,
        color: 'bg-amber-500',
        textColor: 'text-amber-600 dark:text-amber-400',
      },
      {
        id: 'low',
        label: 'Baixa',
        count: counts.low,
        pct: total > 0 ? Math.round((counts.low / total) * 100) : 0,
        color: 'bg-slate-400',
        textColor: 'text-slate-600 dark:text-slate-400',
      },
    ]
  }, [filteredTasks])

  // Column Status Distribution Breakdown
  const columnDistribution = useMemo(() => {
    const total = filteredTasks.length
    return columns.map((col) => {
      const count = filteredTasks.filter((t) => getTaskColumn(t) === col.id).length
      const pct = total > 0 ? Math.round((count / total) * 100) : 0
      return {
        id: col.id,
        title: col.title,
        count,
        pct,
      }
    })
  }, [filteredTasks, columns])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Description Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Painel de Métricas & Produtividade
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe indicadores-chave, distribuição de tarefas e tempo de foco
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Dados atualizados em tempo real</span>
        </div>
      </div>

      {/* Global Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        totalFiltered={filteredTasks.length}
        allTasksCount={tasks.length}
        allTags={allTags}
        searchInputRef={searchInputRef}
      />

      {/* The 4 Dynamic KPI Cards */}
      <section aria-label="Indicadores Chave de Desempenho">
        <QuickStats stats={stats} />
      </section>

      {/* Analytical Productivity Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Pomodoro Accumulated Focus Time */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Foco Pomodoro
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {pomodoroFormatted}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tempo total registrado nas {filteredTasks.length} tarefas filtradas
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Média por tarefa:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {filteredTasks.length > 0
                ? `${Math.round(totalPomodoroMinutes / filteredTasks.length)} min`
                : '0 min'}
            </span>
          </div>
        </div>

        {/* Card 2: Priority Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Por Prioridade
            </span>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-2.5">
            {priorityDistribution.map((p) => (
              <div key={p.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {p.label}
                  </span>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {p.count} ({p.pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${p.color} rounded-full transition-all duration-300`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Column / Status Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Por Coluna
            </span>
            <ListTodo className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-2.5">
            {columnDistribution.map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                    {c.title}
                  </span>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {c.count} ({c.pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Table Preview of Filtered Tasks */}
      <section
        aria-label="Prévia das Tarefas Filtradas"
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Tarefas Analisadas</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredTasks.length}
            </span>
          </h3>
          <span className="text-xs text-slate-400">
            {filteredTasks.length === tasks.length
              ? 'Todas as tarefas do quadro'
              : `${filteredTasks.length} de ${tasks.length} tarefas exibidas`}
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Nenhuma tarefa corresponde aos filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
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
                {filteredTasks.slice(0, 10).map((t) => {
                  const col = columns.find((c) => c.id === t.columnId)
                  const isCompleted = isTaskDone(t)

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span
                            className={`font-medium ${
                              isCompleted
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400">
                        {col?.title || getTaskColumn(t)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 text-[10px] rounded font-medium ${
                            t.priority === 'urgent'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                              : t.priority === 'high'
                                ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400'
                                : t.priority === 'medium'
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
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
            {filteredTasks.length > 10 && (
              <div className="pt-2 text-center text-[11px] text-slate-400">
                Mostrando as primeiras 10 tarefas de {filteredTasks.length}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
