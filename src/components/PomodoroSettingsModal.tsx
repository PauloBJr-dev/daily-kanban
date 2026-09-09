import React, { useState, useEffect } from 'react'
import {
  X,
  Flame,
  Coffee,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Check,
  Sparkles,
  Volume1,
  Square,
} from 'lucide-react'
import type { CatPurrType } from '../types/kanban'
import { soundService } from '../services/soundService'
import { notificationService } from '../services/notificationService'

export interface PomodoroSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentWorkMinutes: number
  currentBreakMinutes: number
  isSoundEnabled: boolean
  currentCatPurrType?: CatPurrType
  currentCatPurrVolume?: number
  onSave: (
    workMinutes: number,
    breakMinutes: number,
    isSoundEnabled: boolean,
    catPurrType: CatPurrType,
    catPurrVolume: number
  ) => void
}

const WORK_PRESETS = [15, 25, 30, 45, 50, 60]
const BREAK_PRESETS = [3, 5, 10, 15]

interface PurrOption {
  id: CatPurrType
  label: string
  description: string
  badge?: string
}

const PURR_OPTIONS: PurrOption[] = [
  {
    id: 'none',
    label: 'Desativado',
    description: 'Sem som durante a pausa',
  },
  {
    id: 'soft',
    label: 'Ronrom Suave',
    description: 'Frequências aveludadas, calmo e contínuo',
    badge: 'Aveludado',
  },
  {
    id: 'deep',
    label: 'Ronrom Profundo',
    description: 'Vibração de peito encorpada e baixa (~24-28Hz)',
    badge: '~26Hz Sub-grave',
  },
  {
    id: 'rhythmic',
    label: 'Ronrom Rítmico',
    description: 'Modulação de inalação e exalação felina (~2s)',
    badge: 'Respiração ~2s',
  },
]

const PomodoroSettingsDialog: React.FC<Omit<PomodoroSettingsModalProps, 'isOpen'>> = ({
  onClose,
  currentWorkMinutes,
  currentBreakMinutes,
  isSoundEnabled,
  currentCatPurrType = 'none',
  currentCatPurrVolume = 0.6,
  onSave,
}) => {
  const [workMinutes, setWorkMinutes] = useState(currentWorkMinutes)
  const [breakMinutes, setBreakMinutes] = useState(currentBreakMinutes)
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled)
  const [catPurrType, setCatPurrType] = useState<CatPurrType>(currentCatPurrType)
  const [catPurrVolume, setCatPurrVolume] = useState<number>(currentCatPurrVolume)
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false)

  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    () => notificationService.getPermission()
  )

  // Interrompe qualquer prévia ao fechar ou desmontar
  useEffect(() => {
    return () => {
      soundService.stopCatPurr()
    }
  }, [])

  // Fecha ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundService.stopCatPurr()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleRequestNotification = async () => {
    const result = await notificationService.requestPermission()
    setNotificationStatus(result)
  }

  const handleTogglePreview = () => {
    if (catPurrType === 'none') return

    if (isPreviewing) {
      soundService.stopCatPurr()
      setIsPreviewing(false)
    } else {
      setIsPreviewing(true)
      soundService.previewCatPurr(catPurrType, 3)
      setTimeout(() => {
        setIsPreviewing(false)
      }, 3000)
    }
  }

  const handleSelectPurrType = (type: CatPurrType) => {
    if (isPreviewing) {
      soundService.stopCatPurr()
      setIsPreviewing(false)
    }
    setCatPurrType(type)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    soundService.stopCatPurr()
    const validWork = Math.max(1, Math.min(180, Math.round(Number(workMinutes)) || 25))
    const validBreak = Math.max(1, Math.min(60, Math.round(Number(breakMinutes)) || 5))
    onSave(validWork, validBreak, soundEnabled, catPurrType, catPurrVolume)
    onClose()
  }

  const getNotificationButtonContent = () => {
    if (notificationStatus === 'granted') {
      return {
        label: 'Ativadas',
        icon: <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        className:
          'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 cursor-default',
      }
    }
    if (notificationStatus === 'denied') {
      return {
        label: 'Bloqueadas',
        icon: <BellOff className="w-4 h-4 text-rose-500 dark:text-rose-400" />,
        className:
          'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 cursor-not-allowed',
      }
    }
    return {
      label: 'Ativar Notificações',
      icon: <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      className:
        'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 cursor-pointer',
    }
  }

  const notifBtn = getNotificationButtonContent()

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundService.stopCatPurr()
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pomodoro-settings-title"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-xl border-t sm:border border-slate-200/80 dark:border-slate-800 overflow-hidden max-h-[92dvh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-150"
      >
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2
            id="pomodoro-settings-title"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            Configurações do Pomodoro
          </h2>
          <button
            type="button"
            onClick={() => {
              soundService.stopCatPurr()
              onClose()
            }}
            aria-label="Fechar"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Duração de Foco */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="work-duration-input"
                className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                <Flame className="w-4 h-4 text-rose-500" />
                Duração de Foco (minutos)
              </label>
              <input
                id="work-duration-input"
                type="number"
                min="1"
                max="180"
                value={workMinutes}
                onChange={(e) => setWorkMinutes(Math.max(1, Number(e.target.value)))}
                aria-label="Minutos de foco personalizados"
                className="w-20 px-2.5 py-1 text-right text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            {/* Presets de Foco */}
            <div className="flex flex-wrap gap-1.5">
              {WORK_PRESETS.map((preset) => {
                const isSelected = workMinutes === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWorkMinutes(preset)}
                    aria-label={`Selecionar ${preset} minutos de foco`}
                    className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {preset}m
                  </button>
                )
              })}
            </div>
          </div>

          {/* Duração de Pausa */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="break-duration-input"
                className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                <Coffee className="w-4 h-4 text-emerald-500" />
                Duração de Pausa (minutos)
              </label>
              <input
                id="break-duration-input"
                type="number"
                min="1"
                max="60"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Math.max(1, Number(e.target.value)))}
                aria-label="Minutos de pausa personalizados"
                className="w-20 px-2.5 py-1 text-right text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            {/* Presets de Pausa */}
            <div className="flex flex-wrap gap-1.5">
              {BREAK_PRESETS.map((preset) => {
                const isSelected = breakMinutes === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBreakMinutes(preset)}
                    aria-label={`Selecionar ${preset} minutos de pausa`}
                    className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {preset}m
                  </button>
                )
              })}
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Seção: Som ambiente de descanso (Ronrom de Gato 🐱) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">
                  🐱
                </span>
                <div>
                  <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Som ambiente de descanso (Ronrom de Gato 🐱)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Vibração acústica reconfortante sintetizada para o momento de pausa
                  </p>
                </div>
              </div>
            </div>

            {/* Grid de Opções de Ronrom */}
            <div
              role="radiogroup"
              aria-label="Variações de ronrom de gato"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {PURR_OPTIONS.map((option) => {
                const isSelected = catPurrType === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectPurrType(option.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-semibold ${
                          isSelected
                            ? 'text-indigo-900 dark:text-indigo-200'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {option.label}
                      </span>
                      {option.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {option.description}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Controle de Volume e Botão de Testar Prévia */}
            {catPurrType !== 'none' && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Volume1 className="w-4 h-4 text-indigo-500" />
                    <span>Volume do Ronrom:</span>
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {Math.round(catPurrVolume * 100)}%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleTogglePreview}
                    aria-label={
                      isPreviewing ? 'Parar prévia do ronrom' : 'Ouvir prévia do som'
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      isPreviewing
                        ? 'bg-amber-500 text-white border-amber-500 animate-pulse'
                        : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                    }`}
                  >
                    {isPreviewing ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Ouvindo (3s)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                        <span>Ouvir Prévia</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={catPurrVolume}
                  onChange={(e) => setCatPurrVolume(Number(e.target.value))}
                  aria-label="Ajustar volume do ronrom"
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            )}
          </div>

          {/* Divisor */}
          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Efeitos Sonoros Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg ${
                  soundEnabled
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block">
                  Efeitos Sonoros
                </span>
                <span className="text-xs text-slate-400">
                  {soundEnabled ? 'Alertas sonoros ativados' : 'Sons desativados'}
                </span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              aria-label="Ativar ou desativar efeitos sonoros"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                soundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notificações do Navegador */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block">
                  Notificações do Navegador
                </span>
                <span className="text-xs text-slate-400">
                  Alertas quando a aba estiver em segundo plano
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={
                notificationStatus === 'default' ? handleRequestNotification : undefined
              }
              disabled={
                notificationStatus === 'denied' || notificationStatus === 'granted'
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${notifBtn.className}`}
            >
              {notifBtn.icon}
              <span>{notifBtn.label}</span>
            </button>
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                soundService.stopCatPurr()
                onClose()
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const PomodoroSettingsModal: React.FC<PomodoroSettingsModalProps> = (props) => {
  if (!props.isOpen) return null
  return <PomodoroSettingsDialog {...props} />
}
