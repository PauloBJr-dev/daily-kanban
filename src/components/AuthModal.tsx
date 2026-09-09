import React, { useState, useEffect, useCallback } from 'react'
import {
  X,
  Cat,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldAlert,
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
    continueAsGuest,
  } = useAuth()
  const toast = useToast()

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAuthModalOpen
  const onClose = propOnClose || closeAuthModal

  const [tab, setTab] = useState<'signup' | 'signin'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isAgreedGuest, setIsAgreedGuest] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fechar com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleTabChange = (newTab: 'signup' | 'signin') => {
    setTab(newTab)
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
          toast.success('Conta criada com sucesso! Bem-vindo(a) ao OrganoCat.')
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

  const handleContinueAsGuest = useCallback(() => {
    if (!isAgreedGuest) return
    continueAsGuest()
    onClose()
    toast.info('Você está utilizando o OrganoCat no modo Armazenamento Local.')
  }, [isAgreedGuest, continueAsGuest, onClose, toast])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 border-t sm:border border-slate-200/90 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-none shrink-0">
              <Cat className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="auth-modal-title"
                className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5"
              >
                OrganoCat
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Organize seu dia com clareza, foco e alta produtividade
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'signup'}
              onClick={() => handleTabChange('signup')}
              className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer ${
                tab === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-900/5 dark:ring-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Criar Conta
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'signin'}
              onClick={() => handleTabChange('signin')}
              className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer ${
                tab === 'signin'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-900/5 dark:ring-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Entrar
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form: Criar Conta */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Nome */}
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Seu Nome ou Apelido
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
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
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Seu e-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Sem necessidade de verificação prévia de e-mail.
                </p>
              </div>

              {/* Senha com validação em tempo real */}
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo de 8 caracteres"
                    required
                    minLength={8}
                    className={`w-full pl-9 pr-10 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      isPasswordShort
                        ? 'border-amber-400 dark:border-amber-500 focus:ring-amber-500/40'
                        : isPasswordValid
                          ? 'border-emerald-400 dark:border-emerald-500 focus:ring-emerald-500/40'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/50 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Validação visual em tempo real */}
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  {isPasswordShort ? (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />A senha precisa de pelo
                      menos 8 caracteres (faltam {8 - password.length})
                    </span>
                  ) : isPasswordValid ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Senha válida (mínimo de 8 caracteres)
                    </span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">
                      Mínimo de 8 caracteres.
                    </span>
                  )}
                </div>
              </div>

              {/* Botão Submissão Cadastro */}
              <button
                type="submit"
                disabled={
                  submitting || password.length < 8 || !name.trim() || !email.trim()
                }
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 dark:shadow-none hover:shadow transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Seu e-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="signin-password"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão Submissão Login */}
              <button
                type="submit"
                disabled={submitting || !email.trim() || !password}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 dark:shadow-none hover:shadow transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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

          {/* Linha Divisória Suave */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-medium">
                ou continue sem conta
              </span>
            </div>
          </div>

          {/* Bloco Didático: O que é Armazenamento Local? */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <h3 className="text-xs font-semibold tracking-tight">
                O que é Armazenamento Local?
              </h3>
            </div>

            <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
              Seus dados (tarefas, notas e rotinas) ficam gravados exclusivamente na
              memória deste navegador no seu aparelho atual, sem serem enviados para a
              nuvem.
            </p>

            <div className="space-y-1.5 pt-1 text-[11px] text-amber-900/80 dark:text-amber-300/80">
              <div className="flex items-start gap-1.5">
                <span className="shrink-0">⚠️</span>
                <span>
                  <strong>Sem sincronização:</strong> suas tarefas não aparecerão em
                  outros aparelhos (celular/computador).
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="shrink-0">⚠️</span>
                <span>
                  <strong>Risco de perda:</strong> se você limpar o histórico do
                  navegador, cookies ou usar janela anônima, seus dados podem ser
                  apagados.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="shrink-0">⚠️</span>
                <span>
                  <strong>Sem recuperação:</strong> se o aparelho for formatado ou
                  trocado, não é possível recuperar seus dados.
                </span>
              </div>
            </div>

            {/* Checkbox de consentimento */}
            <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
              <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  id="guest-consent-checkbox"
                  checked={isAgreedGuest}
                  onChange={(e) => setIsAgreedGuest(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-amber-300 text-indigo-600 focus:ring-indigo-500 shrink-0 cursor-pointer"
                />
                <span className="text-[11px] font-medium text-amber-950 dark:text-amber-200 group-hover:text-amber-900 dark:group-hover:text-amber-100 transition-colors leading-tight">
                  Estou ciente de que meus dados ficarão salvos apenas neste navegador e
                  podem ser perdidos se o histórico for apagado.
                </span>
              </label>
            </div>

            {/* Botão Continuar sem Conta */}
            <button
              type="button"
              onClick={handleContinueAsGuest}
              disabled={!isAgreedGuest || submitting}
              className="w-full py-2 px-3 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Continuar sem Conta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
