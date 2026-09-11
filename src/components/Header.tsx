import React from 'react'
import {
  Plus,
  Sun,
  Moon,
  PanelLeft,
  BookOpen,
  BarChart3,
  Settings as SettingsIcon,
  User as UserIcon,
} from 'lucide-react'
import { UserMenu } from './UserMenu'
import type { AppView } from './Sidebar'

export interface HeaderProps {
  onNewTask: () => void
  onExport?: () => void
  onImport?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReset?: () => void
  onOpenShortcuts?: () => void
  isDark: boolean
  onToggleTheme: () => void
  stats: {
    completedCount: number
    total: number
    completionRate: number
  }
  activeView: AppView
  onViewChange?: (view: AppView) => void
  onNewNote?: () => void
  onToggleSidebar?: () => void
}

const getViewTitle = (view: AppView): string => {
  switch (view) {
    case 'academic':
      return 'Espaço Acadêmico'
    case 'metrics':
      return 'Métricas & Produtividade'
    case 'settings':
      return 'Configurações'
    case 'profile':
      return 'Perfil'
    case 'kanban':
    default:
      return 'Quadro Kanban'
  }
}

export const Header: React.FC<HeaderProps> = ({
  onNewTask,
  isDark,
  onToggleTheme,
  stats,
  activeView,
  onNewNote,
  onToggleSidebar,
}) => {
  // Format current date in Portuguese
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  // Capitalize first letter
  const formattedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1)

  return (
    <header className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl sticky top-0 z-30 transition-colors duration-200">
      <div className="w-full px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Sidebar Toggle Button + Active Screen Title (No OrganoCat duplicate) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sidebar Toggle Button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Alternar barra lateral"
            title="Alternar barra lateral"
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer shrink-0"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {getViewTitle(activeView)}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden xs:block">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Center Progress Pill / Context Indicator (Hidden on small screens) */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs">
          {activeView === 'kanban' && (
            <>
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Progresso Diário:
              </span>
              <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {stats.completedCount}/{stats.total} ({stats.completionRate}%)
              </span>
            </>
          )}
          {activeView === 'academic' && (
            <>
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Espaço de Estudos e Revisões
              </span>
            </>
          )}
          {activeView === 'metrics' && (
            <>
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Painel Analítico de Produtividade
              </span>
            </>
          )}
          {activeView === 'settings' && (
            <>
              <SettingsIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Preferências & Personalização
              </span>
            </>
          )}
          {activeView === 'profile' && (
            <>
              <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Gestão de Perfil & Dados
              </span>
            </>
          )}
        </div>

        {/* Right Controls: Theme Toggle, UserMenu, Main Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* User Menu */}
          <UserMenu />

          {/* Main Action Button (Nova Tarefa or Nova Anotação) */}
          {activeView === 'academic' ? (
            <button
              type="button"
              onClick={onNewNote}
              aria-label="Criar nova anotação"
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 min-h-[36px] sm:min-h-[40px] bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs shadow-indigo-200 dark:shadow-none hover:shadow transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Nova Anotação</span>
              <span className="sm:hidden">Nova</span>
              <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono bg-indigo-700 text-indigo-100 rounded-md border border-indigo-500/40">
                N
              </kbd>
            </button>
          ) : (
            <button
              type="button"
              onClick={onNewTask}
              aria-label="Criar nova tarefa"
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 min-h-[36px] sm:min-h-[40px] bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs shadow-indigo-200 dark:shadow-none hover:shadow transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Nova Tarefa</span>
              <span className="sm:hidden">Nova</span>
              <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono bg-indigo-700 text-indigo-100 rounded-md border border-indigo-500/40">
                N
              </kbd>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
