import React, { useState } from 'react'
import {
  Volume2,
  Volume1,
  VolumeX,
  BellRing,
  Activity,
  Play,
  Check,
  CheckCircle2,
  Bell,
  BellOff,
} from 'lucide-react'
import { notificationService } from '../../services/notificationService'
import { playCompletionSound, type CompletionSoundType } from './soundHelper'

export interface NotificationsSectionProps {
  isSoundEnabled: boolean
  onToggleSound: () => void
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  isSoundEnabled,
  onToggleSound,
}) => {
  const [selectedRingtone, setSelectedRingtone] = useState<CompletionSoundType>('marimba')
  const [isPlayingTest, setIsPlayingTest] = useState<boolean>(false)
  const [alertVolume, setAlertVolume] = useState<number>(75)

  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    () => notificationService.getPermission()
  )

  const handleTestRingtone = () => {
    if (isPlayingTest) return
    setIsPlayingTest(true)
    playCompletionSound(selectedRingtone)
    setTimeout(() => {
      setIsPlayingTest(false)
    }, 1200)
  }

  const handleRequestNotification = async () => {
    const result = await notificationService.requestPermission()
    setNotificationStatus(result)
  }

  return (
    <section
      id="notificacoes"
      aria-labelledby="settings-notifications-title"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-6 transition-colors"
    >
      {/* Section Header */}
      <div className="flex items-start gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <Volume2 className="w-5 h-5" />
        </div>
        <div>
          <h2
            id="settings-notifications-title"
            className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100"
          >
            Notificações
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure alertas de início, fim de ciclos e volume dos avisos sonoros
          </p>
        </div>
      </div>

      {/* Grid 2 colunas: Seletor de Toques & Volume/Permissões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna 1: Audio Selector */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Toque de Conclusão de Ciclo
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {/* Opção 1: Marimba Acústica */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRingtone('marimba')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedRingtone('marimba')
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedRingtone === 'marimba'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedRingtone === 'marimba'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Marimba Acústica
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Acorde orgânico, claro e brilhante
                  </span>
                </div>
              </div>
              {selectedRingtone === 'marimba' ? (
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
              )}
            </div>

            {/* Opção 2: Sino Tibetano */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRingtone('tibetan')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedRingtone('tibetan')
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedRingtone === 'tibetan'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedRingtone === 'tibetan'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <BellRing className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Sino Tibetano Suave
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Ressonância profunda e calma
                  </span>
                </div>
              </div>
              {selectedRingtone === 'tibetan' ? (
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
              )}
            </div>

            {/* Opção 3: Digital Sintético */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRingtone('synthetic')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedRingtone('synthetic')
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedRingtone === 'synthetic'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedRingtone === 'synthetic'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Digital Sintético
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Bip moderno e preciso
                  </span>
                </div>
              </div>
              {selectedRingtone === 'synthetic' ? (
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestRingtone}
            aria-label="Testar Som Selecionado"
            className="mt-1.5 w-fit px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Play
              className={`w-3.5 h-3.5 fill-current ${isPlayingTest ? 'animate-pulse' : ''}`}
            />
            <span>{isPlayingTest ? 'Tocando Som...' : 'Testar Som Selecionado'}</span>
          </button>
        </div>

        {/* Coluna 2: Volume, Alarme e Permissões */}
        <div className="flex flex-col justify-between gap-5 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200/70 dark:border-slate-800/70">
          {/* Som de Alarme Toggle */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg ${
                  isSoundEnabled
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                }`}
              >
                {isSoundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                  Som de Alarme ao Finalizar
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
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
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isSoundEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isSoundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Slider de Volume de Alertas */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Volume de Alertas
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60">
                {alertVolume}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Volume1 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={alertVolume}
                onChange={(e) => setAlertVolume(Number(e.target.value))}
                aria-label="Volume de alertas sonoros"
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <Volume2 className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              O volume aplica-se aos alarmes de fim de sessão e cliques sutis do teclado.
            </p>
          </div>

          {/* Notificações na Área de Trabalho */}
          <div className="pt-3.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Notificações na Área de Trabalho
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Exibir pop-up do navegador ao concluir ciclos
              </span>
            </div>

            {notificationStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                <Check className="w-3.5 h-3.5" />
                <span>Permitido</span>
              </span>
            ) : notificationStatus === 'denied' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800/60">
                <BellOff className="w-3.5 h-3.5" />
                <span>Bloqueado</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestNotification}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 cursor-pointer transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Ativar Notificações</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
