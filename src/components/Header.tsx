import React from 'react'
import {
  Plus,
  PanelLeft,
  Kanban,
  BookOpen,
  BarChart3,
  Settings,
  User,
} from 'lucide-react'
import { UserMenu } from './UserMenu'
import type { AppView } from './Sidebar'

export interface HeaderProps {
  onNewTask: () => void
  onExport?: () => void
  onImport?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReset?: () => void
  onOpenShortcuts?: () => void
  isDark?: boolean
  onToggleTheme?: () => void
  stats?: {
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

const renderViewIcon = (view: AppView) => {
  const iconClass = 'w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0'
  switch (view) {
    case 'academic':
      return <BookOpen className={iconClass} />
    case 'metrics':
      return <BarChart3 className={iconClass} />
    case 'settings':
      return <Settings className={iconClass} />
    case 'profile':
      return <User className={iconClass} />
    case 'kanban':
    default:
      return <Kanban className={iconClass} />
  }
}

export const Header: React.FC<HeaderProps> = ({
  onNewTask,
  activeView,
  onNewNote,
  onToggleSidebar,
}) => {
  return (
    <header className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl sticky top-0 z-30 transition-colors duration-200">
      <div className="w-full px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Sidebar Toggle Button + Module Icon + Module Title in single line */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Sidebar Toggle Button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Alternar barra lateral"
            title="Alternar barra lateral"
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer shrink-0"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {renderViewIcon(activeView)}
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {getViewTitle(activeView)}
            </h1>
          </div>
        </div>

        {/* Right Controls: Contextual Action Button, UserMenu on far right */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Main Action Button: Kanban -> Nova Tarefa, Academic -> Nova Anotação */}
          {activeView === 'academic' && (
            <button
              type="button"
              onClick={onNewNote}
              aria-label="Criar nova anotação"
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 min-h-[36px] sm:min-h-[40px] bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-500/20 text-white text-xs sm:text-sm font-medium rounded-xl hover:shadow transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Nova Anotação</span>
              <span className="sm:hidden">Nova</span>
              <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono bg-blue-700 text-blue-100 rounded-md border border-blue-500/40">
                N
              </kbd>
            </button>
          )}

          {activeView === 'kanban' && (
            <button
              type="button"
              onClick={onNewTask}
              aria-label="Criar nova tarefa"
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 min-h-[36px] sm:min-h-[40px] bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-500/20 text-white text-xs sm:text-sm font-medium rounded-xl hover:shadow transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Nova Tarefa</span>
              <span className="sm:hidden">Nova</span>
              <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono bg-blue-700 text-blue-100 rounded-md border border-blue-500/40">
                N
              </kbd>
            </button>
          )}

          {/* User Menu with Round Avatar on the far right */}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
