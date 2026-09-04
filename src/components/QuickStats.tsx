import React from 'react'
import { CheckCircle2, Clock, AlertTriangle, CalendarDays } from 'lucide-react'

interface QuickStatsProps {
  stats: {
    total: number
    completedCount: number
    todayTotal: number
    todayCompleted: number
    overdueCount: number
    urgentCount: number
    completionRate: number
  }
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* 1. Hoje */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
            Metas de Hoje
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {stats.todayCompleted}/{stats.todayTotal}
            </span>
            <span className="text-xs text-slate-400">concluídas</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <CalendarDays className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Total Geral Concluído */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Taxa Geral de Conclusão
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats.completionRate}%
            </span>
            <span className="text-xs text-slate-400">
              ({stats.completedCount}/{stats.total})
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Urgentes em aberto */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Prioridade Urgente
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {stats.urgentCount}
            </span>
            <span className="text-xs text-slate-400">pendente(s)</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Atrasadas */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tarefas Atrasadas
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold tracking-tight ${
                stats.overdueCount > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {stats.overdueCount}
            </span>
            <span className="text-xs text-slate-400">
              {stats.overdueCount === 0 ? 'Tudo em dia! ✨' : 'atenção'}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
