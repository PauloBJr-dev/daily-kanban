import React from 'react'
import { GraduationCap } from 'lucide-react'

export interface AcademicSectionProps {
  onOpenAcademicSubjects: () => void
}

export const AcademicSection: React.FC<AcademicSectionProps> = ({
  onOpenAcademicSubjects,
}) => {
  return (
    <section
      id="academico"
      aria-labelledby="settings-academic-title"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h2
            id="settings-academic-title"
            className="font-headline text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            Disciplinas &amp; Matérias Acadêmicas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organize matérias, cores de identificação e notas de estudo
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenAcademicSubjects}
        className="px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-xl transition-all cursor-pointer self-start sm:self-auto shrink-0 active:scale-[0.98]"
      >
        Acessar Espaço Acadêmico
      </button>
    </section>
  )
}
