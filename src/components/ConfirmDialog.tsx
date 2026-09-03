import React, { useEffect, useState, useRef } from 'react'
import { AlertTriangle, X, ShieldAlert } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
  requireConfirmationWord?: string
  isDoubleConfirm?: boolean
  onConfirm: () => void
  onClose: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = false,
  requireConfirmationWord,
  isDoubleConfirm = false,
  onConfirm,
  onClose,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('')
  const [step, setStep] = useState<1 | 2>(1)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // Reset state during render when dialog opens
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setConfirmationInput('')
      setStep(1)
    }
  }

  // Manage focus restoration and input autofocus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement

      // Slight timeout to ensure modal is rendered before focusing
      const timer = setTimeout(() => {
        if (requireConfirmationWord && inputRef.current) {
          inputRef.current.focus()
        } else if (confirmButtonRef.current) {
          confirmButtonRef.current.focus()
        }
      }, 50)
      return () => clearTimeout(timer)
    } else {
      if (
        previousActiveElement.current &&
        typeof previousActiveElement.current.focus === 'function'
      ) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, requireConfirmationWord])

  // Close on Escape key
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

  const isWordConfirmed =
    !requireConfirmationWord || confirmationInput.trim() === requireConfirmationWord
  const isConfirmDisabled = !isWordConfirmed

  const handleConfirmClick = () => {
    if (isDoubleConfirm && step === 1) {
      setStep(2)
      return
    }

    if (isConfirmDisabled) return

    onConfirm()
    onClose()
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isConfirmDisabled) {
      e.preventDefault()
      handleConfirmClick()
    }
  }

  // Determine modal texts and buttons based on step / double confirm
  const isStep2 = isDoubleConfirm && step === 2
  const currentTitle = isStep2 ? 'Confirmação Definitiva e Irreversível' : title
  const currentConfirmText =
    isDoubleConfirm && step === 1 ? 'Continuar para Confirmação' : confirmText

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200/80 dark:border-slate-800 shadow-2xl p-5 sm:p-6 relative animate-in slide-in-from-bottom sm:zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger || isStep2
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
            }`}
          >
            {isDoubleConfirm ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 pr-4">
            {isDoubleConfirm && (
              <div className="mb-1 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {isStep2 ? 'Etapa 2 de 2: Definitivo' : 'Etapa 1 de 2: Verificação'}
              </div>
            )}
            <h3
              id="confirm-dialog-title"
              className="text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              {currentTitle}
            </h3>
            <p
              id="confirm-dialog-description"
              className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed"
            >
              {isStep2
                ? 'Esta ação não poderá ser desfeita em hipótese alguma. Todos os dados associados serão eliminados permanentemente.'
                : message}
            </p>

            {/* Confirmation Word Requirement Input */}
            {requireConfirmationWord && (!isDoubleConfirm || isStep2) && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <label
                  htmlFor="confirm-word-input"
                  className="block text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Para confirmar, digite{' '}
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 px-1 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900">
                    {requireConfirmationWord}
                  </span>{' '}
                  abaixo:
                </label>
                <input
                  ref={inputRef}
                  id="confirm-word-input"
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={`Digite "${requireConfirmationWord}"`}
                  autoComplete="off"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-mono"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            disabled={isConfirmDisabled}
            onClick={handleConfirmClick}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
              isConfirmDisabled
                ? 'opacity-50 cursor-not-allowed bg-slate-400 dark:bg-slate-700'
                : isDanger || isStep2
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none focus-visible:ring-rose-500 active:scale-95'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none focus-visible:ring-indigo-500 active:scale-95'
            }`}
          >
            {currentConfirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
