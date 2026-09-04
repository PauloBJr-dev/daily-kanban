import React from 'react'
import { BookOpen, GraduationCap, Clock, CheckCircle2, Pin } from 'lucide-react'
import type { AcademicStats as AcademicStatsType } from '../../types/academic'

interface AcademicStatsProps {
  stats: AcademicStatsType
}

export const AcademicStats: React.FC<AcademicStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
      {/* 1. Total de Anotações */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
            Total de Anotações
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {stats.totalNotes}
            </span>
            <span className="text-xs text-slate-400">nota(s)</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Disciplinas Ativas */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Disciplinas Ativas
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-violet-600 dark:text-violet-400">
              {stats.subjectsCount}
            </span>
            <span className="text-xs text-slate-400">em curso</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
          <GraduationCap className="w-5 h-5" />
        </div>
      </div>

      {/* 3. A Revisar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            A Revisar
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold tracking-tight ${
                stats.toReviewCount > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {stats.toReviewCount}
            </span>
            <span className="text-xs text-slate-400">
              {stats.toReviewCount === 0 ? 'Em dia! ✨' : 'pendente(s)'}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Dominadas */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Dominadas
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats.masteredCount}
            </span>
            <span className="text-xs text-slate-400">concluída(s)</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* 5. Fixadas */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Fixadas
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {stats.pinnedCount}
            </span>
            <span className="text-xs text-slate-400">destaque(s)</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <Pin className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
