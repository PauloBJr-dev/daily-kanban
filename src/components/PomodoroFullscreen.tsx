import React, { useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Minimize2,
  Flame,
  Coffee,
} from 'lucide-react'
import type { PomodoroSession } from '../types/kanban'

export interface PomodoroFullscreenProps {
  session: PomodoroSession
  onPlayPause: () => void
  onReset: () => void
  onSwitchMode: (mode: 'work' | 'break') => void
  onClose: () => void
  formatTime: (seconds: number) => string
}

export const PomodoroFullscreen: React.FC<PomodoroFullscreenProps> = ({
  session,
  onPlayPause,
  onReset,
  onSwitchMode,
  onClose,
  formatTime,
}) => {
  const isWork = session.mode === 'work'
  const maxDuration = isWork ? session.workDuration : session.breakDuration
  const progressPercent = Math.max(
    0,
    Math.min(100, ((maxDuration - session.timeLeft) / maxDuration) * 100)
  )

  const isNearEnd = session.isRunning && session.timeLeft <= 5 && session.timeLeft > 0

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cronômetro Pomodoro em Tela Cheia"
      className="fixed inset-0 z-50 bg-slate-950/95 dark:bg-slate-950/98 text-white flex flex-col items-center justify-between backdrop-blur-xl p-6 sm:p-10 select-none animate-in fade-in duration-200"
    >
      {/* Top bar */}
      <header className="w-full max-w-4xl flex items-center justify-between">
        {/* Soft Mode Badge */}
        <div
          data-testid="fullscreen-mode-badge"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold tracking-wide border backdrop-blur-md transition-all ${
            isWork
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          }`}
        >
          {isWork ? (
            <Flame className="w-4 h-4 text-rose-400" />
          ) : (
            <Coffee className="w-4 h-4 text-emerald-400" />
          )}
          <span>{isWork ? '🎯 Foco Ativo' : '☕ Pausa Revigorante'}</span>
        </div>

        {/* Discreet Minimize Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Minimizar (Esc)"
          title="Minimizar (Esc)"
          className="inline-flex items-center gap-2 px-4 py-2 min-w-[44px] min-h-[44px] rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer text-sm font-medium"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Minimizar (Esc)</span>
        </button>
      </header>

      {/* Immersive Center */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl w-full px-4 my-auto space-y-8">
        {/* Focus Title */}
        <div className="space-y-1.5 max-w-xl">
          {session.taskTitle ? (
            <h2
              title={session.taskTitle}
              className="text-xl sm:text-2xl font-semibold text-slate-100 tracking-tight truncate max-w-lg mx-auto"
            >
              🎯 Focando em: {session.taskTitle}
            </h2>
          ) : (
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-300 tracking-tight">
              🎯 Foco Livre
            </h2>
          )}
          <p className="text-sm text-slate-400">
            {isWork
              ? 'Mantenha a concentração e evite distrações'
              : 'Respire fundo, relaxe os olhos e alongue-se'}
          </p>
        </div>

        {/* Giant Timer Display with Visual Pulse Alert */}
        <div
          data-testid="fullscreen-timer-container"
          className={`px-8 py-6 rounded-3xl transition-all duration-300 flex flex-col items-center justify-center ${
            isNearEnd
              ? 'animate-pulse ring-8 ring-amber-500/50 shadow-2xl shadow-amber-500/30 scale-105 transition-transform bg-amber-500/10'
              : ''
          }`}
        >
          <span
            data-testid="fullscreen-timer-display"
            className={`text-7xl sm:text-9xl font-mono font-bold tracking-tight drop-shadow-sm select-none transition-colors ${
              isNearEnd ? 'text-amber-400' : 'text-white'
            }`}
          >
            {formatTime(session.timeLeft)}
          </span>
        </div>

        {/* Elegant Progress Bar */}
        <div className="w-full max-w-md space-y-2">
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
            <div
              data-testid="fullscreen-progress-bar"
              className={`h-full rounded-full transition-all duration-300 ${
                isWork
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>00:00</span>
            <span>{formatTime(maxDuration)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <footer className="w-full max-w-md flex items-center justify-center gap-6 pb-4 sm:pb-8">
        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          aria-label="Reiniciar cronômetro"
          title="Reiniciar tempo"
          className="p-3.5 min-w-[52px] min-h-[52px] flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        {/* Big Central Play / Pause Button */}
        <button
          type="button"
          onClick={onPlayPause}
          aria-label={
            session.isRunning ? 'Pausar foco em tela cheia' : 'Retomar foco em tela cheia'
          }
          title={session.isRunning ? 'Pausar foco' : 'Iniciar foco'}
          className={`p-5 min-w-[68px] min-h-[68px] flex items-center justify-center rounded-2xl font-medium transition-all active:scale-95 shadow-xl focus-visible:outline-none focus-visible:ring-4 cursor-pointer ${
            session.isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white ring-4 ring-amber-500/20'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white ring-4 ring-indigo-500/20'
          }`}
        >
          {session.isRunning ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 translate-x-0.5" />
          )}
        </button>

        {/* Skip Cycle / Switch Mode Button */}
        <button
          type="button"
          onClick={() => onSwitchMode(isWork ? 'break' : 'work')}
          aria-label={isWork ? 'Pular para pausa' : 'Pular para foco'}
          title={isWork ? 'Pular para pausa' : 'Pular para foco'}
          className="p-3.5 min-w-[52px] min-h-[52px] flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </footer>
    </div>
  )
}
