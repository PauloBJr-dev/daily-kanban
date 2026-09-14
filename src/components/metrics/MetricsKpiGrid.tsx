import React from 'react'
import { Timer, Clock, CheckCircle2, Flame, ArrowUpRight, Award } from 'lucide-react'

interface MetricsKpiGridProps {
  stats: {
    total: number
    completedCount: number
    todayTotal: number
    todayCompleted: number
    overdueCount: number
    urgentCount: number
    completionRate: number
  }
  pomodoroMinutes: number
  pomodoroFormatted: string
  streak: {
    currentStreak: number
    recordStreak: number
  }
}

export const MetricsKpiGrid: React.FC<MetricsKpiGridProps> = ({
  stats,
  pomodoroMinutes,
  pomodoroFormatted,
  streak,
}) => {
  const cycles = Math.max(
    Math.floor(pomodoroMinutes / 25),
    stats.completedCount > 0 ? stats.completedCount : 0
  )
  const dailyAvgCycles = (cycles / 7).toFixed(1).replace('.0', '')
  const weeklyCycleGoal = 35
  const cycleGoalPct = Math.min(Math.round((cycles / weeklyCycleGoal) * 100), 100)

  return (
    <section
      aria-label="Indicadores Chave de Desempenho"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {/* KPI 1: Tempo Total em Foco */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-400/40 transition-colors">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-label text-xs font-medium text-slate-500 dark:text-slate-400">
                Tempo Total em Foco
              </span>
              <span className="text-[10px] text-slate-300 dark:text-slate-600">·</span>
              <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                Foco Pomodoro
              </span>
            </div>
            <h2 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {pomodoroFormatted}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-label">
          <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+14%</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-label">
            vs. semana anterior
          </span>
        </div>
      </div>

      {/* KPI 2: Ciclos Pomodoro */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-400/40 transition-colors">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="font-label text-xs font-medium text-slate-500 dark:text-slate-400">
              Ciclos Pomodoro
            </span>
            <h2 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {cycles}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                concluídos
              </span>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 font-label">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              Média: {dailyAvgCycles} ciclos / dia
            </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {cycleGoalPct}% da meta
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${cycleGoalPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* KPI 3: Tarefas Entregues */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-400/40 transition-colors">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-label text-xs font-medium text-slate-500 dark:text-slate-400">
                Tarefas Entregues
              </span>
              <span className="text-[10px] text-slate-300 dark:text-slate-600">·</span>
              <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                Taxa Geral de Conclusão
              </span>
            </div>
            <h2 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {stats.completedCount}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                / {stats.total}
              </span>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-label">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {stats.completionRate}% de conclusão
            </span>
            <span className="text-[11px] text-slate-400">no prazo</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            <span>Metas de Hoje</span>:{' '}
            <strong className="text-slate-700 dark:text-slate-300 font-semibold">
              {stats.todayCompleted}/{stats.todayTotal}
            </strong>
          </span>
        </div>
      </div>

      {/* KPI 4: Sequência Ativa */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-400/40 transition-colors">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="font-label text-xs font-medium text-slate-500 dark:text-slate-400">
              Sequência Ativa
            </span>
            <div className="flex items-baseline gap-2">
              <h2 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {streak.currentStreak}
              </h2>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 font-label">
                dias seguidos
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-amber-500/20" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-label">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md flex items-center gap-1 font-label">
            <Award className="w-3 h-3 text-amber-500" /> Recorde: {streak.recordStreak}{' '}
            dias
          </span>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span
              title="Tarefas com prioridade urgente pendentes"
              className={
                stats.urgentCount > 0
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : ''
              }
            >
              <span>Prioridade Urgente</span>: {stats.urgentCount}
            </span>
            <span>•</span>
            <span
              title="Tarefas atrasadas pendentes"
              className={
                stats.overdueCount > 0
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : ''
              }
            >
              <span>Tarefas Atrasadas</span>: {stats.overdueCount}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
