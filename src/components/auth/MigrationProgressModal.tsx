import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Download,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  Cloud,
} from 'lucide-react'
import {
  migrationService,
  type MigrationStepState,
  INITIAL_MIGRATION_STEPS,
} from '../../services/migrationService'

export interface MigrationProgressModalProps {
  isOpen: boolean
  userId: string
  onComplete: () => void
  onSkip?: () => void
}

export const MigrationProgressModal: React.FC<MigrationProgressModalProps> = ({
  isOpen,
  userId,
  onComplete,
  onSkip,
}) => {
  const [steps, setSteps] = useState<MigrationStepState[]>(INITIAL_MIGRATION_STEPS)
  const [isRunning, setIsRunning] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasStartedRef = useRef(false)

  const runMigration = useCallback(
    async (existingSteps?: MigrationStepState[]) => {
      if (!userId) return

      setIsRunning(true)
      setHasError(false)
      setErrorMessage(null)

      const res = await migrationService.executeMigration(
        userId,
        (updatedSteps) => {
          setSteps([...updatedSteps])
        },
        existingSteps
      )

      setIsRunning(false)
      if (res.success) {
        setIsSuccess(true)
        // Redireciona automaticamente após um breve intervalo para o usuário visualizar a confirmação
        const timer = setTimeout(() => {
          onComplete()
        }, 1200)
        return () => clearTimeout(timer)
      } else {
        setHasError(true)
        setErrorMessage(
          res.error ||
            'Houve uma instabilidade na conexão ao sincronizar suas anotações. Seus dados continuam salvos com segurança neste navegador.'
        )
      }
    },
    [userId, onComplete]
  )

  useEffect(() => {
    if (isOpen && userId && !hasStartedRef.current) {
      hasStartedRef.current = true
      runMigration()
    }
  }, [isOpen, userId, runMigration])

  const handleRetry = () => {
    runMigration(steps)
  }

  const handleDownloadBackup = () => {
    migrationService.downloadBackup()
  }

  const handleSkipToLocal = () => {
    if (onSkip) {
      onSkip()
    } else {
      onComplete()
    }
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="migration-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200/60 dark:border-blue-800/60 shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2
                id="migration-modal-title"
                className="text-xl font-bold text-slate-900 dark:text-white leading-snug"
              >
                Sincronizando seus Dados
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Garantindo a preservação total das suas tarefas e anotações.
              </p>
            </div>
          </div>

          {/* Checklist de 6 Etapas em Tempo Real */}
          <div className="space-y-2.5 my-5">
            {steps.map((step) => {
              const isStepRunning = step.status === 'running'
              const isStepCompleted = step.status === 'completed'
              const isStepError = step.status === 'error'

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    isStepRunning
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/70'
                      : isStepCompleted
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40'
                        : isStepError
                          ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/70'
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/50'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isStepRunning && (
                      <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                    )}
                    {isStepCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {isStepError && (
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    )}
                    {step.status === 'pending' && (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-xs sm:text-sm font-semibold ${
                          isStepError
                            ? 'text-rose-700 dark:text-rose-300'
                            : isStepCompleted
                              ? 'text-emerald-800 dark:text-emerald-300'
                              : isStepRunning
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {isStepCompleted && 'Concluído'}
                        {isStepRunning && 'Processando...'}
                        {isStepError && 'Atenção'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {step.error ? step.error : step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Banner de Sucesso */}
          {isSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm my-4">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Todos os dados foram preservados e sincronizados com sucesso!
                Redirecionando...
              </span>
            </div>
          )}

          {/* Banner de Erro Amigável */}
          {hasError && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 my-4 text-xs sm:text-sm text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-start gap-2.5 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {errorMessage ||
                    'Houve uma instabilidade na conexão ao sincronizar suas anotações. Seus dados continuam salvos com segurança neste navegador.'}
                </span>
              </div>
              <p className="text-amber-800/90 dark:text-amber-300 text-xs">
                Nenhum dado foi perdido. Você pode tentar novamente agora ou continuar no
                modo local e sincronizar depois.
              </p>
            </div>
          )}

          {/* Ações / Botões de Contingência */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
            {hasError ? (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isRunning}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <RotateCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                    <span>Tentar Novamente</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>Baixar Backup dos Dados (JSON)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSkipToLocal}
                  className="w-full py-2.5 px-4 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Acessar Modo Local e Sincronizar Depois →
                </button>
              </>
            ) : isSuccess ? (
              <button
                type="button"
                onClick={onComplete}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Acessar Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center justify-center py-2 text-xs text-slate-400">
                <span className="animate-pulse">
                  Sincronizando com segurança em segundo plano...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
