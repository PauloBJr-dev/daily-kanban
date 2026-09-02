import React from 'react'
import { Play, Pause, RotateCcw, Flame, Coffee, X } from 'lucide-react'
import { PomodoroSession } from '../types/kanban'

interface PomodoroWidgetProps {
  session: PomodoroSession
  onPlayPause: () => void
  onReset: () => void
  onSwitchMode: (mode: 'work' | 'break') => void
  onClearTask: () => void
  formatTime: (seconds: number) => string
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  session,
  onPlayPause,
  onReset,
  onSwitchMode,
  onClearTask,
  formatTime,
}) => {
  const isWork = session.mode === 'work'
  const maxDuration = isWork ? session.workDuration : session.breakDuration
  const progressPercent = Math.max(
    0,
    Math.min(100, ((maxDuration - session.timeLeft) / maxDuration) * 100)
  )

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left info */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isWork
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
          }`}
        >
          {isWork ? <Flame className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isWork ? 'Bloco de Foco Diário' : 'Pausa de Descanso'}
            </span>
            <div className="flex gap-1 text-[11px]">
              <button
                onClick={() => onSwitchMode('work')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  isWork
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                25m Foco
              </button>
              <button
                onClick={() => onSwitchMode('break')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  !isWork
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                5m Pausa
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            {session.taskTitle ? (
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-[280px]">
                🎯 {session.taskTitle}
              </span>
            ) : (
              <span className="text-sm text-slate-400 italic">
                Nenhuma tarefa selecionada (ou foco livre)
              </span>
            )}
            {session.taskId && (
              <button
                onClick={onClearTask}
                title="Desvincular tarefa"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right controls and timer */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        {/* Progress & Time */}
        <div className="flex items-center gap-3">
          <div className="w-20 sm:w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isWork ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xl font-mono font-bold tracking-tight text-slate-900 dark:text-slate-100 min-w-[60px]">
            {formatTime(session.timeLeft)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPlayPause}
            className={`p-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-xs ${
              session.isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            title={session.isRunning ? 'Pausar' : 'Iniciar Foco'}
          >
            {session.isRunning ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onReset}
            className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            title="Reiniciar tempo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
