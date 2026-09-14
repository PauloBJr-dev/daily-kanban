import React, { useState, useMemo, useRef } from 'react'
import type { Column, FilterState, Task } from '../../types/kanban'
import { FilterBar } from '../FilterBar'
import { getISOWeekRange, isTaskInDateRange } from '../../hooks/useKanban'
import { MetricsHeader } from './MetricsHeader'
import { MetricsKpiGrid } from './MetricsKpiGrid'
import { FocusBarChart } from './FocusBarChart'
import { PriorityDistributionPanel } from './PriorityDistributionPanel'
import { RecentSessionsPanel } from './RecentSessionsPanel'
import {
  calculateDailyFocus,
  calculateStreak,
  formatMinutesToHours,
} from './metricsUtils'
import { exportMetricsCSV, exportMetricsJSON } from './exportMetricsReport'

const DEFAULT_METRIC_COLUMNS: Column[] = [
  { id: 'col-todo', title: 'A Fazer', order: 0, colorTheme: 'slate' },
  { id: 'col-progress', title: 'Em Progresso', order: 1, colorTheme: 'amber' },
  { id: 'col-review', title: 'Em Espera', order: 2, colorTheme: 'blue' },
  { id: 'col-done', title: 'Concluído Hoje', order: 3, colorTheme: 'emerald' },
]

const getTaskColumn = (task: Task): string => task.columnId || 'col-todo'

const isTaskDone = (task: Task): boolean => {
  const col = getTaskColumn(task)
  return col === 'col-done' || col.includes('done') || Boolean(task.completedAt)
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

    return {
      total,
      completedCount,
      todayTotal: todayTasks.length,
      todayCompleted,
      overdueCount,
      urgentCount,
      completionRate,
    }
  }, [filteredTasks, todayStr])

  // Pomodoro Focus Minutes
  const totalPomodoroMinutes = useMemo(() => {
    if (focusTimeMinutes !== undefined) return focusTimeMinutes
    return filteredTasks.reduce((acc, t) => acc + (t.pomodoroMinutesSpent || 0), 0)
  }, [filteredTasks, focusTimeMinutes])

  const pomodoroFormatted = useMemo(() => {
    return formatMinutesToHours(totalPomodoroMinutes)
  }, [totalPomodoroMinutes])

  // Streak Calculation
  const streak = useMemo(() => {
    return calculateStreak(tasks)
  }, [tasks])

  // Daily Focus Graph Data
  const dailyFocus = useMemo(() => {
    const { start: weekStart } = getISOWeekRange(
      filters.weekScope === 'last_week' ? 'last_week' : 'this_week'
    )
    return calculateDailyFocus(filteredTasks, weekStart, totalPomodoroMinutes)
  }, [filteredTasks, filters.weekScope, totalPomodoroMinutes])

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
        bgColor: 'bg-rose-50 dark:bg-rose-950/50',
      },
      {
        id: 'high',
        label: 'Alta',
        count: counts.high,
        pct: total > 0 ? Math.round((counts.high / total) * 100) : 0,
        color: 'bg-amber-500',
        textColor: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      },
      {
        id: 'medium',
        label: 'Média',
        count: counts.medium,
        pct: total > 0 ? Math.round((counts.medium / total) * 100) : 0,
        color: 'bg-blue-600',
        textColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      },
      {
        id: 'low',
        label: 'Baixa',
        count: counts.low,
        pct: total > 0 ? Math.round((counts.low / total) * 100) : 0,
        color: 'bg-slate-400',
        textColor: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
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

  const getPeriodLabel = () => {
    return filters.weekScope === 'this_week'
      ? 'Esta Semana'
      : filters.weekScope === 'last_week'
        ? 'Semana Passada'
        : 'Últimos 30 Dias'
  }

  const handleExportCSV = () => {
    exportMetricsCSV({
      tasks: filteredTasks,
      columns,
      pomodoroMinutes: totalPomodoroMinutes,
      completionRate: stats.completionRate,
      periodLabel: getPeriodLabel(),
    })
  }

  const handleExportJSON = () => {
    exportMetricsJSON({
      tasks: filteredTasks,
      columns,
      pomodoroMinutes: totalPomodoroMinutes,
      completionRate: stats.completionRate,
      periodLabel: getPeriodLabel(),
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Analítico & Seletor de Período Stitch */}
      <MetricsHeader
        weekScope={filters.weekScope}
        onWeekScopeChange={(scope) => handleFilterChange({ weekScope: scope })}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />

      {/* Global Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        totalFiltered={filteredTasks.length}
        allTasksCount={tasks.length}
        allTags={allTags}
        searchInputRef={searchInputRef}
      />

      {/* 2. Grid dos 4 KPI Cards Oficiais do Stitch */}
      <MetricsKpiGrid
        stats={stats}
        pomodoroMinutes={totalPomodoroMinutes}
        pomodoroFormatted={pomodoroFormatted}
        streak={streak}
      />

      {/* 3. Gráfico de Barras Semanais de Foco */}
      <FocusBarChart
        days={dailyFocus.days}
        bestDayLabel={dailyFocus.bestDayLabel}
        weeklyAvgFormatted={dailyFocus.weeklyAvgFormatted}
      />

      {/* 4. Painéis Inferiores Lado a Lado (Distribuição por Prioridade & Sessões Recentes) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Esquerdo: Distribuição por Prioridade (5 cols) */}
        <div className="lg:col-span-5">
          <PriorityDistributionPanel
            completedCount={stats.completedCount}
            totalCount={stats.total}
            priorityItems={priorityDistribution}
            columnItems={columnDistribution}
          />
        </div>

        {/* Painel Direito: Sessões Recentes de Foco / Tarefas Analisadas (7 cols) */}
        <div className="lg:col-span-7">
          <RecentSessionsPanel tasks={filteredTasks} columns={columns} />
        </div>
      </section>
    </div>
  )
}
