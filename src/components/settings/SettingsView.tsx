import React, { useState, useEffect } from 'react'
import {
  Sun,
  Moon,
  Flame,
  Coffee,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  GraduationCap,
  Keyboard,
  Check,
  Square,
  Bell,
  BellOff,
  Sliders,
} from 'lucide-react'
import type { CatPurrType } from '../../types/kanban'
import { soundService } from '../../services/soundService'
import { notificationService } from '../../services/notificationService'

export interface SettingsViewProps {
  isDark: boolean
  onToggleTheme: () => void
  workMinutes: number
  breakMinutes: number
  isSoundEnabled: boolean
  catPurrType?: CatPurrType
  catPurrVolume?: number
  onUpdateDurations: (workMinutes: number, breakMinutes: number) => void
  onToggleSound: () => void
  onUpdateSettings?: (settings: {
    workDurationMinutes?: number
    breakDurationMinutes?: number
    isSoundEnabled?: boolean
    catPurrType?: CatPurrType
    catPurrVolume?: number
  }) => void
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
  onOpenShortcuts?: () => void
  onOpenAcademicSubjects?: () => void
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
    description: 'Sem som de fundo durante a pausa',
  },
  {
    id: 'soft',
    label: 'Ronrom Suave',
    description: 'Vibração aveludada, calma e contínua (~25Hz)',
    badge: 'Aveludado',
  },
  {
    id: 'deep',
    label: 'Ronrom Profundo',
    description: 'Vibração corporal baixa com sub-grave (~26Hz)',
    badge: '~26Hz Sub-grave',
  },
  {
    id: 'rhythmic',
    label: 'Ronrom Rítmico',
    description: 'Modulação de respiração felina a cada ~2.2s',
    badge: 'Respiração ~2.2s',
  },
]

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDark,
  onToggleTheme,
  workMinutes: propWorkMinutes,
  breakMinutes: propBreakMinutes,
  isSoundEnabled,
  catPurrType: propCatPurrType = 'none',
  catPurrVolume: propCatPurrVolume = 0.6,
  onUpdateDurations,
  onToggleSound,
  onUpdateSettings,
  onExport,
  onImport,
  onReset,
  onOpenShortcuts,
  onOpenAcademicSubjects,
}) => {
  const [workMinutes, setWorkMinutes] = useState(propWorkMinutes)
  const [breakMinutes, setBreakMinutes] = useState(propBreakMinutes)
  const [catPurrType, setCatPurrType] = useState<CatPurrType>(propCatPurrType)
  const [catPurrVolume, setCatPurrVolume] = useState<number>(propCatPurrVolume)
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false)

  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    () => notificationService.getPermission()
  )

  useEffect(() => {
    return () => {
      soundService.stopCatPurr()
    }
  }, [])

  const handleWorkMinutesChange = (mins: number) => {
    const valid = Math.max(1, Math.min(180, mins))
    setWorkMinutes(valid)
    onUpdateDurations(valid, breakMinutes)
    onUpdateSettings?.({ workDurationMinutes: valid })
  }

  const handleBreakMinutesChange = (mins: number) => {
    const valid = Math.max(1, Math.min(60, mins))
    setBreakMinutes(valid)
    onUpdateDurations(workMinutes, valid)
    onUpdateSettings?.({ breakDurationMinutes: valid })
  }

  const handleSelectPurr = (type: CatPurrType) => {
    if (isPreviewing) {
      soundService.stopCatPurr()
      setIsPreviewing(false)
    }
    setCatPurrType(type)
    onUpdateSettings?.({ catPurrType: type })
  }

  const handleVolumeChange = (vol: number) => {
    const valid = Math.max(0.05, Math.min(1, vol))
    setCatPurrVolume(valid)
    onUpdateSettings?.({ catPurrVolume: valid })
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

  const handleRequestNotification = async () => {
    const result = await notificationService.requestPermission()
    setNotificationStatus(result)
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Configurações do Sistema
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalize aparência, temporizador de foco, sons ambiente, dados e atalhos
        </p>
      </div>

      {/* SECTION 1: APARÊNCIA & TEMA */}
      <section
        aria-labelledby="settings-appearance-title"
        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div>
          <h3
            id="settings-appearance-title"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            Aparência & Tema
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Escolha a experiência visual que melhor se adapta ao seu ambiente de trabalho
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <button
            type="button"
            onClick={() => {
              if (isDark) onToggleTheme()
            }}
            aria-label="Selecionar Tema Claro"
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              !isDark
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                  Tema Claro
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Ideal para ambientes iluminados
                </span>
              </div>
            </div>
            {!isDark && (
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isDark) onToggleTheme()
            }}
            aria-label="Selecionar Tema Escuro"
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              isDark
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                  Tema Escuro
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Conforto visual e menos fadiga ocular
                </span>
              </div>
            </div>
            {isDark && (
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>
        </div>
      </section>

      {/* SECTION 2: TEMPORIZADOR POMODORO & SONS */}
      <section
        aria-labelledby="settings-pomodoro-title"
        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"
      >
        <div>
          <h3
            id="settings-pomodoro-title"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            Temporizador Pomodoro & Sons
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ajuste durações de ciclo, sons de alerta e relaxamento com ronrom de gato
          </p>
        </div>

        {/* Duração de Foco */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="settings-work-duration"
              className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              <Flame className="w-4 h-4 text-rose-500" />
              Duração do Foco (minutos)
            </label>
            <input
              id="settings-work-duration"
              type="number"
              min="1"
              max="180"
              value={workMinutes}
              onChange={(e) => handleWorkMinutesChange(Number(e.target.value))}
              aria-label="Minutos de foco"
              className="w-20 px-2.5 py-1 text-right text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {WORK_PRESETS.map((preset) => {
              const isSelected = workMinutes === preset
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleWorkMinutesChange(preset)}
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
              htmlFor="settings-break-duration"
              className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              <Coffee className="w-4 h-4 text-emerald-500" />
              Duração da Pausa (minutos)
            </label>
            <input
              id="settings-break-duration"
              type="number"
              min="1"
              max="60"
              value={breakMinutes}
              onChange={(e) => handleBreakMinutesChange(Number(e.target.value))}
              aria-label="Minutos de pausa"
              className="w-20 px-2.5 py-1 text-right text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BREAK_PRESETS.map((preset) => {
              const isSelected = breakMinutes === preset
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleBreakMinutesChange(preset)}
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

        {/* Efeitos Sonoros */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                isSoundEnabled
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
              }`}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block">
                Som de Alarme ao Finalizar
              </span>
              <span className="text-xs text-slate-400">
                {isSoundEnabled
                  ? 'Acorde sonoro suave ao término de cada ciclo'
                  : 'Modo silencioso'}
              </span>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isSoundEnabled}
            aria-label="Ativar ou desativar som de alarme"
            onClick={onToggleSound}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
              isSoundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isSoundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Som de Ronrom */}
        <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">
              🐱
            </span>
            <div>
              <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Som de Ronronar de Gato (Descanso Zen)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sintetizado acusticamente para desacelerar e relaxar durante a pausa
              </p>
            </div>
          </div>

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
                  onClick={() => handleSelectPurr(option.id)}
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

          {catPurrType !== 'none' && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
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
                  aria-label={isPreviewing ? 'Parar teste de som' : 'Ouvir teste de som'}
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
                      <span>Testar Som</span>
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
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                aria-label="Ajustar volume do ronrom"
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          )}
        </div>

        {/* Notificações */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block">
                Notificações de Foco
              </span>
              <span className="text-xs text-slate-400">
                Receba alertas quando a janela estiver minimizada
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={
              notificationStatus === 'default' ? handleRequestNotification : undefined
            }
            disabled={notificationStatus === 'denied' || notificationStatus === 'granted'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              notificationStatus === 'granted'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 cursor-default'
                : notificationStatus === 'denied'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 cursor-not-allowed'
                  : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 cursor-pointer'
            }`}
          >
            {notificationStatus === 'granted' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : notificationStatus === 'denied' ? (
              <BellOff className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            )}
            <span>
              {notificationStatus === 'granted'
                ? 'Ativadas'
                : notificationStatus === 'denied'
                  ? 'Bloqueadas'
                  : 'Ativar Notificações'}
            </span>
          </button>
        </div>
      </section>

      {/* SECTION 3: DADOS & BACKUP */}
      <section
        aria-labelledby="settings-data-title"
        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div>
          <h3
            id="settings-data-title"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            Dados & Backup
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Exporte suas tarefas para arquivo seguro, restaure backups ou redefina dados
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Exportar */}
          <button
            type="button"
            onClick={onExport}
            aria-label="Exportar Backup JSON"
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Exportar Backup JSON</span>
            <span className="text-[11px] text-slate-400 text-center">
              Salva arquivo .json com suas tarefas
            </span>
          </button>

          {/* Importar */}
          <label
            aria-label="Importar Dados JSON"
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Importar Dados JSON</span>
            <span className="text-[11px] text-slate-400 text-center">
              Restaura a partir de arquivo de backup
            </span>
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              className="hidden"
              aria-label="Selecionar arquivo JSON para importação"
            />
          </label>

          {/* Restaurar Demonstração */}
          <button
            type="button"
            onClick={onReset}
            aria-label="Restaurar Dados de Demonstração"
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Restaurar Dados Iniciais</span>
            <span className="text-[11px] text-rose-500/80 dark:text-rose-400/80 text-center">
              Reseta para o modelo de demonstração
            </span>
          </button>
        </div>
      </section>

      {/* SECTION 4: ESPAÇO ACADÊMICO ACESSO RÁPIDO */}
      {onOpenAcademicSubjects && (
        <section
          aria-labelledby="settings-academic-title"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="settings-academic-title"
                className="text-base font-semibold text-slate-900 dark:text-slate-100"
              >
                Disciplinas & Matérias Acadêmicas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize matérias, cores de identificação e notas de estudo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAcademicSubjects}
            className="px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            Acessar Espaço Acadêmico
          </button>
        </section>
      )}

      {/* SECTION 5: GUIA DE ATALHOS DO TECLADO */}
      <section
        aria-labelledby="settings-shortcuts-title"
        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3
                id="settings-shortcuts-title"
                className="text-base font-semibold text-slate-900 dark:text-slate-100"
              >
                Atalhos do Teclado
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Navegue e crie tarefas rapidamente usando comandos do teclado
              </p>
            </div>
          </div>
          {onOpenShortcuts && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Abrir Modal de Ajuda (?)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-700 dark:text-slate-300">
              Nova Tarefa ou Nova Anotação
            </span>
            <kbd className="px-2 py-0.5 text-xs font-mono font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 shadow-2xs">
              N
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-700 dark:text-slate-300">
              Focar na Barra de Busca
            </span>
            <kbd className="px-2 py-0.5 text-xs font-mono font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 shadow-2xs">
              /
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-700 dark:text-slate-300">
              Iniciar / Pausar Pomodoro
            </span>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs font-mono font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 shadow-2xs">
                Espaço
              </kbd>
              <span className="text-xs text-slate-400">ou</span>
              <kbd className="px-1.5 py-0.5 text-xs font-mono font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 shadow-2xs">
                P
              </kbd>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-700 dark:text-slate-300">
              Abrir Guia de Atalhos
            </span>
            <kbd className="px-2 py-0.5 text-xs font-mono font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 shadow-2xs">
              ?
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between sm:col-span-2">
            <span className="text-xs text-slate-700 dark:text-slate-300">
              Fechar Janelas, Modais ou Modo Zen
            </span>
            <kbd className="px-2 py-0.5 text-xs font-mono font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 shadow-2xs">
              Esc
            </kbd>
          </div>
        </div>
      </section>
    </div>
  )
}
