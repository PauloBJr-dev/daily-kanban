import React, { useMemo, useState } from 'react'
import { Download, ChevronRight } from 'lucide-react'
import type { Task } from '../../types/kanban'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { academicStorageService } from '../../services/academicStorageService'
import { storageService } from '../../services/storageService'
import { HeroProfileCard } from './HeroProfileCard'
import { ProfileStatsGrid } from './ProfileStatsGrid'
import { StoragePrivacySection } from './StoragePrivacySection'
import { PasswordResetModal } from './PasswordResetModal'
import { ConfirmDialog } from '../ConfirmDialog'

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
  const toast = useToast()

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isClearCacheModalOpen, setIsClearCacheModalOpen] = useState(false)

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

  // Full backup exporter
  const handleExportBackup = () => {
    try {
      const kanbanData = storageService.load(user?.id ?? null)
      const academicData = academicStorageService.load(user?.id ?? null)
      const fullBackup = {
        app: 'DailyFlow (OrganoCat)',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        user: user ? { id: user.id, email: user.email } : { mode: 'guest' },
        kanban: kanbanData,
        academic: academicData,
      }

      const jsonString = JSON.stringify(fullBackup, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const dateStr = new Date().toISOString().split('T')[0]
      link.href = url
      link.download = `dailyflow-backup-completo-${dateStr}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Backup JSON completo exportado com sucesso!')
    } catch (err) {
      console.error('Erro ao exportar backup:', err)
      toast.error('Falha ao gerar arquivo de backup.')
    }
  }

  const handleClearCacheConfirm = () => {
    try {
      // Clear non-critical caches & session preferences
      localStorage.removeItem('organocat_pomodoro_session')
      localStorage.removeItem('dailyflow_active_tab')
      toast.success('Cache local e preferências temporárias limpos com sucesso!')
      setIsClearCacheModalOpen(false)
    } catch {
      toast.error('Erro ao limpar cache local.')
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* 1. Header da Página & Barra Superior (Stitch Design) */}
      <header className="space-y-4">
        {/* Stitch Breadcrumbs */}
        <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 gap-1.5 select-none">
          <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            DailyFlow
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            Conta & Perfil
          </span>
        </div>

        {/* Action Toolbar & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Perfil & Sincronização
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gerencie seu perfil de usuário, status de conexão em nuvem e histórico
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Live Sync Pill Badge (Stitch Header Spec) */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                user
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  user ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{user ? 'Sincronização Ativa' : 'Sincronização Local'}</span>
            </div>

            {/* Quick Secondary Action: Baixar Backup */}
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors shadow-xs cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-hidden"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Baixar Backup</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Profile Card */}
      <HeroProfileCard
        user={user}
        displayName={displayName}
        displayEmail={displayEmail}
        initials={initials}
        avatarUrl={avatarUrl}
        onAuthAction={handleAuthAction}
        onChangePassword={() => setIsPasswordModalOpen(true)}
      />

      {/* 3. Resumo de Produtividade Real (4 Bento Cards) */}
      <ProfileStatsGrid
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        notesCount={notesCount}
        pomodoroFormatted={pomodoroFormatted}
      />

      {/* 4. Armazenamento & Privacidade de Dados */}
      <StoragePrivacySection
        userId={user?.id}
        totalTasks={totalTasks}
        notesCount={notesCount}
        isConfigured={isConfigured}
        onExportBackup={handleExportBackup}
        onClearCache={() => setIsClearCacheModalOpen(true)}
      />

      {/* Password Reset Modal */}
      {user?.email && (
        <PasswordResetModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          userEmail={user.email}
        />
      )}

      {/* Clear Cache Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearCacheModalOpen}
        title="Limpar Cache Local"
        message="Deseja limpar os arquivos temporários e sessões salvas em cache? Suas tarefas do Kanban e anotações essenciais serão mantidas com segurança."
        confirmText="Limpar Cache"
        cancelText="Cancelar"
        isDanger={false}
        onConfirm={handleClearCacheConfirm}
        onClose={() => setIsClearCacheModalOpen(false)}
      />
    </div>
  )
}
