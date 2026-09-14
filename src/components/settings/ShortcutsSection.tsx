import React from 'react'
import { Keyboard } from 'lucide-react'

export interface ShortcutsSectionProps {
  onOpenShortcuts?: () => void
}

export const ShortcutsSection: React.FC<ShortcutsSectionProps> = ({
  onOpenShortcuts,
}) => {
  return (
    <section
      id="atalhos"
      aria-labelledby="settings-shortcuts-title"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-6 mb-12 transition-colors"
    >
      {/* Section Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="settings-shortcuts-title"
              className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Atalhos do Teclado
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Navegue e controle seus ciclos de foco rapidamente com o teclado
            </p>
          </div>
        </div>

        {onOpenShortcuts && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            aria-label="Abrir Modal de Ajuda (?)"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer shrink-0"
          >
            Abrir Modal de Ajuda (?)
          </button>
        )}
      </div>

      {/* Structured Cheat Sheet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Shortcut 1 */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Busca Rápida e Comandos
          </span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs text-slate-800 dark:text-slate-200 font-mono">
              ⌘K
            </kbd>
            <span className="text-xs text-slate-400 font-medium">ou</span>
            <kbd className="px-2 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs text-slate-800 dark:text-slate-200 font-mono">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Shortcut 2 */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Nova Tarefa / Nova Anotação
          </span>
          <kbd className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs text-slate-800 dark:text-slate-200 font-mono">
            N
          </kbd>
        </div>

        {/* Shortcut 3 */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Iniciar / Pausar Pomodoro
          </span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs text-slate-800 dark:text-slate-200 font-mono">
              P
            </kbd>
            <span className="text-xs text-slate-400 font-medium">ou</span>
            <kbd className="px-2 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs text-slate-800 dark:text-slate-200 font-mono">
              Espaço
            </kbd>
          </div>
        </div>

        {/* Shortcut 4 */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Alternar Modo Foco Tela Cheia
          </span>
          <kbd className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs text-slate-800 dark:text-slate-200 font-mono">
            F
          </kbd>
        </div>

        {/* Shortcut 5 */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Fechar modais e painéis ativos
          </span>
          <kbd className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs text-slate-800 dark:text-slate-200 font-mono">
            Esc
          </kbd>
        </div>

        {/* Shortcut 6 */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Avançar para próximo ciclo
          </span>
          <kbd className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs text-slate-800 dark:text-slate-200 font-mono">
            Tab
          </kbd>
        </div>
      </div>
    </section>
  )
}
