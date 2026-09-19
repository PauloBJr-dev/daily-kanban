import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export interface ResetPasswordViewProps {
  onSuccess?: () => void
  onCancel?: () => void
  isDark?: boolean
  onToggleTheme?: () => void
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  onSuccess,
  onCancel,
  isDark,
  onToggleTheme,
}) => {
  const { isPasswordRecovery, updateUserPassword, signOut, openAuthModal } = useAuth()
  const toast = useToast()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Verificação rigorosa de segurança do token / fluxo de recuperação
  const isLegitimateRecovery = useMemo(() => {
    if (isPasswordRecovery) return true
    if (typeof window === 'undefined') return false

    const hash = window.location.hash || ''
    const search = window.location.search || ''
    const pathname = window.location.pathname || ''

    if (hash.includes('type=recovery')) return true
    if (
      pathname === '/reset-password' &&
      (hash.includes('access_token') || search.includes('code'))
    ) {
      return true
    }

    return false
  }, [isPasswordRecovery])

  // Limpeza e higienização segura da URL assim que o Supabase processa
  useEffect(() => {
    if (typeof window !== 'undefined' && isLegitimateRecovery) {
      const hash = window.location.hash || ''
      const search = window.location.search || ''
      if (hash.includes('access_token') || search.includes('code')) {
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [isLegitimateRecovery])

  // Critérios de Validação da Senha
  const reqMinLength = password.length >= 8
  const reqHasNumber = /[0-9]/.test(password)
  const reqHasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\]/.test(password)
  const reqMatch = confirmPassword.length > 0 && password === confirmPassword
  const isFormValid = reqMinLength && reqHasNumber && reqHasSymbol && reqMatch

  // Cálculo da Força da Senha para Animação e Cores Dinâmicas
  const strength = useMemo(() => {
    if (password.length === 0) {
      return {
        label: '',
        color: 'bg-slate-200 dark:bg-slate-700',
        textColor: 'text-slate-400 dark:text-slate-500',
        percentage: 0,
      }
    }

    // Fraca: menos de 8 caracteres ou não atende a número e símbolo
    if (!reqMinLength || (!reqHasNumber && !reqHasSymbol)) {
      return {
        label: 'Fraca',
        color: 'bg-rose-500',
        textColor: 'text-rose-600 dark:text-rose-400',
        percentage: 33,
      }
    }

    // Média: 8+ caracteres e pelo menos um requisito (número OU símbolo)
    if (
      reqMinLength &&
      (reqHasNumber || reqHasSymbol) &&
      !(reqHasNumber && reqHasSymbol)
    ) {
      return {
        label: 'Média',
        color: 'bg-amber-500',
        textColor: 'text-amber-600 dark:text-amber-400',
        percentage: 66,
      }
    }

    // Forte: 8+ caracteres + número + símbolo
    return {
      label: 'Forte',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      percentage: 100,
    }
  }, [password, reqMinLength, reqHasNumber, reqHasSymbol])

  const handleNavigateHome = useCallback(() => {
    if (onCancel) {
      onCancel()
      return
    }
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [onCancel])

  const handleRequestNewLink = useCallback(() => {
    handleNavigateHome()
    openAuthModal('signin')
  }, [handleNavigateHome, openAuthModal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!isFormValid) {
      setErrorMessage('Por favor, atenda a todos os requisitos de segurança da senha.')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await updateUserPassword(password)
      if (error) {
        setErrorMessage(error.message)
        toast.error(`Erro ao redefinir senha: ${error.message}`)
        return
      }

      // Encerrar sessão de recuperação para exigir login com a nova senha
      await signOut()

      setIsSuccess(true)
      toast.success('Senha redefinida com sucesso! Faça login com sua nova senha.')
    } catch {
      const msg = 'Erro inesperado ao redefinir a senha. Tente novamente mais tarde.'
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinishSuccess = useCallback(() => {
    if (onSuccess) {
      onSuccess()
      return
    }
    handleNavigateHome()
    openAuthModal('signin')
  }, [onSuccess, handleNavigateHome, openAuthModal])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Bar com Identidade e Tema */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight font-headline">
            Organy
          </span>
          <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            Segurança da Conta
          </span>
        </div>

        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shadow-xs cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        )}
      </header>

      {/* Conteúdo Central */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        {!isLegitimateRecovery ? (
          /* CARD DE SEGURANÇA: BLOQUEIO QUANDO ACESSO DIRETO SEM TOKEN */
          <div
            role="alert"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center ring-8 ring-rose-500/10">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-headline">
                Link inválido ou expirado
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Por motivos de segurança, a redefinição de senha só pode ser feita através
                do link enviado ao seu e-mail.
              </p>
            </div>

            <div className="pt-3 space-y-2.5">
              <button
                type="button"
                onClick={handleRequestNewLink}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Solicitar novo link</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNavigateHome}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para o início</span>
              </button>
            </div>
          </div>
        ) : isSuccess ? (
          /* CARD DE SUCESSO PÓS-REDEFINIÇÃO */
          <div
            role="status"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-headline">
                Senha redefinida com sucesso!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Sua credencial de acesso foi atualizada com sucesso. Por segurança, faça
                login utilizando sua nova senha.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinishSuccess}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ir para o Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO SEGURO DE REDEFINIÇÃO DE SENHA */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
            {/* Header do Card */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center ring-8 ring-blue-500/10">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-headline">
                Criar Nova Senha
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Defina uma senha segura para proteger sua conta e suas anotações.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo: Nova Senha */}
              <div className="space-y-1.5">
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full pl-10 pr-12 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'
                    }
                    className="absolute inset-y-0 right-0 px-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Barra de Progresso Animada de Força da Senha */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-slate-500 dark:text-slate-400">
                      Força da senha
                    </span>
                    <span className={`font-semibold ${strength.textColor}`}>
                      {strength.label}
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-valuenow={strength.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
                  >
                    <div
                      className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
                      style={{ width: `${strength.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Campo: Confirmar Nova Senha */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? 'Ocultar confirmação de senha'
                        : 'Mostrar confirmação de senha'
                    }
                    className="absolute inset-y-0 right-0 px-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Checklist Visual Interativo de Requisitos */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
                <span className="block font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                  Critérios de Segurança:
                </span>

                <div className="space-y-1.5">
                  <div
                    className={`flex items-center gap-2 ${
                      reqMinLength
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {reqMinLength ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                    )}
                    <span>Mínimo de 8 caracteres</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 ${
                      reqHasNumber
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {reqHasNumber ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                    )}
                    <span>Pelo menos 1 número</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 ${
                      reqHasSymbol
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {reqHasSymbol ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                    )}
                    <span>Pelo menos 1 símbolo especial (!@#$%...)</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 ${
                      reqMatch
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {reqMatch ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                    )}
                    <span>Senhas coincidem</span>
                  </div>
                </div>
              </div>

              {/* Botão de Submissão */}
              <button
                type="submit"
                disabled={submitting || !isFormValid}
                className="w-full min-h-[44px] py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Atualizando senha...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Redefinir Senha</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleNavigateHome}
                className="w-full min-h-[44px] py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancelar e voltar</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="w-full max-w-4xl mx-auto text-center py-2 text-[11px] text-slate-400 dark:text-slate-600">
        © {new Date().getFullYear()} Organy DailyFlow. Segurança de nível institucional.
      </footer>
    </div>
  )
}

export default ResetPasswordView
