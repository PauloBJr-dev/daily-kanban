import React, { useState } from 'react'
import { Play, Pause, RotateCcw, Flame, Coffee, X, Settings } from 'lucide-react'
import type { PomodoroSession } from '../types/kanban'
import { PomodoroSettingsModal } from './PomodoroSettingsModal'

interface PomodoroWidgetProps {
  session: PomodoroSession
  onPlayPause: () => void
  onReset: () => void
  onSwitchMode: (mode: 'work' | 'break') => void
  onClearTask: () => void
  formatTime: (seconds: number) => string
  onUpdateDurations?: (workMinutes: number, breakMinutes: number) => void
  onToggleSound?: () => void
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  session,
  onPlayPause,
  onReset,
  onSwitchMode,
  onClearTask,
  formatTime,
  onUpdateDurations,
  onToggleSound,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const isWork = session.mode === 'work'
  const maxDuration = isWork ? session.workDuration : session.breakDuration
  const progressPercent = Math.max(
    0,
    Math.min(100, ((maxDuration - session.timeLeft) / maxDuration) * 100)
  )

  const workMinutes = Math.round(session.workDuration / 60)
  const breakMinutes = Math.round(session.breakDuration / 60)

  const handleSaveSettings = (
    newWorkMinutes: number,
    newBreakMinutes: number,
    newSoundEnabled: boolean
  ) => {
    if (onUpdateDurations) {
      onUpdateDurations(newWorkMinutes, newBreakMinutes)
    }
    if (onToggleSound && (session.isSoundEnabled ?? true) !== newSoundEnabled) {
      onToggleSound()
    }
  }

  return (
    <>
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isWork
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
            } ${
              session.isRunning
                ? `ring-2 ring-offset-2 animate-pulse ${
                    isWork
                      ? 'ring-rose-400 dark:ring-rose-500 ring-offset-white dark:ring-offset-slate-900'
                      : 'ring-emerald-400 dark:ring-emerald-500 ring-offset-white dark:ring-offset-slate-900'
                  }`
                : ''
            }`}
          >
            {isWork ? <Flame className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
            {session.isRunning && (
              <span
                className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${
                  isWork ? 'bg-rose-500' : 'bg-emerald-500'
                } ring-2 ring-white dark:ring-slate-900 animate-ping`}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isWork ? 'Bloco de Foco Diário' : 'Pausa de Descanso'}
              </span>
              <div className="flex gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => onSwitchMode('work')}
                  aria-label={`Ativar modo de foco de ${workMinutes} minutos`}
                  className={`px-2 py-0.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer ${
                    isWork
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {workMinutes}m Foco
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchMode('break')}
                  aria-label={`Ativar modo de pausa de ${breakMinutes} minutos`}
                  className={`px-2 py-0.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer ${
                    !isWork
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {breakMinutes}m Pausa
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
                  type="button"
                  onClick={onClearTask}
                  title="Desvincular tarefa"
                  aria-label="Desvincular tarefa do timer"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
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
              type="button"
              onClick={onPlayPause}
              aria-label={
                session.isRunning ? 'Pausar cronômetro (P)' : 'Iniciar foco (P)'
              }
              title={session.isRunning ? 'Pausar (P)' : 'Iniciar Foco (P)'}
              className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl font-medium transition-all active:scale-95 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 cursor-pointer ${
                session.isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {session.isRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onReset}
              aria-label="Reiniciar cronômetro"
              title="Reiniciar tempo"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Configurar tempos do Pomodoro"
              title="Configurações do Pomodoro"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <PomodoroSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentWorkMinutes={workMinutes}
        currentBreakMinutes={breakMinutes}
        isSoundEnabled={session.isSoundEnabled ?? true}
        onSave={handleSaveSettings}
      />
    </>
  )
}
