import React from 'react'
import { Layers, CheckCircle2, BookOpen, Flame } from 'lucide-react'

export interface ProfileStatsGridProps {
  totalTasks: number
  completedTasks: number
  notesCount: number
  pomodoroFormatted: string
}

export const ProfileStatsGrid: React.FC<ProfileStatsGridProps> = ({
  totalTasks,
  completedTasks,
  notesCount,
  pomodoroFormatted,
}) => {
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <section aria-labelledby="profile-stats-title" className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3
            id="profile-stats-title"
            className="text-sm font-bold text-slate-900 dark:text-slate-100 font-headline tracking-tight"
          >
            Resumo de Produtividade da Conta
          </h3>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Métricas calculadas em tempo real
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total de Tarefas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-blue-500/40 transition-colors">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total de Tarefas
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-headline">
              {totalTasks}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              No quadro Kanban
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Tarefas Concluídas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-emerald-500/40 transition-colors">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tarefas Concluídas
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-headline">
                {completedTasks}
              </span>
              {totalTasks > 0 && (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                  {completionRate}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Entregas realizadas
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Anotações Acadêmicas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-indigo-500/40 transition-colors">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Anotações Acadêmicas
            </span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-headline">
              {notesCount}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              No Espaço Acadêmico
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Tempo de Foco */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-amber-500/40 transition-colors">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tempo de Foco
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-headline">
              {pomodoroFormatted}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Pomodoro & cronômetro
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>
    </section>
  )
}
