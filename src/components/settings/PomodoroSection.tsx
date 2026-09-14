import React, { useState } from 'react'
import { Timer, Flame, Coffee, Sparkles, Repeat } from 'lucide-react'

export interface PomodoroSectionProps {
  workMinutes: number
  breakMinutes: number
  onUpdateWorkMinutes: (mins: number) => void
  onUpdateBreakMinutes: (mins: number) => void
}

const WORK_PRESETS = [15, 25, 30, 45, 50, 60]
const BREAK_PRESETS = [3, 5, 10, 15]
const LONG_BREAK_PRESETS = [10, 15, 20, 30]
const CYCLE_PRESETS = [2, 3, 4, 5]

export const PomodoroSection: React.FC<PomodoroSectionProps> = ({
  workMinutes,
  breakMinutes,
  onUpdateWorkMinutes,
  onUpdateBreakMinutes,
}) => {
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(15)
  const [longBreakCycles, setLongBreakCycles] = useState<number>(4)

  // Stitch Automations State
  const [autoStartBreaks, setAutoStartBreaks] = useState<boolean>(true)
  const [autoStartFocus, setAutoStartFocus] = useState<boolean>(false)
  const [strictFocusMode, setStrictFocusMode] = useState<boolean>(true)

  const handleStepWork = (delta: number) => {
    onUpdateWorkMinutes(Math.max(1, Math.min(180, workMinutes + delta)))
  }

  const handleStepBreak = (delta: number) => {
    onUpdateBreakMinutes(Math.max(1, Math.min(60, breakMinutes + delta)))
  }

  const handleStepLongBreak = (delta: number) => {
    setLongBreakMinutes((prev) => Math.max(5, Math.min(60, prev + delta)))
  }

  const handleStepCycles = (delta: number) => {
    setLongBreakCycles((prev) => Math.max(1, Math.min(12, prev + delta)))
  }

  return (
    <section
      id="pomodoro"
      aria-labelledby="settings-pomodoro-title"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-6 transition-colors"
    >
      {/* Section Header */}
      <div className="flex items-start gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <Timer className="w-5 h-5" />
        </div>
        <div>
          <h2
            id="settings-pomodoro-title"
            className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100"
          >
            Temporizador Pomodoro &amp; Sons
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ajuste os intervalos de estudo e pausas do seu ciclo diário
          </p>
        </div>
      </div>

      {/* 4 Duration Steppers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tempo de Foco */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70 flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
            <label
              htmlFor="settings-work-duration"
              className="cursor-pointer font-semibold text-slate-700 dark:text-slate-300"
            >
              Tempo de Foco
            </label>
            <Flame className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex items-center justify-between mt-1">
            <button
              type="button"
              onClick={() => handleStepWork(-5)}
              aria-label="Diminuir tempo de foco em 5 minutos"
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              −
            </button>
            <span className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">
              {workMinutes} min
            </span>
            <button
              type="button"
              onClick={() => handleStepWork(5)}
              aria-label="Aumentar tempo de foco em 5 minutos"
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              +
            </button>
          </div>

          {/* Hidden input for test compatibility */}
          <input
            id="settings-work-duration"
            type="number"
            min="1"
            max="180"
            value={workMinutes}
            onChange={(e) => onUpdateWorkMinutes(Number(e.target.value))}
            aria-label="Minutos de foco"
            className="sr-only"
          />

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            {WORK_PRESETS.map((preset) => {
              const isSelected = workMinutes === preset
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onUpdateWorkMinutes(preset)}
                  aria-label={`Selecionar ${preset} minutos de foco`}
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {preset}m
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Pausa Curta */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70 flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
            <label
              htmlFor="settings-break-duration"
              className="cursor-pointer font-semibold text-slate-700 dark:text-slate-300"
            >
              Pausa Curta
            </label>
            <Coffee className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>

          <div className="flex items-center justify-between mt-1">
            <button
              type="button"
              onClick={() => handleStepBreak(-1)}
              aria-label="Diminuir pausa curta em 1 minuto"
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              −
            </button>
            <span className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">
              {breakMinutes} min
            </span>
            <button
              type="button"
              onClick={() => handleStepBreak(1)}
              aria-label="Aumentar pausa curta em 1 minuto"
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              +
            </button>
          </div>

          {/* Hidden input for test compatibility */}
          <input
            id="settings-break-duration"
            type="number"
            min="1"
            max="60"
            value={breakMinutes}
            onChange={(e) => onUpdateBreakMinutes(Number(e.target.value))}
            aria-label="Minutos de pausa"
            className="sr-only"
          />

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            {BREAK_PRESETS.map((preset) => {
              const isSelected = breakMinutes === preset
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onUpdateBreakMinutes(preset)}
                  aria-label={`Selecionar ${preset} minutos de pausa`}
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {preset}m
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. Pausa Longa */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70 flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Pausa Longa
            </span>
            <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>

          <div className="flex items-center justify-between mt-1">
            <button
              type="button"
              onClick={() => handleStepLongBreak(-5)}
              aria-label="Diminuir pausa longa em 5 minutos"
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              −
            </button>
            <span className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">
              {longBreakMinutes} min
            </span>
            <button
              type="button"
              onClick={() => handleStepLongBreak(5)}
              aria-label="Aumentar pausa longa em 5 minutos"
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              +
            </button>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            {LONG_BREAK_PRESETS.map((preset) => {
              const isSelected = longBreakMinutes === preset
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setLongBreakMinutes(preset)}
                  aria-label={`Selecionar ${preset} minutos de pausa longa`}
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {preset}m
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. Ciclos até Pausa Longa */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70 flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Ciclos até Pausa Longa
            </span>
            <Repeat className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>

          <div className="flex items-center justify-between mt-1">
            <button
              type="button"
              onClick={() => handleStepCycles(-1)}
              aria-label="Diminuir ciclos até pausa longa"
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              −
            </button>
            <span className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">
              {longBreakCycles} ciclos
            </span>
            <button
              type="button"
              onClick={() => handleStepCycles(1)}
              aria-label="Aumentar ciclos até pausa longa"
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              +
            </button>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            {CYCLE_PRESETS.map((preset) => {
              const isSelected = longBreakCycles === preset
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setLongBreakCycles(preset)}
                  aria-label={`Selecionar ${preset} ciclos`}
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {preset}c
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 3 Automation Toggles */}
      <div className="flex flex-col divide-y divide-slate-200/60 dark:divide-slate-800/60 pt-2">
        {/* Toggle 1: Iniciar pausas automaticamente */}
        <div className="py-3.5 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Iniciar pausas automaticamente
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Transição instantânea para o tempo de descanso ao terminar o bloco de foco.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoStartBreaks}
            aria-label="Iniciar pausas automaticamente"
            onClick={() => setAutoStartBreaks(!autoStartBreaks)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              autoStartBreaks ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                autoStartBreaks ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Iniciar próximo foco automaticamente */}
        <div className="py-3.5 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Iniciar próximo foco automaticamente
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Requer clique manual para iniciar uma nova rodada de trabalho após o
              descanso.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoStartFocus}
            aria-label="Iniciar próximo foco automaticamente"
            onClick={() => setAutoStartFocus(!autoStartFocus)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              autoStartFocus ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                autoStartFocus ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 3: Modo Foco Estrito */}
        <div className="py-3.5 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Modo Foco Estrito (bloqueio de notificações)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                RECOMENDADO
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Oculta badges, avisos visuais externos e bloqueia abas secundárias durante a
              contagem.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={strictFocusMode}
            aria-label="Modo Foco Estrito"
            onClick={() => setStrictFocusMode(!strictFocusMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              strictFocusMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                strictFocusMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  )
}
