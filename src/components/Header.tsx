import React from 'react'
import { Plus, Download, Upload, RotateCcw, Sun, Moon, CheckCircle2 } from 'lucide-react'

interface HeaderProps {
  onNewTask: () => void
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
  isDark: boolean
  onToggleTheme: () => void
  stats: {
    completedCount: number
    total: number
    completionRate: number
  }
}

export const Header: React.FC<HeaderProps> = ({
  onNewTask,
  onExport,
  onImport,
  onReset,
  isDark,
  onToggleTheme,
  stats,
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
        {/* Logo & Daily Date */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-none">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              DailyFlow
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                Kanban
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{formattedDate}</p>
          </div>
        </div>

        {/* Center Progress Pill */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
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
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Export / Import / Reset / Theme */}
          <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2">
            <button
              onClick={onExport}
              title="Exportar backup em JSON"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              title="Importar dados JSON"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={onImport} className="hidden" />
            </label>

            <button
              onClick={onReset}
              title="Restaurar dados de demonstração"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleTheme}
              title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* New Task Button */}
          <button
            onClick={onNewTask}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-200 dark:shadow-none hover:shadow transition-all duration-150 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>
    </header>
  )
}
