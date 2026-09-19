import React, { useState } from 'react'
import { Palette, CheckCircle2 } from 'lucide-react'

export interface AppearanceSectionProps {
  isDark: boolean
  onToggleTheme: () => void
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  isDark,
  onToggleTheme,
}) => {
  const [isSystemAuto, setIsSystemAuto] = useState<boolean>(false)

  const handleSelectLight = () => {
    setIsSystemAuto(false)
    if (isDark) {
      onToggleTheme()
    }
  }

  const handleSelectDark = () => {
    setIsSystemAuto(false)
    if (!isDark) {
      onToggleTheme()
    }
  }

  const handleSelectAuto = () => {
    setIsSystemAuto(true)
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark !== isDark) {
        onToggleTheme()
      }
    }
  }

  return (
    <section
      id="aparencia"
      aria-labelledby="settings-appearance-title"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-6 transition-colors"
    >
      {/* Section Header */}
      <div className="flex items-start gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <Palette className="w-5 h-5" />
        </div>
        <div>
          <h2
            id="settings-appearance-title"
            className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100"
          >
            Aparência &amp; Tema
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Escolha o tema visual do aplicativo
          </p>
        </div>
      </div>

      {/* 3 Visual Theme Cards with Previews */}
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
          Tema do Aplicativo
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card Claro */}
          <button
            type="button"
            onClick={handleSelectLight}
            aria-label="Selecionar Tema Claro"
            className={`p-3.5 rounded-2xl border-2 text-left flex flex-col gap-3 transition-all cursor-pointer ${
              !isDark && !isSystemAuto
                ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            {/* Mini Preview Light */}
            <div className="h-24 w-full rounded-xl bg-[#faf8ff] border border-slate-200/90 p-2.5 flex flex-col gap-2 overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="w-10 h-2.5 bg-blue-600 rounded" />
                <div className="w-3.5 h-3.5 rounded-full bg-slate-300" />
              </div>
              <div className="flex gap-2 h-full">
                <div className="w-1/4 bg-slate-200/70 rounded h-full" />
                <div className="w-3/4 flex flex-col gap-1.5">
                  <div className="w-full h-3.5 bg-slate-200/90 rounded" />
                  <div className="w-2/3 h-2.5 bg-slate-200/60 rounded" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Claro
              </span>
              {!isDark && !isSystemAuto ? (
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
              )}
            </div>
          </button>

          {/* Card Escuro */}
          <button
            type="button"
            onClick={handleSelectDark}
            aria-label="Selecionar Tema Escuro"
            className={`p-3.5 rounded-2xl border-2 text-left flex flex-col gap-3 transition-all cursor-pointer ${
              isDark && !isSystemAuto
                ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            {/* Mini Preview Dark */}
            <div className="h-24 w-full rounded-xl bg-[#191b23] border border-slate-800 p-2.5 flex flex-col gap-2 overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="w-10 h-2.5 bg-blue-500 rounded" />
                <div className="w-3.5 h-3.5 rounded-full bg-slate-700" />
              </div>
              <div className="flex gap-2 h-full">
                <div className="w-1/4 bg-slate-800 rounded h-full" />
                <div className="w-3/4 flex flex-col gap-1.5">
                  <div className="w-full h-3.5 bg-slate-800 rounded" />
                  <div className="w-2/3 h-2.5 bg-slate-800/70 rounded" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Escuro
              </span>
              {isDark && !isSystemAuto ? (
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
              )}
            </div>
          </button>

          {/* Card Automático */}
          <button
            type="button"
            onClick={handleSelectAuto}
            aria-label="Selecionar Tema Automático"
            className={`p-3.5 rounded-2xl border-2 text-left flex flex-col gap-3 transition-all cursor-pointer ${
              isSystemAuto
                ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            {/* Mini Preview Split */}
            <div className="h-24 w-full rounded-xl border border-slate-200/80 dark:border-slate-800 flex overflow-hidden shadow-2xs">
              <div className="w-1/2 bg-[#faf8ff] p-2.5 flex flex-col gap-1.5">
                <div className="w-8 h-2 bg-blue-600 rounded" />
                <div className="w-full h-3 bg-slate-200/80 rounded" />
                <div className="w-3/4 h-2 bg-slate-200/60 rounded" />
              </div>
              <div className="w-1/2 bg-[#191b23] p-2.5 flex flex-col gap-1.5">
                <div className="w-8 h-2 bg-blue-500 rounded ml-auto" />
                <div className="w-full h-3 bg-slate-800 rounded" />
                <div className="w-3/4 h-2 bg-slate-800/70 rounded ml-auto" />
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Automático (Sistema)
              </span>
              {isSystemAuto ? (
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
              )}
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}
