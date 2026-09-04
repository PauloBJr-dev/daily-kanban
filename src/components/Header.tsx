import React from 'react'
import {
  Plus,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  CheckCircle2,
  Keyboard,
  Kanban,
  GraduationCap,
  BookOpen,
} from 'lucide-react'

interface HeaderProps {
  onNewTask: () => void
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
  onOpenShortcuts?: () => void
  isDark: boolean
  onToggleTheme: () => void
  stats: {
    completedCount: number
    total: number
    completionRate: number
  }
  activeView: 'kanban' | 'academic'
  onViewChange: (view: 'kanban' | 'academic') => void
  onNewNote?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  onNewTask,
  onExport,
  onImport,
  onReset,
  onOpenShortcuts,
  isDark,
  onToggleTheme,
  stats,
  activeView,
  onViewChange,
  onNewNote,
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
    <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo & View Switcher */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          {/* Logo & Daily Date */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-none shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5 sm:gap-2">
                DailyFlow
                <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                  {activeView === 'academic' ? 'Acadêmico' : 'Kanban'}
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden xs:block">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Segmented View Switcher */}
          <nav
            role="tablist"
            aria-label="Modo de visualização"
            className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 transition-colors"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'kanban'}
              onClick={() => onViewChange('kanban')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-1.5 min-h-[38px] sm:min-h-0 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                activeView === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-900/5 dark:ring-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quadro Diário</span>
              <span className="sm:hidden">Quadro</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'academic'}
              onClick={() => onViewChange('academic')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-1.5 min-h-[38px] sm:min-h-0 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                activeView === 'academic'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-900/5 dark:ring-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Espaço Acadêmico</span>
              <span className="sm:hidden">Caderno</span>
            </button>
          </nav>
        </div>

        {/* Center Info / Progress Pill */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          {activeView === 'kanban' ? (
            <>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Progresso Diário:
              </span>
              <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {stats.completedCount}/{stats.total} ({stats.completionRate}%)
              </span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Espaço de Estudos e Revisões
              </span>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Export / Import / Reset / Shortcuts / Theme */}
          <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2">
            <button
              onClick={onExport}
              title="Exportar backup em JSON"
              aria-label="Exportar backup em JSON"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              title="Importar dados JSON"
              aria-label="Importar dados JSON"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-within:ring-2 focus-within:ring-indigo-500/50 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={onImport} className="hidden" />
            </label>

            <button
              onClick={onReset}
              title="Restaurar dados de demonstração"
              aria-label="Restaurar dados de demonstração"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Shortcuts Help Button */}
            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                title="Atalhos de teclado (?)"
                aria-label="Atalhos de teclado"
                className="flex items-center gap-1 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
              >
                <Keyboard className="w-4 h-4" />
                <kbd className="hidden lg:inline-flex items-center justify-center px-1 text-[10px] font-mono font-medium rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  ?
                </kbd>
              </button>
            )}
          </div>

          {/* Theme Toggle Button (Desktop and Mobile) */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="p-2 sm:p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Main Action Button (New Task / New Note) */}
          {activeView === 'academic' ? (
            <button
              type="button"
              onClick={onNewNote}
              aria-label="Criar nova anotação"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 min-h-[40px] sm:min-h-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm shadow-indigo-200 dark:shadow-none hover:shadow transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline">Nova Anotação</span>
              <span className="xs:hidden">Nova</span>
              <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono bg-indigo-700 text-indigo-100 rounded-md border border-indigo-500/40">
                N
              </kbd>
            </button>
          ) : (
            <button
              type="button"
              onClick={onNewTask}
              aria-label="Criar nova tarefa"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 min-h-[40px] sm:min-h-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm shadow-indigo-200 dark:shadow-none hover:shadow transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline">Nova Tarefa</span>
              <span className="xs:hidden">Nova</span>
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
