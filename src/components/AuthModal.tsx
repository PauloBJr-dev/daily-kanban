import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Sparkles,
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  UserPlus,
  LogIn,
  KeyRound,
  CloudOff,
  Trash2,
  UserX,
  Zap,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export interface AuthModalProps {
  isOpen?: boolean
  onClose?: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signUpWithPassword,
    signInWithPassword,
    resetPasswordForEmail,
    continueAsGuest,
    authModalInitialTab,
    user,
    isGuestAcknowledged,
  } = useAuth()
  const toast = useToast()

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAuthModalOpen
  const onClose = propOnClose || closeAuthModal

  const canClose = Boolean(user || isGuestAcknowledged)

  const [tab, setTab] = useState<'signup' | 'signin'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isAgreedGuest, setIsAgreedGuest] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Estados do fluxo "Esqueceu a senha?"
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  // Sempre que isOpen mudar para true: limpar campos e aplicar aba inicial
  const prevIsOpenRef = useRef(false)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setName('')
      setEmail('')
      setPassword('')
      setForgotEmail('')
      setIsForgotPassword(false)
      setForgotSuccess(false)
      setForgotLoading(false)
      setErrorMessage(null)
      setIsAgreedGuest(false)
      setShowPassword(false)
      if (authModalInitialTab) {
        // oxlint-disable-next-line react/set-state-in-effect
        setTab(authModalInitialTab)
      }
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, authModalInitialTab])

  // Fechar com tecla Escape (apenas se puder fechar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && canClose) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, canClose])

  const handleTabChange = (newTab: 'signup' | 'signin') => {
    setTab(newTab)
    setIsForgotPassword(false)
    setForgotSuccess(false)
    setErrorMessage(null)
  }

  const isPasswordShort = password.length > 0 && password.length < 8
  const isPasswordValid = password.length >= 8

  const handleSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setErrorMessage(null)

      if (!name.trim()) {
        setErrorMessage('Por favor, informe seu nome ou apelido.')
        return
      }
      if (!email.trim()) {
        setErrorMessage('Por favor, informe um endereço de e-mail válido.')
        return
      }
      if (password.length < 8) {
        setErrorMessage('A senha deve conter pelo menos 8 caracteres.')
        return
      }

      setSubmitting(true)
      try {
        const { error } = await signUpWithPassword(name.trim(), email.trim(), password)
        if (error) {
          setErrorMessage(error.message)
          toast.error(`Erro ao criar conta: ${error.message}`)
        } else {
          toast.success('Conta criada com sucesso! Bem-vindo(a) ao DailyFlow.')
          onClose()
        }
      } finally {
        setSubmitting(false)
      }
    },
    [name, email, password, signUpWithPassword, toast, onClose]
  )

  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setErrorMessage(null)

      if (!email.trim()) {
        setErrorMessage('Por favor, informe seu e-mail.')
        return
      }
      if (!password) {
        setErrorMessage('Por favor, informe sua senha.')
        return
      }

      setSubmitting(true)
      try {
        const { error } = await signInWithPassword(email.trim(), password)
        if (error) {
          setErrorMessage(error.message)
          toast.error(`Erro ao entrar: ${error.message}`)
        } else {
          toast.success('Login realizado com sucesso! Bem-vindo(a) de volta.')
          onClose()
        }
      } finally {
        setSubmitting(false)
      }
    },
    [email, password, signInWithPassword, toast, onClose]
  )

  const handleForgotPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setErrorMessage(null)

      if (!forgotEmail.trim()) {
        setErrorMessage('Por favor, informe seu e-mail cadastrado.')
        return
      }

      setForgotLoading(true)
      try {
        const { error } = await resetPasswordForEmail(forgotEmail.trim())
        if (error) {
          setErrorMessage(error.message)
          toast.error(`Erro ao enviar e-mail: ${error.message}`)
        } else {
          setForgotSuccess(true)
          toast.success('Link de recuperação enviado com sucesso!')
        }
      } finally {
        setForgotLoading(false)
      }
    },
    [forgotEmail, resetPasswordForEmail, toast]
  )

  const handleContinueAsGuest = useCallback(() => {
    if (!isAgreedGuest) return
    continueAsGuest()
    onClose()
    toast.info('Você está utilizando o DailyFlow no modo Armazenamento Local.')
  }, [isAgreedGuest, continueAsGuest, onClose, toast])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={canClose ? onClose : undefined}
    >
      <div
        className="w-full sm:max-w-xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200/90 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-blue-500/5 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92dvh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Puxador visual de bottom sheet para mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Modal Branding Header */}
        <div className="relative text-center pt-3 sm:pt-6 pb-2 px-6 shrink-0">
          {canClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-2 right-4 sm:top-4 sm:right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center justify-center p-3.5 bg-blue-50 dark:bg-blue-950/60 rounded-2xl text-blue-600 dark:text-blue-400 mb-3 ring-8 ring-blue-500/10">
            {isForgotPassword ? (
              <KeyRound className="w-8 h-8" />
            ) : (
              <Sparkles className="w-8 h-8" />
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <h2
              id="auth-modal-title"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            >
              Organy
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 rounded-full">
              {isForgotPassword ? 'Recuperação de conta' : 'Organização e estudos'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal max-w-sm mx-auto leading-relaxed">
            {isForgotPassword
              ? 'Enviaremos um link de acesso seguro para você redefinir sua senha.'
              : 'Organize seu dia com clareza, foco e alta produtividade acadêmica.'}
          </p>
        </div>

        {/* Modal Body (Scrollable & overscroll-contain) */}
        <div className="p-6 sm:p-8 overflow-y-auto overscroll-contain space-y-6 flex-1">
          {/* Sub-view: Esqueceu a Senha */}
          {isForgotPassword ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {forgotSuccess ? (
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                        Link de recuperação enviado!
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-300">
                        Enviamos as instruções para <strong>{forgotEmail}</strong>.
                        Verifique sua caixa de entrada e pasta de spam.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false)
                      setForgotSuccess(false)
                      setTab('signin')
                    }}
                    className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar para o Login</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      E-mail da sua conta
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="seu.email@universidade.edu.br"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-base sm:text-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Informe o mesmo e-mail utilizado no seu cadastro para receber o link
                      de redefinição.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail.trim()}
                    className="w-full min-h-[44px] mt-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando link...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar Link de Recuperação</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false)
                      setErrorMessage(null)
                    }}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar para o Login</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Pill Segmented Switcher com touch target mínimo de 44px */}
              <div
                className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl relative"
                role="tablist"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'signup'}
                  onClick={() => handleTabChange('signup')}
                  className={`min-h-[44px] flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    tab === 'signup'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-slate-900/5 dark:ring-white/10'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Criar Conta</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'signin'}
                  onClick={() => handleTabChange('signin')}
                  className={`min-h-[44px] flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    tab === 'signin'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-slate-900/5 dark:ring-white/10'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </button>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form: Criar Conta */}
              {tab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Nome Completo */}
                  <div>
                    <label
                      htmlFor="signup-name"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Seu Nome ou Apelido
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="signup-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex.: Dra. Beatriz Nogueira"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-base sm:text-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Usado para personalização visual no sistema, avatar e saudações.
                    </p>
                  </div>

                  {/* E-mail */}
                  <div>
                    <label
                      htmlFor="signup-email"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Seu e-mail
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@universidade.edu.br"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-base sm:text-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Sem necessidade de verificação prévia de e-mail.
                    </p>
                  </div>

                  {/* Senha com indicador de força Stitch */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="signup-password"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Senha
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className={`w-full pl-10 pr-12 py-2.5 text-base sm:text-xs rounded-xl border bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          isPasswordShort
                            ? 'border-amber-400 dark:border-amber-500 focus:ring-amber-500/20'
                            : isPasswordValid
                              ? 'border-emerald-500 dark:border-emerald-500 focus:ring-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-blue-500/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        className="absolute inset-y-0 right-0 px-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator (Stitch) */}
                    <div className="mt-2.5 pt-1 space-y-1.5" id="password-strength-box">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {password.length === 0 ? (
                          <span>Mínimo de 8 caracteres.</span>
                        ) : isPasswordShort ? (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />A senha
                            precisa de pelo menos 8 caracteres (faltam{' '}
                            {8 - password.length})
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            Senha válida (mínimo de 8 caracteres)
                          </span>
                        )}
                        <span
                          id="strength-label"
                          className={`font-semibold ${
                            password.length === 0
                              ? 'text-slate-400 dark:text-slate-500'
                              : isPasswordShort
                                ? 'text-amber-600 dark:text-amber-400'
                                : password.length >= 10
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {password.length === 0
                            ? ''
                            : isPasswordShort
                              ? 'Fraca'
                              : password.length >= 10
                                ? 'Forte'
                                : 'Razoável'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5" aria-hidden="true">
                        <div
                          id="bar-1"
                          className={`rounded-full transition-colors ${
                            password.length === 0
                              ? 'bg-slate-200 dark:bg-slate-700'
                              : isPasswordShort
                                ? 'bg-amber-500'
                                : 'bg-blue-600 dark:bg-blue-500'
                          }`}
                        />
                        <div
                          id="bar-2"
                          className={`rounded-full transition-colors ${
                            password.length >= 8
                              ? password.length >= 10
                                ? 'bg-emerald-500'
                                : 'bg-blue-600 dark:bg-blue-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                        <div
                          id="bar-3"
                          className={`rounded-full transition-colors ${
                            password.length >= 9
                              ? password.length >= 10
                                ? 'bg-emerald-500'
                                : 'bg-blue-600 dark:bg-blue-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                        <div
                          id="bar-4"
                          className={`rounded-full transition-colors ${
                            password.length >= 10
                              ? 'bg-emerald-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botão Submissão Cadastro com min-h-[44px] */}
                  <button
                    type="submit"
                    id="btn-submit"
                    disabled={
                      submitting || password.length < 8 || !name.trim() || !email.trim()
                    }
                    className="w-full min-h-[44px] mt-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Criando sua conta...</span>
                      </>
                    ) : (
                      <>
                        <span>Criar Conta e Começar</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Form: Entrar */}
              {tab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* E-mail */}
                  <div>
                    <label
                      htmlFor="signin-email"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Seu e-mail
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@universidade.edu.br"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-base sm:text-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="signin-password"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email)
                          setIsForgotPassword(true)
                          setForgotSuccess(false)
                          setErrorMessage(null)
                        }}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-12 py-2.5 text-base sm:text-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        className="absolute inset-y-0 right-0 px-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Botão Submissão Login com min-h-[44px] */}
                  <button
                    type="submit"
                    id="btn-submit"
                    disabled={submitting || !email.trim() || !password}
                    className="w-full min-h-[44px] mt-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Entrando...</span>
                      </>
                    ) : (
                      <>
                        <span>Entrar na Conta</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Divisor Elegante com badge Stitch */}
              <div className="relative my-7 text-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative px-3.5 py-1 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider rounded-full border border-slate-200 dark:border-slate-800">
                  ou continue sem conta
                </span>
              </div>

              {/* Card de Armazenamento Local / Modo Visitante (Stitch) */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <CloudOff className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>O que é Armazenamento Local?</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                        Aviso
                      </span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Seus dados (tarefas, notas e rotinas) ficam gravados exclusivamente
                      na memória deste navegador (
                      <code className="text-amber-600 dark:text-amber-400">
                        localStorage
                      </code>
                      ).
                    </p>
                  </div>
                </div>

                {/* Pontos de Atenção Minimalistas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 flex items-start gap-2">
                    <UserX className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        Sem sincronização:
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Não acessível em outro celular ou PC.
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 flex items-start gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        Risco de perda:
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Limpar cache ou trocar guia anônima apaga tudo.
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        Sem recuperação:
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Não há backup automático dos dados.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Consentimento e Botão com min-h-[44px] */}
                <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAgreedGuest}
                      onChange={(e) => setIsAgreedGuest(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 mt-0.5 cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-snug">
                      Estou ciente de que meus dados ficarão salvos apenas neste navegador
                      e podem ser perdidos se o cache for limpo.
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleContinueAsGuest}
                    disabled={!isAgreedGuest}
                    className="w-full min-h-[44px] py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Continuar sem Conta</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
