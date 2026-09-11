import type { KanbanData } from '../types/kanban'
import { INITIAL_DATA } from './seedData'

export const storageService = {
  getStorageKey(userId?: string | null): string {
    return userId ? `organocat_kanban_user_${userId}` : 'organocat_kanban_guest'
  },

  load(userId?: string | null): KanbanData {
    const key = this.getStorageKey(userId)
    try {
      const raw = localStorage.getItem(key)
      if (!raw) {
        const legacyRaw = localStorage.getItem('dailyflow_kanban_data_v1')
        if (legacyRaw) {
          try {
            const parsedLegacy = JSON.parse(legacyRaw)
            if (this.validateJSON(parsedLegacy)) {
              localStorage.setItem(key, legacyRaw)
              localStorage.removeItem('dailyflow_kanban_data_v1')
              return parsedLegacy
            }
          } catch {
            // Ignorar erro ao processar chave legada corrompida
          }
        }
        return INITIAL_DATA
      }
      const parsed = JSON.parse(raw)
      if (!parsed.columns || !Array.isArray(parsed.tasks)) {
        return INITIAL_DATA
      }
      return parsed as KanbanData
    } catch (err) {
      console.warn('Falha ao ler localStorage, utilizando dados padr?o.', err)
      return INITIAL_DATA
    }
  },

  migrateGuestData(userId: string): KanbanData | null {
    if (!userId) return null

    const userData = this.load(userId)
    if (userData.tasks.length > 0) {
      return null
    }

    const guestRaw = localStorage.getItem('organocat_kanban_guest')
    if (!guestRaw) return null

    try {
      const guestData = JSON.parse(guestRaw)
      if (!this.validateJSON(guestData)) return null

      if (guestData.tasks && guestData.tasks.length > 0) {
        this.save(guestData, userId)
        return guestData
      }
    } catch {
      return null
    }

    return null
  },

  save(data: KanbanData, userId?: string | null): void {
    const key = this.getStorageKey(userId)
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (err) {
      console.error('Falha ao salvar dados no localStorage', err)
    }
  },

  exportJSON(data: KanbanData): void {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `dailyflow-kanban-backup-${dateStr}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  validateJSON(content: unknown): content is KanbanData {
    if (typeof content !== 'object' || content === null) return false
    const obj = content as Record<string, unknown>
    if (!Array.isArray(obj.columns) || !Array.isArray(obj.tasks)) return false
    return true
  },

  clear(userId?: string | null): void {
    const key = this.getStorageKey(userId)
    localStorage.removeItem(key)
  },
}
