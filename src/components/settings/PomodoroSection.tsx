import React, { useState } from 'react'
import { Timer, Flame, Coffee, Sparkles, Repeat } from 'lucide-react'

export interface PomodoroSectionProps {
  workMinutes: number
  breakMinutes: number
  longBreakMinutes?: number
  longBreakCycles?: number
  autoStartBreaks?: boolean
  autoStartFocus?: boolean
  strictFocusMode?: boolean
  onUpdateWorkMinutes: (mins: number) => void
  onUpdateBreakMinutes: (mins: number) => void
  onUpdateLongBreakMinutes?: (mins: number) => void
  onUpdateLongBreakCycles?: (cycles: number) => void
  onToggleAutoStartBreaks?: (val: boolean) => void
  onToggleAutoStartFocus?: (val: boolean) => void
  onToggleStrictFocusMode?: (val: boolean) => void
  onUpdateSettings?: (settings: {
    workDurationMinutes?: number
    breakDurationMinutes?: number
    longBreakDurationMinutes?: number
    longBreakCycles?: number
    autoStartBreaks?: boolean
    autoStartFocus?: boolean
    strictFocusMode?: boolean
  }) => void
}

const WORK_PRESETS = [15, 25, 30, 45, 50, 60]
const BREAK_PRESETS = [3, 5, 10, 15]
const LONG_BREAK_PRESETS = [10, 15, 20, 30]
const CYCLE_PRESETS = [2, 3, 4, 5]

export const PomodoroSection: React.FC<PomodoroSectionProps> = ({
  workMinutes,
  breakMinutes,
  longBreakMinutes: propLongBreakMinutes = 15,
  longBreakCycles: propLongBreakCycles = 4,
  autoStartBreaks: propAutoStartBreaks = true,
  autoStartFocus: propAutoStartFocus = false,
  strictFocusMode: propStrictFocusMode = true,
  onUpdateWorkMinutes,
  onUpdateBreakMinutes,
  onUpdateLongBreakMinutes,
  onUpdateLongBreakCycles,
  onToggleAutoStartBreaks,
  onToggleAutoStartFocus,
  onToggleStrictFocusMode,
  onUpdateSettings,
}) => {
  const [localLongBreakMinutes, setLocalLongBreakMinutes] =
    useState<number>(propLongBreakMinutes)
  const [localLongBreakCycles, setLocalLongBreakCycles] =
    useState<number>(propLongBreakCycles)
  const [localAutoStartBreaks, setLocalAutoStartBreaks] =
    useState<boolean>(propAutoStartBreaks)
  const [localAutoStartFocus, setLocalAutoStartFocus] =
    useState<boolean>(propAutoStartFocus)
  const [localStrictFocusMode, setLocalStrictFocusMode] =
    useState<boolean>(propStrictFocusMode)

  const effectiveLongBreakMinutes = propLongBreakMinutes ?? localLongBreakMinutes
  const effectiveLongBreakCycles = propLongBreakCycles ?? localLongBreakCycles
  const effectiveAutoStartBreaks = propAutoStartBreaks ?? localAutoStartBreaks
  const effectiveAutoStartFocus = propAutoStartFocus ?? localAutoStartFocus
  const effectiveStrictFocusMode = propStrictFocusMode ?? localStrictFocusMode

  const [workInput, setWorkInput] = useState<string>(String(workMinutes))
  const [breakInput, setBreakInput] = useState<string>(String(breakMinutes))
  const [longBreakInput, setLongBreakInput] = useState<string>(
    String(effectiveLongBreakMinutes)
  )
  const [cyclesInput, setCyclesInput] = useState<string>(String(effectiveLongBreakCycles))

  const [prevProps, setPrevProps] = useState({
    workMinutes,
    breakMinutes,
    propLongBreakMinutes,
    propLongBreakCycles,
    propAutoStartBreaks,
    propAutoStartFocus,
    propStrictFocusMode,
  })

  if (
    prevProps.workMinutes !== workMinutes ||
    prevProps.breakMinutes !== breakMinutes ||
    prevProps.propLongBreakMinutes !== propLongBreakMinutes ||
    prevProps.propLongBreakCycles !== propLongBreakCycles ||
    prevProps.propAutoStartBreaks !== propAutoStartBreaks ||
    prevProps.propAutoStartFocus !== propAutoStartFocus ||
    prevProps.propStrictFocusMode !== propStrictFocusMode
  ) {
    setPrevProps({
      workMinutes,
      breakMinutes,
      propLongBreakMinutes,
      propLongBreakCycles,
      propAutoStartBreaks,
      propAutoStartFocus,
      propStrictFocusMode,
    })
    setWorkInput(String(workMinutes))
    setBreakInput(String(breakMinutes))
    setLongBreakInput(String(propLongBreakMinutes))
    setCyclesInput(String(propLongBreakCycles))
    setLocalLongBreakMinutes(propLongBreakMinutes)
    setLocalLongBreakCycles(propLongBreakCycles)
    setLocalAutoStartBreaks(propAutoStartBreaks)
    setLocalAutoStartFocus(propAutoStartFocus)
    setLocalStrictFocusMode(propStrictFocusMode)
  }

  const [workError, setWorkError] = useState<string | null>(null)
  const [breakError, setBreakError] = useState<string | null>(null)
  const [longBreakError, setLongBreakError] = useState<string | null>(null)
  const [cyclesError, setCyclesError] = useState<string | null>(null)

  const handleWorkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value
    setWorkInput(valStr)
    if (valStr === '') {
      setWorkError('O tempo de foco deve ser entre 1 e 180 minutos.')
      return
    }
    const num = Number(valStr)
    if (isNaN(num) || num < 1 || num > 180) {
      setWorkError('O tempo de foco deve ser entre 1 e 180 minutos.')
    } else {
      setWorkError(null)
      onUpdateWorkMinutes(num)
      onUpdateSettings?.({ workDurationMinutes: num })
    }
  }

  const handleStepWork = (delta: number) => {
    const nextVal = Math.max(1, Math.min(180, workMinutes + delta))
    setWorkError(null)
    setWorkInput(String(nextVal))
    onUpdateWorkMinutes(nextVal)
    onUpdateSettings?.({ workDurationMinutes: nextVal })
  }

  const handleSelectWorkPreset = (preset: number) => {
    setWorkError(null)
    setWorkInput(String(preset))
    onUpdateWorkMinutes(preset)
    onUpdateSettings?.({ workDurationMinutes: preset })
  }

  const handleBreakInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value
    setBreakInput(valStr)
    if (valStr === '') {
      setBreakError('A pausa curta deve ser entre 1 e 60 minutos.')
      return
    }
    const num = Number(valStr)
    if (isNaN(num) || num < 1 || num > 60) {
      setBreakError('A pausa curta deve ser entre 1 e 60 minutos.')
    } else {
      setBreakError(null)
      onUpdateBreakMinutes(num)
      onUpdateSettings?.({ breakDurationMinutes: num })
    }
  }

  const handleStepBreak = (delta: number) => {
    const nextVal = Math.max(1, Math.min(60, breakMinutes + delta))
    setBreakError(null)
    setBreakInput(String(nextVal))
    onUpdateBreakMinutes(nextVal)
    onUpdateSettings?.({ breakDurationMinutes: nextVal })
  }

  const handleSelectBreakPreset = (preset: number) => {
    setBreakError(null)
    setBreakInput(String(preset))
    onUpdateBreakMinutes(preset)
    onUpdateSettings?.({ breakDurationMinutes: preset })
  }

  const handleLongBreakChange = (mins: number) => {
    setLocalLongBreakMinutes(mins)
    onUpdateLongBreakMinutes?.(mins)
    onUpdateSettings?.({ longBreakDurationMinutes: mins })
  }

  const handleLongBreakInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value
    setLongBreakInput(valStr)
    if (valStr === '') {
      setLongBreakError('A pausa longa deve ser entre 1 e 120 minutos.')
      return
    }
    const num = Number(valStr)
    if (isNaN(num) || num < 1 || num > 120) {
      setLongBreakError('A pausa longa deve ser entre 1 e 120 minutos.')
    } else {
      setLongBreakError(null)
      handleLongBreakChange(num)
    }
  }

  const handleStepLongBreak = (delta: number) => {
    const nextVal = Math.max(1, Math.min(120, effectiveLongBreakMinutes + delta))
    setLongBreakError(null)
    setLongBreakInput(String(nextVal))
    handleLongBreakChange(nextVal)
  }

  const handleSelectLongBreakPreset = (preset: number) => {
    setLongBreakError(null)
    setLongBreakInput(String(preset))
    handleLongBreakChange(preset)
  }

  const handleCyclesChange = (cycles: number) => {
    setLocalLongBreakCycles(cycles)
    onUpdateLongBreakCycles?.(cycles)
    onUpdateSettings?.({ longBreakCycles: cycles })
  }

  const handleCyclesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value
    setCyclesInput(valStr)
    if (valStr === '') {
      setCyclesError('O número de ciclos deve ser entre 1 e 12.')
      return
    }
    const num = Number(valStr)
    if (isNaN(num) || num < 1 || num > 12) {
      setCyclesError('O número de ciclos deve ser entre 1 e 12.')
    } else {
      setCyclesError(null)
      handleCyclesChange(num)
    }
  }

  const handleStepCycles = (delta: number) => {
    const nextVal = Math.max(1, Math.min(12, effectiveLongBreakCycles + delta))
    setCyclesError(null)
    setCyclesInput(String(nextVal))
    handleCyclesChange(nextVal)
  }

  const handleSelectCyclePreset = (preset: number) => {
    setCyclesError(null)
    setCyclesInput(String(preset))
    handleCyclesChange(preset)
  }

  const handleToggleBreaks = () => {
    const next = !effectiveAutoStartBreaks
    setLocalAutoStartBreaks(next)
    onToggleAutoStartBreaks?.(next)
    onUpdateSettings?.({ autoStartBreaks: next })
  }

  const handleToggleFocus = () => {
    const next = !effectiveAutoStartFocus
    setLocalAutoStartFocus(next)
    onToggleAutoStartFocus?.(next)
    onUpdateSettings?.({ autoStartFocus: next })
  }

  const handleToggleStrict = () => {
    const next = !effectiveStrictFocusMode
    setLocalStrictFocusMode(next)
    onToggleStrictFocusMode?.(next)
    onUpdateSettings?.({ strictFocusMode: next })
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
            Temporizador Pomodoro
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ajuste os intervalos de estudo e pausas do seu ciclo diário
          </p>
        </div>
      </div>

      {/* 4 Duration Steppers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tempo de Foco */}
        <div className="flex flex-col">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70 flex flex-col gap-2.5 flex-1">
            <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
              <label
                htmlFor="settings-work-duration"
                className="cursor-pointer font-semibold text-slate-700 dark:text-slate-300"
              >
                Tempo de Foco
              </label>
              <Flame className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="flex items-center justify-between mt-1 gap-1">
              <button
                type="button"
                onClick={() => handleStepWork(-5)}
                aria-label="Diminuir tempo de foco em 5 minutos"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
              >
                −
              </button>

              <div className="flex items-center justify-center gap-1.5 flex-1 min-w-0">
                <input
                  id="settings-work-duration"
                  type="number"
                  min="1"
                  max="180"
                  value={workInput}
                  onChange={handleWorkInputChange}
                  aria-label="Minutos de foco"
                  className="w-16 text-center font-headline text-lg font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-0.5 px-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="font-headline text-sm font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                  min
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleStepWork(5)}
                aria-label="Aumentar tempo de foco em 5 minutos"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
              >
                +
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 mt-auto">
              {WORK_PRESETS.map((preset) => {
                const isSelected = workMinutes === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectWorkPreset(preset)}
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
          {workError && (
            <p className="text-rose-600 text-xs font-medium mt-1 px-1">{workError}</p>
          )}
        </div>

        {/* 2. Pausa Curta */}
        <div className="flex flex-col">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70 flex flex-col gap-2.5 flex-1">
            <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
              <label
                htmlFor="settings-break-duration"
                className="cursor-pointer font-semibold text-slate-700 dark:text-slate-300"
              >
                Pausa Curta
              </label>
              <Coffee className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>

            <div className="flex items-center justify-between mt-1 gap-1">
              <button
                type="button"
                onClick={() => handleStepBreak(-1)}
                aria-label="Diminuir pausa curta em 1 minuto"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
              >
                −
              </button>

              <div className="flex items-center justify-center gap-1.5 flex-1 min-w-0">
                <input
                  id="settings-break-duration"
                  type="number"
                  min="1"
                  max="60"
                  value={breakInput}
                  onChange={handleBreakInputChange}
                  aria-label="Minutos de pausa"
                  className="w-16 text-center font-headline text-lg font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-0.5 px-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="font-headline text-sm font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                  min
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleStepBreak(1)}
                aria-label="Aumentar pausa curta em 1 minuto"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
              >
                +
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 mt-auto">
              {BREAK_PRESETS.map((preset) => {
                const isSelected = breakMinutes === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectBreakPreset(preset)}
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
          {breakError && (
            <p className="text-rose-600 text-xs font-medium mt-1 px-1">{breakError}</p>
          )}
        </div>

        {/* 3. Pausa Longa */}
        <div className="flex flex-col">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70 flex flex-col gap-2.5 flex-1">
            <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
              <label
                htmlFor="settings-long-break-duration"
                className="cursor-pointer font-semibold text-slate-700 dark:text-slate-300"
              >
                Pausa Longa
              </label>
              <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>

            <div className="flex items-center justify-between mt-1 gap-1">
              <button
                type="button"
                onClick={() => handleStepLongBreak(-5)}
                aria-label="Diminuir pausa longa em 5 minutos"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
              >
                −
              </button>

              <div className="flex items-center justify-center gap-1.5 flex-1 min-w-0">
                <input
                  id="settings-long-break-duration"
                  type="number"
                  min="1"
                  max="120"
                  value={longBreakInput}
                  onChange={handleLongBreakInputChange}
                  aria-label="Minutos de pausa longa"
                  className="w-16 text-center font-headline text-lg font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-0.5 px-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="font-headline text-sm font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                  min
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleStepLongBreak(5)}
                aria-label="Aumentar pausa longa em 5 minutos"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
              >
                +
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 mt-auto">
              {LONG_BREAK_PRESETS.map((preset) => {
                const isSelected = effectiveLongBreakMinutes === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectLongBreakPreset(preset)}
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
          {longBreakError && (
            <p className="text-rose-600 text-xs font-medium mt-1 px-1">
              {longBreakError}
            </p>
          )}
        </div>

        {/* 4. Ciclos até Pausa Longa */}
        <div className="flex flex-col">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70 flex flex-col gap-2.5 flex-1">
            <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
              <label
                htmlFor="settings-long-break-cycles"
                className="cursor-pointer font-semibold text-slate-700 dark:text-slate-300"
              >
                Ciclos até Pausa Longa
              </label>
              <Repeat className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            </div>

            <div className="flex items-center justify-between mt-1 gap-1">
              <button
                type="button"
                onClick={() => handleStepCycles(-1)}
                aria-label="Diminuir ciclos até pausa longa"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
              >
                −
              </button>

              <div className="flex items-center justify-center gap-1.5 flex-1 min-w-0">
                <input
                  id="settings-long-break-cycles"
                  type="number"
                  min="1"
                  max="12"
                  value={cyclesInput}
                  onChange={handleCyclesInputChange}
                  aria-label="Ciclos até pausa longa"
                  className="w-16 text-center font-headline text-lg font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-0.5 px-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="font-headline text-sm font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                  ciclos
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleStepCycles(1)}
                aria-label="Aumentar ciclos até pausa longa"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
              >
                +
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 mt-auto">
              {CYCLE_PRESETS.map((preset) => {
                const isSelected = effectiveLongBreakCycles === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectCyclePreset(preset)}
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
          {cyclesError && (
            <p className="text-rose-600 text-xs font-medium mt-1 px-1">{cyclesError}</p>
          )}
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
              Transição instantânea com contagem regressiva para o tempo de descanso ao
              terminar o bloco de foco.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={effectiveAutoStartBreaks}
            aria-label="Iniciar pausas automaticamente"
            onClick={handleToggleBreaks}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              effectiveAutoStartBreaks ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                effectiveAutoStartBreaks ? 'translate-x-5' : 'translate-x-0'
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
              Inicia o próximo ciclo de trabalho automaticamente após a conclusão da
              pausa.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={effectiveAutoStartFocus}
            aria-label="Iniciar próximo foco automaticamente"
            onClick={handleToggleFocus}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              effectiveAutoStartFocus ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                effectiveAutoStartFocus ? 'translate-x-5' : 'translate-x-0'
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
            aria-checked={effectiveStrictFocusMode}
            aria-label="Modo Foco Estrito"
            onClick={handleToggleStrict}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              effectiveStrictFocusMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                effectiveStrictFocusMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  )
}
