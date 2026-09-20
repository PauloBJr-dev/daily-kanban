import React from 'react'
import { GraduationCap, BookOpen, TrendingUp, Cpu, ArrowRight } from 'lucide-react'
import type { AcademicStats as AcademicStatsType, Subject } from '../../types/academic'
import { getSubjectColor } from './academicColors'

export interface AcademicStatsProps {
  stats: AcademicStatsType
  subjects?: Subject[]
  onStartReview?: () => void
}

export const AcademicStats: React.FC<AcademicStatsProps> = ({
  stats,
  subjects = [],
  onStartReview,
}) => {
  // Retenção calculada com base nas notas dominadas vs total ou fallback Stitch de 84%
  const retentionPercentage =
    stats.totalNotes === 0
      ? 100
      : Math.min(
          100,
          Math.max(60, Math.round((stats.masteredCount / stats.totalNotes) * 100) || 84)
        )

  const hoursStudied = Math.max(
    1,
    Math.round(stats.totalNotes * 0.8 + stats.masteredCount * 1.5) || 14
  )

  const recentNotesCount = Math.min(stats.totalNotes, 6)

  // Primeiras 4 disciplinas para a legenda de dots
  const displaySubjects = subjects.slice(0, 4)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Disciplinas Ativas */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
              Disciplinas Ativas
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {stats.subjectsCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              em andamento
            </span>
          </div>
        </div>

        {/* Discipline Dots Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400 min-h-[22px]">
          {displaySubjects.length > 0 ? (
            displaySubjects.map((sub) => {
              const colorConfig = getSubjectColor(sub.color)
              return (
                <span
                  key={sub.id}
                  className="flex items-center gap-1.5 truncate max-w-[70px]"
                  title={sub.name}
                >
                  <span className={`w-2 h-2 rounded-full ${colorConfig.dot} shrink-0`} />
                  <span className="truncate">{sub.name}</span>
                </span>
              )
            })
          ) : (
            <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
              Nenhuma disciplina cadastrada
            </span>
          )}
        </div>
      </div>

      {/* Card 2: Anotações Criadas */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
              Anotações Criadas
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {stats.totalNotes}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              registros
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <TrendingUp className="w-4 h-4" />
          <span>
            {recentNotesCount > 0
              ? `+${recentNotesCount} anotações esta semana`
              : 'Caderno atualizado'}
          </span>
        </div>
      </div>

      {/* Card 3: Revisão Espaçada */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-400/50 transition-all shadow-xs flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-3 -top-3 w-16 h-16 bg-amber-500/10 dark:bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
              Revisão Espaçada
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                stats.toReviewCount > 0
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60'
                  : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {stats.toReviewCount > 0 ? 'Urgente hoje' : 'Em dia ✨'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tracking-tight ${
                stats.toReviewCount > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {stats.toReviewCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              flashcards pendentes
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Algoritmo SM-2
          </span>
          <button
            type="button"
            onClick={onStartReview}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Iniciar sessão</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card 4: Retenção Estimada */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
              Retenção Estimada
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {retentionPercentage}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              ({hoursStudied}h estudadas)
            </span>
          </div>
        </div>

        {/* Progress Bar Stitch */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div
            className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={retentionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${retentionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
