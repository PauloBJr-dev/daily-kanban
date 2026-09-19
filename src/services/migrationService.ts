import { storageService } from './storageService'
import { academicStorageService } from './academicStorageService'
import { supabaseKanbanService } from './supabaseKanbanService'
import { supabaseAcademicService } from './supabaseAcademicService'
import { isSupabaseConfigured } from '../lib/supabase'

export type MigrationStepId =
  | 'backup'
  | 'kanban_local'
  | 'kanban_cloud'
  | 'academic_local'
  | 'academic_cloud'
  | 'validation'

export type MigrationStepStatus = 'pending' | 'running' | 'completed' | 'error'

export interface MigrationStepState {
  id: MigrationStepId
  title: string
  description: string
  status: MigrationStepStatus
  error?: string
}

export interface MigrationResult {
  success: boolean
  error?: string
  failedStepId?: MigrationStepId
}

export const INITIAL_MIGRATION_STEPS: MigrationStepState[] = [
  {
    id: 'backup',
    title: 'Cópia de Segurança Local',
    description: 'Verificando e preservando a cópia de segurança dos dados locais',
    status: 'pending',
  },
  {
    id: 'kanban_local',
    title: 'Migração do Kanban',
    description: 'Transferindo colunas e tarefas locais para sua conta',
    status: 'pending',
  },
  {
    id: 'kanban_cloud',
    title: 'Sincronização do Quadro na Nuvem',
    description: 'Sincronizando tarefas e colunas com a nuvem do Supabase',
    status: 'pending',
  },
  {
    id: 'academic_local',
    title: 'Migração Acadêmica',
    description: 'Transferindo matérias e anotações locais para sua conta',
    status: 'pending',
  },
  {
    id: 'academic_cloud',
    title: 'Sincronização Acadêmica na Nuvem',
    description: 'Sincronizando matérias e anotações com a nuvem do Supabase',
    status: 'pending',
  },
  {
    id: 'validation',
    title: 'Validação de Integridade',
    description: 'Garantindo consistência total e liberando acesso ao dashboard',
    status: 'pending',
  },
]

export const migrationService = {
  hasGuestDataToMigrate(): boolean {
    if (typeof window === 'undefined') return false

    const guestKanbanRaw =
      localStorage.getItem('organy_kanban_guest') ??
      localStorage.getItem('dailyflow_kanban_guest') ??
      localStorage.getItem('organocat_kanban_guest')
    const guestAcademicRaw =
      localStorage.getItem('organy_academic_guest') ??
      localStorage.getItem('dailyflow_academic_guest') ??
      localStorage.getItem('organocat_academic_guest')

    if (guestKanbanRaw) {
      try {
        const parsed = JSON.parse(guestKanbanRaw)
        if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) return true
      } catch {
        // Ignora erro de JSON corrompido
      }
    }

    if (guestAcademicRaw) {
      try {
        const parsed = JSON.parse(guestAcademicRaw)
        if (
          (Array.isArray(parsed.notes) && parsed.notes.length > 0) ||
          (Array.isArray(parsed.subjects) && parsed.subjects.length > 0)
        ) {
          return true
        }
      } catch {
        // Ignora erro de JSON corrompido
      }
    }

    return false
  },

  downloadBackup(): void {
    if (typeof window === 'undefined') return

    const kanban = storageService.load(null)
    const academic = academicStorageService.load(null)

    const backupData = {
      appName: 'Organy',
      version: 1,
      exportedAt: new Date().toISOString(),
      backupType: 'contingency_guest_migration',
      kanban,
      academic,
    }

    const jsonString = JSON.stringify(backupData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `organy-backup-contingencia-${dateStr}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  async executeMigration(
    userId: string,
    onStepChange?: (steps: MigrationStepState[]) => void,
    existingSteps?: MigrationStepState[]
  ): Promise<MigrationResult> {
    if (!userId) {
      return { success: false, error: 'Usuário não identificado para migração.' }
    }

    // Clone steps from existingSteps or INITIAL_MIGRATION_STEPS
    const currentSteps: MigrationStepState[] = existingSteps
      ? existingSteps.map((s) => ({ ...s }))
      : INITIAL_MIGRATION_STEPS.map((s) => ({ ...s, status: 'pending' as const }))

    const updateStep = (
      id: MigrationStepId,
      status: MigrationStepStatus,
      error?: string
    ) => {
      const idx = currentSteps.findIndex((s) => s.id === id)
      if (idx !== -1) {
        currentSteps[idx] = {
          ...currentSteps[idx],
          status,
          error,
        }
        onStepChange?.([...currentSteps])
      }
    }

    onStepChange?.([...currentSteps])

    // ETAPA 1: Verificação e preservação da cópia de segurança local
    if (currentSteps.find((s) => s.id === 'backup')?.status !== 'completed') {
      updateStep('backup', 'running')
      try {
        const guestKanban = storageService.load(null)
        const guestAcademic = academicStorageService.load(null)

        if (typeof window !== 'undefined') {
          const snapshot = {
            userId,
            createdAt: new Date().toISOString(),
            kanban: guestKanban,
            academic: guestAcademic,
          }
          localStorage.setItem(
            `organy_migration_backup_${userId}`,
            JSON.stringify(snapshot)
          )
        }
        updateStep('backup', 'completed')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Falha ao criar snapshot local'
        updateStep('backup', 'error', msg)
        return { success: false, error: msg, failedStepId: 'backup' }
      }
    }

    // ETAPA 2: Migração das colunas e tarefas do Kanban
    if (currentSteps.find((s) => s.id === 'kanban_local')?.status !== 'completed') {
      updateStep('kanban_local', 'running')
      try {
        storageService.migrateGuestData(userId)
        updateStep('kanban_local', 'completed')
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Falha ao migrar dados locais do Kanban'
        updateStep('kanban_local', 'error', msg)
        return { success: false, error: msg, failedStepId: 'kanban_local' }
      }
    }

    // ETAPA 3: Sincronização do Kanban com o banco em nuvem do Supabase
    if (currentSteps.find((s) => s.id === 'kanban_cloud')?.status !== 'completed') {
      updateStep('kanban_cloud', 'running')
      try {
        if (isSupabaseConfigured()) {
          const kanbanData = storageService.load(userId)
          if (kanbanData.columns.length > 0 || kanbanData.tasks.length > 0) {
            await supabaseKanbanService.uploadLocalData(
              userId,
              kanbanData.columns,
              kanbanData.tasks
            )
          }
        }
        updateStep('kanban_cloud', 'completed')
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Houve uma instabilidade na conexão ao sincronizar suas tarefas.'
        updateStep('kanban_cloud', 'error', msg)
        return { success: false, error: msg, failedStepId: 'kanban_cloud' }
      }
    }

    // ETAPA 4: Migração das matérias e anotações acadêmicas
    if (currentSteps.find((s) => s.id === 'academic_local')?.status !== 'completed') {
      updateStep('academic_local', 'running')
      try {
        academicStorageService.migrateGuestData(userId)
        updateStep('academic_local', 'completed')
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Falha ao migrar anotações locais'
        updateStep('academic_local', 'error', msg)
        return { success: false, error: msg, failedStepId: 'academic_local' }
      }
    }

    // ETAPA 5: Sincronização acadêmica com o banco em nuvem do Supabase
    if (currentSteps.find((s) => s.id === 'academic_cloud')?.status !== 'completed') {
      updateStep('academic_cloud', 'running')
      try {
        if (isSupabaseConfigured()) {
          const academicData = academicStorageService.load(userId)
          if (academicData.subjects.length > 0 || academicData.notes.length > 0) {
            await supabaseAcademicService.uploadLocalData(userId, academicData)
          }
        }
        updateStep('academic_cloud', 'completed')
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Houve uma instabilidade na conexão ao sincronizar suas anotações.'
        updateStep('academic_cloud', 'error', msg)
        return { success: false, error: msg, failedStepId: 'academic_cloud' }
      }
    }

    // ETAPA 6: Validação final de integridade e liberação do acesso ao dashboard
    if (currentSteps.find((s) => s.id === 'validation')?.status !== 'completed') {
      updateStep('validation', 'running')
      try {
        const finalKanban = storageService.load(userId)
        const finalAcademic = academicStorageService.load(userId)

        if (
          !storageService.validateJSON(finalKanban) ||
          !academicStorageService.validateJSON(finalAcademic)
        ) {
          throw new Error('Falha na validação de integridade dos dados migrados.')
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem(`organy_migration_completed_${userId}`, 'true')
        }

        updateStep('validation', 'completed')
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Falha na validação final dos dados'
        updateStep('validation', 'error', msg)
        return { success: false, error: msg, failedStepId: 'validation' }
      }
    }

    return { success: true }
  },
}
