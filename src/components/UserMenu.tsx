import React, { useState, useRef, useEffect, useCallback } from 'react'
import { CloudCheck, LogOut, ChevronDown, Loader2, User as UserIcon } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export const UserMenu: React.FC = () => {
  const { user, loading, openAuthModal, signOut } = useAuth()
  const toast = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Fechar dropdown ao pressionar Escape ou clicar fora
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSignOut = useCallback(async () => {
    setActionLoading(true)
    setIsOpen(false)
    try {
      const { error } = await signOut()
      if (error) {
        toast.error(`Erro ao sair: ${error.message}`)
      } else {
        toast.info('Você saiu da sua conta')
      }
    } finally {
      setActionLoading(false)
    }
  }, [signOut, toast])

  // Extração de dados do usuário
  const displayName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email?.split('@')[0] ||
    'Usuário'

  const email = user?.email || ''
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string) ||
    (user?.user_metadata?.picture as string) ||
    null

  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase()
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const initials = getInitials(displayName)
  const firstName = displayName.split(' ')[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-w-[36px] min-h-[36px] sm:min-w-[38px] sm:min-h-[38px]">
        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
      </div>
    )
  }

  // CASO NÃO LOGADO
  if (!user) {
    return (
      <button
        type="button"
        onClick={openAuthModal}
        title="Entrar ou criar conta"
        aria-label="Entrar ou criar conta"
        className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[38px] border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-medium shadow-xs hover:shadow transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 shrink-0"
      >
        <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span className="font-medium">Entrar / Criar Conta</span>
      </button>
    )
  }

  // CASO LOGADO
  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menu do usuário"
        className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 min-h-[36px] sm:min-h-[38px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/70 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center shadow-xs shrink-0">
            {initials}
          </div>
        )}
        <span className="hidden sm:inline-block text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
          {firstName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="menu"
          aria-label="Opções de usuário"
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/40 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Informações do usuário */}
          <div className="px-2.5 py-2 flex items-center gap-2.5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {email}
              </p>
            </div>
          </div>

          {/* Divisor */}
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

          {/* Indicador de status de sincronização */}
          <div className="px-2.5 py-1.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <CloudCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="font-medium text-[11px]">Sincronização Ativa</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Nuvem
            </span>
          </div>

          {/* Divisor */}
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

          {/* Botão de Logout */}
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={actionLoading}
            className="w-full px-2.5 py-2 text-left text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sair da conta</span>
          </button>
        </div>
      )}
    </div>
  )
}
