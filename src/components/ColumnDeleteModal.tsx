import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  AlertTriangle,
  Trash2,
  ArrowRightLeft,
  X,
  ShieldAlert,
  Check,
} from 'lucide-react'
import {
  generateSecurityCode,
  type Column,
  type DeleteColumnAction,
} from '../types/kanban'

export interface ColumnDeleteModalProps {
  isOpen: boolean
  column: Column | null
  taskCount: number
  onClose: () => void
  onConfirm: (columnId: string, action: DeleteColumnAction) => void
}

export const ColumnDeleteModal: React.FC<ColumnDeleteModalProps> = ({
  isOpen,
  column,
  taskCount,
  onClose,
  onConfirm,
}) => {
  const [action, setAction] = useState<DeleteColumnAction>('delete_tasks')
  const [securityCode, setSecurityCode] = useState<string>('')
  const [inputCode, setInputCode] = useState<string>('')
  const [countdown, setCountdown] = useState<number>(3)
  const [lastOpenedColId, setLastOpenedColId] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  // Reset state when a new column is selected or modal opens
  if (isOpen && column && lastOpenedColId !== column.id) {
    setLastOpenedColId(column.id)
    setSecurityCode(generateSecurityCode())
    setInputCode('')
    setCountdown(3)
    setAction('delete_tasks')
  }

  if (!isOpen && lastOpenedColId !== null) {
    setLastOpenedColId(null)
    setInputCode('')
    setCountdown(3)
  }

  // Auto focus input on modal open
  useEffect(() => {
    if (isOpen && column) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen, column])

  const isCodeExact =
    securityCode.length > 0 &&
    inputCode.trim().toUpperCase() === securityCode.toUpperCase()

  // Countdown timer from 3 to 0 once code is correct
  useEffect(() => {
    if (!isOpen || !isCodeExact || countdown <= 0) return

    const timer = setTimeout(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearTimeout(timer)
  }, [isOpen, isCodeExact, countdown])

  // Reset countdown if user alters inputCode away from matching
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase()
    setInputCode(val)
    if (val.trim() !== securityCode) {
      setCountdown(3)
    }
  }

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  if (!isOpen || !column) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isCodeExact || countdown > 0) return
    onConfirm(column.id, action)
    onClose()
  }

  const isButtonDisabled = !isCodeExact || countdown > 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-column-modal-title"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-rose-200/80 dark:border-rose-900/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="delete-column-modal-title"
                className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight"
              >
                Excluir Coluna Customizada
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Esta ação é permanente e irreversível
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Fechar"
            aria-label="Fechar modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
          {/* Column Info Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {column.title}
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
              {taskCount} {taskCount === 1 ? 'tarefa' : 'tarefas'}
            </span>
          </div>

          {/* Action Choice if column has tasks */}
          {taskCount > 0 ? (
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                O que deseja fazer com as tarefas desta coluna?
              </label>

              {/* Option A: Delete all */}
              <div
                onClick={() => setAction('delete_tasks')}
                role="radio"
                aria-checked={action === 'delete_tasks'}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') setAction('delete_tasks')
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  action === 'delete_tasks'
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 ring-2 ring-rose-400/30'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border shrink-0 ${
                    action === 'delete_tasks'
                      ? 'border-rose-600 bg-rose-600 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {action === 'delete_tasks' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="space-y-0.5 text-left">
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir a coluna E todas as tarefas que estão nela
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Todas as {taskCount} tarefas serão permanentemente apagadas.
                  </p>
                </div>
              </div>

              {/* Option B: Move to Todo */}
              <div
                onClick={() => setAction('move_to_todo')}
                role="radio"
                aria-checked={action === 'move_to_todo'}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') setAction('move_to_todo')
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  action === 'move_to_todo'
                    ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 ring-2 ring-blue-400/30'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border shrink-0 ${
                    action === 'move_to_todo'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {action === 'move_to_todo' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="space-y-0.5 text-left">
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Excluir apenas a coluna e mover automaticamente as tarefas para a
                    coluna "A Fazer"
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    As tarefas serão preservadas e realocadas no backlog inicial.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Esta coluna está vazia e pronta para exclusão.</span>
            </div>
          )}

          {/* Security Code Verification Box */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="security-code-input"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Digite o código de confirmação:
              </label>
              <div
                data-testid="security-code-badge"
                className="px-3 py-1 font-mono text-xs font-bold tracking-widest bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-rose-600 dark:text-rose-400 select-all"
              >
                {securityCode}
              </div>
            </div>

            <input
              id="security-code-input"
              ref={inputRef}
              type="text"
              value={inputCode}
              onChange={handleInputChange}
              placeholder="Digite o código de 8 dígitos..."
              maxLength={8}
              autoComplete="off"
              className="w-full px-3.5 py-2.5 font-mono text-sm tracking-widest text-center uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-xs placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isButtonDisabled}
              data-testid="confirm-delete-column-btn"
              className={`flex-1 py-2.5 px-4 text-xs font-semibold text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                isButtonDisabled
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25 cursor-pointer active:scale-98'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {countdown > 0 && isCodeExact
                ? `Excluir Coluna (${countdown}s)`
                : 'Excluir Coluna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
