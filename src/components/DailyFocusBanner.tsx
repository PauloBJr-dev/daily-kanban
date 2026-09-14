import React, { useMemo } from 'react'
import { Timer, TrendingUp, Coffee } from 'lucide-react'

export interface DailyFocusBannerProps {
  stats: {
    total: number
    completedCount: number
    completionRate: number
  }
  focusMinutesSpent?: number
  pomodoroSession?: {
    mode: 'work' | 'break'
    timeLeft: number
    isRunning: boolean
  }
}

/**
 * Calculates the ISO week number for a given date.
 */
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Formats a Date object into a readable Portuguese string: "Quinta-feira, 24 de Outubro"
 */
function formatCurrentDate(date: Date): string {
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  const day = date.getDate()
  const month = date.toLocaleDateString('pt-BR', { month: 'long' })

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)

  return `${capitalizedWeekday}, ${day} de ${capitalizedMonth}`
}

/**
 * Formats focus minutes into "Xh Ym" or "Ym"
 */
function formatFocusTime(minutes: number): string {
  if (minutes <= 0) return '0m'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${mins}m`
}

export const DailyFocusBanner: React.FC<DailyFocusBannerProps> = ({
  stats,
  focusMinutesSpent = 0,
  pomodoroSession,
}) => {
  const today = useMemo(() => new Date(), [])
  const dateString = useMemo(() => formatCurrentDate(today), [today])
  const weekNumber = useMemo(() => getISOWeekNumber(today), [today])

  const completionRate = Math.min(100, Math.max(0, Math.round(stats.completionRate || 0)))

  // Dynamic productivity badge based on completion
  const productivityBadge =
    completionRate >= 50 || stats.completedCount > 3
      ? 'Produtividade Alta'
      : 'Ritmo Constante'

  // Pomodoro status text
  const breakStatusText = useMemo(() => {
    if (!pomodoroSession) return 'em 25 min'
    if (pomodoroSession.isRunning) {
      const minutesRemaining = Math.max(1, Math.ceil(pomodoroSession.timeLeft / 60))
      if (pomodoroSession.mode === 'work') {
        return `em ${minutesRemaining} min`
      }
      return `Pausa (${minutesRemaining}m)`
    }
    return 'Pausa em 25m'
  }, [pomodoroSession])

  return (
    <section
      aria-label="Resumo do Foco Diário"
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all duration-200"
    >
      {/* Subtle blur background effect from Stitch */}
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 w-64 h-64 bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: Headline & Status */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
              {productivityBadge}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Sprint Semanal {weekNumber}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Foco Diário: {dateString}
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
            Você completou{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {stats.completedCount} de {stats.total}
            </span>{' '}
            tarefas planejadas para hoje.{' '}
            {completionRate >= 50
              ? 'Excelente ritmo!'
              : 'Mantenha a consistência nos seus objetivos!'}
          </p>
        </div>

        {/* Right: Progress Radial & Compact Metric Badges */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-6 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
          {/* Radial-style Progress Summary */}
          <div className="flex items-center gap-3 pr-2 sm:border-r border-slate-200/60 dark:border-slate-700/60">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-700"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-blue-600 dark:text-blue-500 transition-all duration-500"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute text-xs font-bold text-slate-800 dark:text-slate-100">
                {completionRate}%
              </span>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Conclusão
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {stats.completedCount}/{stats.total} concluídas
              </div>
            </div>
          </div>

          {/* Micro Metric Chips */}
          <div className="grid grid-cols-3 gap-2">
            {/* 1. Foco */}
            <div className="px-3 py-2 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Foco
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {formatFocusTime(focusMinutesSpent)}
              </div>
            </div>

            {/* 2. Desempenho */}
            <div className="px-3 py-2 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />{' '}
                Desempenho
              </div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                +{completionRate}%
              </div>
            </div>

            {/* 3. Intervalo */}
            <div className="px-3 py-2 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />{' '}
                Intervalo
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {breakStatusText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
