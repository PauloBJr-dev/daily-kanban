import React, { useState } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  Coffee,
  Sparkles,
  X,
  Settings,
  Maximize2,
} from 'lucide-react'
import type { PomodoroSession } from '../types/kanban'
import { PomodoroSettingsModal } from './PomodoroSettingsModal'

export interface PomodoroWidgetProps {
  session: PomodoroSession
  onPlayPause: () => void
  onReset: () => void
  onSwitchMode: (mode: 'work' | 'short_break' | 'long_break' | 'break') => void
  onClearTask: () => void
  formatTime: (seconds: number) => string
  onUpdateDurations?: (
    workMinutes: number,
    breakMinutes: number,
    longBreakMinutes?: number
  ) => void
  onToggleSound?: () => void
  onOpenFullscreen?: () => void
  onUpdateSettings?: (
    workMinutes: number,
    breakMinutes: number,
    soundEnabled: boolean
  ) => void
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
  onOpenFullscreen,
  onUpdateSettings,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const isWork = session.mode === 'work'
  const isLongBreak = session.mode === 'long_break'
  const isShortBreak = session.mode === 'short_break' || session.mode === 'break'

  const maxDuration = isWork
    ? session.workDuration
    : isLongBreak
      ? session.longBreakDuration || 15 * 60
      : session.breakDuration

  const progressPercent = Math.max(
    0,
    Math.min(100, ((maxDuration - session.timeLeft) / maxDuration) * 100)
  )

  const isNearEnd = session.isRunning && session.timeLeft <= 5 && session.timeLeft > 0

  const workMinutes = Math.round(session.workDuration / 60)
  const breakMinutes = Math.round(session.breakDuration / 60)
  const longBreakMinutes = Math.round((session.longBreakDuration || 15 * 60) / 60)

  const currentCycle = session.currentCycle || 1
  const totalCycles = session.totalCycles || 4

  const handleSaveSettings = (
    newWorkMinutes: number,
    newBreakMinutes: number,
    newSoundEnabled: boolean
  ) => {
    if (onUpdateSettings) {
      onUpdateSettings(newWorkMinutes, newBreakMinutes, newSoundEnabled)
    } else {
      if (onUpdateDurations) {
        onUpdateDurations(newWorkMinutes, newBreakMinutes)
      }
      if (onToggleSound && (session.isSoundEnabled ?? true) !== newSoundEnabled) {
        onToggleSound()
      }
    }
  }

  return (
    <>
      <div
        data-testid="pomodoro-widget"
        className={`p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border transition-all duration-300 shadow-xs flex flex-col gap-3 ${
          isNearEnd
            ? 'border-amber-400/80 dark:border-amber-500/80 ring-2 ring-amber-500/60 shadow-lg shadow-amber-500/20 animate-pulse'
            : isLongBreak
              ? 'border-indigo-200/70 dark:border-indigo-800/60'
              : isWork
                ? 'border-rose-200/70 dark:border-rose-800/60'
                : 'border-emerald-200/70 dark:border-emerald-800/60'
        }`}
      >
        {/* Transition Countdown Banner */}
        {session.isAutoTransitioning && (
          <div className="w-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/40 rounded-xl px-3.5 py-2 flex items-center justify-between gap-3 animate-countdown-blink animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-sm">
                ⏳ {session.mode === 'work' ? 'Iniciando foco' : 'Iniciando descanso'} em{' '}
                {session.autoTransitionSecondsLeft ?? 5}s...
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPlayPause}
                aria-label="Iniciar imediatamente"
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white cursor-pointer transition-colors shadow-2xs"
              >
                Iniciar agora
              </button>
              <button
                type="button"
                onClick={onReset}
                aria-label="Cancelar transição"
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left info & Mode Tabs */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isWork
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  : isLongBreak
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
              } ${
                session.isRunning
                  ? `ring-2 ring-offset-2 animate-pulse ${
                      isWork
                        ? 'ring-rose-400 dark:ring-rose-500 ring-offset-white dark:ring-offset-slate-900'
                        : isLongBreak
                          ? 'ring-indigo-400 dark:ring-indigo-500 ring-offset-white dark:ring-offset-slate-900'
                          : 'ring-emerald-400 dark:ring-emerald-500 ring-offset-white dark:ring-offset-slate-900'
                    }`
                  : ''
              }`}
            >
              {isWork ? (
                <Flame className="w-5 h-5" />
              ) : isLongBreak ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <Coffee className="w-5 h-5" />
              )}
              {session.isRunning && (
                <span
                  className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${
                    isWork
                      ? 'bg-rose-500'
                      : isLongBreak
                        ? 'bg-indigo-500'
                        : 'bg-emerald-500'
                  } ring-2 ring-white dark:ring-slate-900 animate-ping`}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {/* 3 Modes Buttons */}
                <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => onSwitchMode('work')}
                    aria-label={`Ativar modo de foco de ${workMinutes} minutos`}
                    className={`px-2 py-0.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 cursor-pointer ${
                      isWork
                        ? 'bg-rose-500 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {workMinutes}m Foco
                  </button>
                  <button
                    type="button"
                    onClick={() => onSwitchMode('short_break')}
                    aria-label={`Ativar pausa curta de ${breakMinutes} minutos`}
                    className={`px-2 py-0.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 cursor-pointer ${
                      isShortBreak
                        ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {breakMinutes}m Pausa Curta
                  </button>
                  <button
                    type="button"
                    onClick={() => onSwitchMode('long_break')}
                    aria-label={`Ativar pausa longa de ${longBreakMinutes} minutos`}
                    className={`px-2 py-0.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer ${
                      isLongBreak
                        ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {longBreakMinutes}m Pausa Longa
                  </button>
                </div>

                {/* Ciclos Elegante Indicator */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  <span>
                    Ciclo {currentCycle} de {totalCycles}
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalCycles }, (_, i) => {
                      const isPast = i + 1 < currentCycle
                      const isNow = i + 1 === currentCycle
                      return (
                        <span
                          key={i}
                          className={`h-1.5 rounded-full transition-all ${
                            isNow
                              ? `w-3 ${
                                  isWork
                                    ? 'bg-rose-500'
                                    : isLongBreak
                                      ? 'bg-indigo-500'
                                      : 'bg-emerald-500'
                                }`
                              : isPast
                                ? 'w-1.5 bg-slate-400 dark:bg-slate-500'
                                : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
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
                    isWork
                      ? 'bg-rose-500'
                      : isLongBreak
                        ? 'bg-indigo-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span
                key={isNearEnd ? `widget-countdown-${session.timeLeft}` : 'widget-timer'}
                className={`text-xl font-mono font-bold tracking-tight min-w-[60px] inline-block transition-colors ${
                  isNearEnd
                    ? 'text-amber-500 dark:text-amber-400 animate-countdown-blink font-black'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
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
                    : isWork
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : isLongBreak
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
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
              {onOpenFullscreen && (
                <button
                  type="button"
                  onClick={onOpenFullscreen}
                  aria-label="Expandir para tela cheia"
                  title="Tela Cheia"
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
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
