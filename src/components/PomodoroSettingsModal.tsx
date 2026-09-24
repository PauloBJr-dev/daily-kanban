import React, { useState, useEffect } from 'react'
import { X, Flame, Coffee, Volume2, VolumeX, Bell, BellOff, Check } from 'lucide-react'
import { notificationService } from '../services/notificationService'

export interface PomodoroSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentWorkMinutes: number
  currentBreakMinutes: number
  isSoundEnabled: boolean
  currentCatPurrType?: any
  currentCatPurrVolume?: any
  onSave: (
    workMinutes: number,
    breakMinutes: number,
    isSoundEnabled: boolean,
    catPurrType?: any,
    catPurrVolume?: any
  ) => void
}

const WORK_PRESETS = [15, 25, 30, 45, 50, 60]
const BREAK_PRESETS = [3, 5, 10, 15]

const PomodoroSettingsDialog: React.FC<Omit<PomodoroSettingsModalProps, 'isOpen'>> = ({
  onClose,
  currentWorkMinutes,
  currentBreakMinutes,
  isSoundEnabled,
  onSave,
}) => {
  const [workMinutes, setWorkMinutes] = useState(currentWorkMinutes)
  const [breakMinutes, setBreakMinutes] = useState(currentBreakMinutes)
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled)

  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    () => notificationService.getPermission()
  )

  // Fecha ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const validWork = Math.max(1, Math.min(180, Math.round(Number(workMinutes)) || 25))
    const validBreak = Math.max(1, Math.min(60, Math.round(Number(breakMinutes)) || 5))
    onSave(validWork, validBreak, soundEnabled)
    onClose()
  }

  const getNotificationButtonContent = () => {
    if (notificationStatus === 'granted') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <Check className="w-3.5 h-3.5" />
          Notificações Ativas
        </span>
      )
    }
    if (notificationStatus === 'denied') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">
          <BellOff className="w-3.5 h-3.5" />
          Bloqueadas pelo navegador
        </span>
      )
    }
    return (
      <button
        type="button"
        onClick={handleRequestNotification}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
      >
        <Bell className="w-3.5 h-3.5" />
        Permitir Notificações
      </button>
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Configurar Temporizador Pomodoro"
      className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Ajustar Temporizador
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalize a duração dos seus blocos de foco e intervalos
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar configurações"
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSave} className="p-6 space-y-6">
        <div className="space-y-5">
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
                className="w-20 px-2.5 py-1 text-right text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                className="w-20 px-2.5 py-1 text-right text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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

          {/* Efeitos Sonoros */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg ${
                  soundEnabled
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </div>
              <div>
                <label
                  htmlFor="sound-toggle-btn"
                  className="text-sm font-medium text-slate-800 dark:text-slate-200 block cursor-pointer"
                >
                  Sons ao concluir sessões
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toca um aviso sonoro harmonioso ao fim de cada ciclo
                </p>
              </div>
            </div>
            <button
              id="sound-toggle-btn"
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              aria-label="Ativar ou desativar sons do pomodoro"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer ${
                soundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Notificações do Navegador */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block">
                Notificações na Área de Trabalho
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receba avisos visuais mesmo se o navegador estiver em segundo plano
              </p>
            </div>
            <div>{getNotificationButtonContent()}</div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cancelar alterações"
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            aria-label="Salvar configurações do pomodoro"
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}

export const PomodoroSettingsModal: React.FC<PomodoroSettingsModalProps> = ({
  isOpen,
  ...props
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <PomodoroSettingsDialog {...props} />
    </div>
  )
}
