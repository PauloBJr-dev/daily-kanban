import React, { useEffect } from 'react'
import { X, Keyboard, Plus, Search, Play, Sparkles } from 'lucide-react'

interface ShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutItem {
  keyLabel: string
  actionName: string
  description: string
  icon: React.ReactNode
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  // Close modal when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const shortcuts: ShortcutItem[] = [
    {
      keyLabel: 'N',
      actionName: 'Nova Tarefa',
      description: 'Abre instantaneamente o formulário de criação de tarefa.',
      icon: <Plus className="w-4 h-4 text-indigo-500" />,
    },
    {
      keyLabel: '/',
      actionName: 'Buscar Tarefas',
      description: 'Foca a barra de busca e seleciona o texto existente.',
      icon: <Search className="w-4 h-4 text-indigo-500" />,
    },
    {
      keyLabel: 'P',
      actionName: 'Timer Pomodoro',
      description: 'Alterna entre iniciar e pausar o cronômetro de foco.',
      icon: <Play className="w-4 h-4 text-indigo-500" />,
    },
    {
      keyLabel: '?',
      actionName: 'Guia de Atalhos',
      description: 'Abre ou fecha este painel rápido de atalhos de teclado.',
      icon: <Keyboard className="w-4 h-4 text-indigo-500" />,
    },
    {
      keyLabel: 'Esc',
      actionName: 'Fechar Painéis',
      description: 'Fecha qualquer diálogo, modal ou formulário ativo.',
      icon: <X className="w-4 h-4 text-slate-400" />,
    },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="shortcuts-modal-title"
                className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight"
              >
                Atalhos de Teclado
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Navegue pelo DailyFlow com rapidez e foco no trabalho diário
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar atalhos"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List with visual breathing room */}
        <div className="p-6 space-y-3">
          {shortcuts.map((s) => (
            <div
              key={s.keyLabel}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0 shadow-xs">
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    {s.actionName}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    {s.description}
                  </span>
                </div>
              </div>

              <kbd className="shrink-0 min-w-[32px] h-8 px-2.5 inline-flex items-center justify-center text-xs font-mono font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs">
                {s.keyLabel}
              </kbd>
            </div>
          ))}
        </div>

        {/* Informative Footer */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-[11px]">
              Atalhos são pausados automaticamente enquanto você digita.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Entendido, fechar ajuda"
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
