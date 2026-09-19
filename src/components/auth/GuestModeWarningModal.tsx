import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  CloudOff,
  Trash2,
  Smartphone,
  ArrowLeft,
  ArrowRight,
  X,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export interface GuestModeWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
}

export const GuestModeWarningModal: React.FC<GuestModeWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { continueAsGuest } = useAuth()
  const [agreed, setAgreed] = useState(false)

  // Limpa o checkbox sempre que o modal abre
  useEffect(() => {
    if (isOpen) {
      // oxlint-disable-next-line react/set-state-in-effect
      setAgreed(false)
    }
  }, [isOpen])

  // Fecha ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!agreed) return
    continueAsGuest()
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-warning-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Botão fechar discreto no canto superior */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Fechar aviso"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Header com ícone de alerta */}
          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200/60 dark:border-amber-800/60 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2
                id="guest-warning-title"
                className="text-xl font-bold text-slate-900 dark:text-white leading-snug"
              >
                O que é Armazenamento Local?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Entenda como seus dados serão guardados antes de prosseguir no modo
                visitante.
              </p>
            </div>
          </div>

          {/* 3 Tópicos de aviso */}
          <div className="space-y-3 my-5">
            {/* Tópico 1 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 mt-0.5">
                <CloudOff className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  Sem sincronização na nuvem
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Suas tarefas e anotações ficam salvas estritamente no navegador deste
                  aparelho.
                </p>
              </div>
            </div>

            {/* Tópico 2 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="p-1.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg shrink-0 mt-0.5">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  Risco de perda ao limpar cache/cookies
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Limpar os dados de navegação, cookies ou histórico deste navegador
                  apagará tudo permanentemente.
                </p>
              </div>
            </div>

            {/* Tópico 3 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  Sem recuperação entre aparelhos
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Você não poderá acessar suas rotinas e notas a partir de outros
                  computadores ou celulares.
                </p>
              </div>
            </div>
          </div>

          {/* Checkbox obrigatório */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-1 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                aria-label="Entendo os riscos do armazenamento local e desejo prosseguir sem login."
              />
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                Entendo os riscos do armazenamento local e desejo prosseguir sem login.
              </span>
            </label>
          </div>

          {/* Botões de Ação */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Login</span>
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!agreed}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Continuar sem Conta (Modo Convidado)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
