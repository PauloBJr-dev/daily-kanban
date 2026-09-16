import React from 'react'
import type { User } from '@supabase/supabase-js'
import {
  Sparkles,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
  LogOut,
  LogIn,
  KeyRound,
} from 'lucide-react'

export interface HeroProfileCardProps {
  user: User | null
  displayName: string
  displayEmail: string
  initials: string
  avatarUrl: string | null
  onAuthAction: () => void
  onChangePassword?: () => void
}

export const HeroProfileCard: React.FC<HeroProfileCardProps> = ({
  user,
  displayName,
  displayEmail,
  initials,
  avatarUrl,
  onAuthAction,
  onChangePassword,
}) => {
  return (
    <section
      aria-label="Dados do Usuário"
      className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all"
    >
      {/* Subtle Stitch ambient glow */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Left side: Avatar & Info */}
      <div className="flex items-center gap-4 sm:gap-6 relative z-10 min-w-0">
        {/* Stitch Large Avatar */}
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Foto de perfil de ${displayName}`}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl tracking-wider shadow-md ring-4 ring-slate-100 dark:ring-slate-800">
              {user ? initials : <Sparkles className="w-8 h-8 text-blue-100" />}
            </div>
          )}

          {/* Avatar Corner Status Indicator */}
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs ${
              user ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            title={user ? 'Conta sincronizada em nuvem' : 'Modo visitante local'}
          >
            {user ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3]" />
            ) : (
              <HardDrive className="w-3 h-3 text-white" />
            )}
          </div>
        </div>

        {/* User Identity Details */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-headline truncate">
              {displayName}
            </h2>
            {user && (
              <span
                title="Conta Verificada"
                className="inline-flex items-center text-blue-600 dark:text-blue-400"
              >
                <ShieldCheck className="w-5 h-5" />
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${
                user
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  user ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {user ? 'Sincronização Nuvem Supabase' : 'Modo Visitante Local'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
            {displayEmail}
          </p>

          <p className="text-xs text-slate-400 dark:text-slate-500 pt-0.5">
            {user
              ? 'Conectado de forma segura e sincronizando em tempo real'
              : 'Seus dados permanecem salvos somente no armazenamento deste navegador'}
          </p>
        </div>
      </div>

      {/* Right side: Account Actions */}
      <div className="flex items-center gap-2.5 shrink-0 relative z-10 w-full sm:w-auto justify-start sm:justify-end">
        {user ? (
          <>
            {onChangePassword && (
              <button
                type="button"
                onClick={onChangePassword}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold border border-slate-200/80 dark:border-slate-700 transition-colors shadow-xs cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-hidden"
              >
                <KeyRound className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Alterar Senha</span>
              </button>
            )}
            <button
              type="button"
              onClick={onAuthAction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shadow-xs cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onAuthAction}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-hidden w-full sm:w-auto"
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar ou Criar Conta</span>
          </button>
        )}
      </div>
    </section>
  )
}
