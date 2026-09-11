import React, { useMemo } from 'react'
import {
  User as UserIcon,
  LogOut,
  LogIn,
  ShieldCheck,
  Cloud,
  HardDrive,
  CheckCircle2,
  BookOpen,
  Flame,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react'
import type { Task } from '../../types/kanban'
import { useAuth } from '../../hooks/useAuth'
import { academicStorageService } from '../../services/academicStorageService'

export interface ProfileViewProps {
  tasks: Task[]
  academicNotesCount?: number
  onOpenAuthModal?: () => void
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  tasks,
  academicNotesCount: propNotesCount,
  onOpenAuthModal,
}) => {
  const { user, signOut, openAuthModal, isConfigured } = useAuth()

  // Get notes count from prop or local storage fallback
  const notesCount = useMemo(() => {
    if (propNotesCount !== undefined) return propNotesCount
    try {
      const data = academicStorageService.load(user?.id ?? null)
      return data.notes.length
    } catch {
      return 0
    }
  }, [propNotesCount, user])

  // Productivity summary calculations
  const totalTasks = tasks.length
  const completedTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.columnId === 'col-done' || (t.columnId && t.columnId.includes('done'))
    ).length
  }, [tasks])

  const totalPomodoroMinutes = useMemo(() => {
    return tasks.reduce((acc, t) => acc + (t.pomodoroMinutesSpent || 0), 0)
  }, [tasks])

  const pomodoroFormatted = useMemo(() => {
    const hours = Math.floor(totalPomodoroMinutes / 60)
    const mins = totalPomodoroMinutes % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins} min`
  }, [totalPomodoroMinutes])

  // User display metadata
  const displayName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email?.split('@')[0] ||
    'Visitante OrganoCat'

  const displayEmail = user?.email || 'Navegador Local (Sem vínculo com conta)'

  const initials = useMemo(() => {
    if (!displayName) return 'OC'
    const parts = displayName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }, [displayName])

  const avatarUrl = (user?.user_metadata?.avatar_url as string) || null

  const handleAuthAction = () => {
    if (user) {
      void signOut()
    } else {
      if (onOpenAuthModal) {
        onOpenAuthModal()
      } else {
        openAuthModal('signin')
      }
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Perfil & Sincronização
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gerencie seu perfil de usuário, status de conexão em nuvem e histórico
        </p>
      </div>

      {/* Main Profile Card */}
      <section
        aria-label="Dados do Usuário"
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Big Avatar */}
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`Foto de perfil de ${displayName}`}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
              />
            ) : (
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-2xl tracking-wider shadow-md">
                {user ? initials : <Sparkles className="w-8 h-8 text-indigo-100" />}
              </div>
            )}
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs ${
                user ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            >
              {user ? (
                <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />
              ) : (
                <HardDrive className="w-2.5 h-2.5 text-white" />
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {displayName}
              </h3>
              {/* Sync Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  user
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
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

            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {displayEmail}
            </p>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
              {user
                ? 'Conectado de forma segura e sincronizando em tempo real'
                : 'Seus dados permanecem salvos somente no armazenamento deste navegador'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAuthAction}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
            user
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'
          }`}
        >
          {user ? (
            <>
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Entrar ou Criar Conta</span>
            </>
          )}
        </button>
      </section>

      {/* Account Productivity Summary */}
      <section aria-labelledby="profile-stats-title" className="space-y-3">
        <h3
          id="profile-stats-title"
          className="text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          Resumo de Produtividade da Conta
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Tasks */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total de Tarefas</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {totalTasks}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Tarefas Concluídas</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {completedTasks}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Academic Notes */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Anotações Acadêmicas</span>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {notesCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          {/* Focus Time */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Tempo de Foco</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {pomodoroFormatted}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* Privacy, Storage & Security Notice Card */}
      <section
        aria-labelledby="profile-security-title"
        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3
            id="profile-security-title"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            Privacidade, Armazenamento & Segurança
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <HardDrive className="w-4 h-4 text-amber-500" />
              <span>Armazenamento Local Seguro</span>
            </div>
            <p className="leading-relaxed">
              No modo visitante, nenhum dado sai do seu computador. Todo o conteúdo do
              Kanban, notas e configurações fica gravado no armazenamento restrito do seu
              próprio navegador.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <Cloud className="w-4 h-4 text-indigo-500" />
              <span>Sincronização em Nuvem Supabase</span>
            </div>
            <p className="leading-relaxed">
              Ao criar ou entrar com sua conta, as tabelas são protegidas por políticas
              RLS (Row Level Security). Cada usuário só possui autorização para ler e
              gravar seus próprios registros.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Criptografia ponta a ponta e zero cookies de rastreamento</span>
          </div>
          <span>
            Status Supabase: {isConfigured ? 'Disponível' : 'Modo Offline/Local'}
          </span>
        </div>
      </section>
    </div>
  )
}
