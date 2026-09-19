import type { AcademicData } from '../types/academic'
import { INITIAL_ACADEMIC_DATA } from './academicSeedData'

export const academicStorageService = {
  getStorageKey(userId?: string | null): string {
    return userId ? `organy_academic_user_${userId}` : 'organy_academic_guest'
  },

  load(userId?: string | null): AcademicData {
    const key = this.getStorageKey(userId)
    try {
      let raw = localStorage.getItem(key)
      if (!raw) {
        const dfKey = userId
          ? `dailyflow_academic_user_${userId}`
          : 'dailyflow_academic_guest'
        const ocKey = userId
          ? `organocat_academic_user_${userId}`
          : 'organocat_academic_guest'
        raw = localStorage.getItem(dfKey) ?? localStorage.getItem(ocKey)
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            if (this.validateJSON(parsed)) {
              localStorage.setItem(key, raw)
              return parsed
            }
          } catch {
            // Ignora falha de parse
          }
        }
      }
      if (!raw) {
        return INITIAL_ACADEMIC_DATA
      }
      const parsed = JSON.parse(raw)
      if (
        !parsed.subjects ||
        !Array.isArray(parsed.subjects) ||
        !Array.isArray(parsed.notes)
      ) {
        return INITIAL_ACADEMIC_DATA
      }
      return parsed as AcademicData
    } catch (err) {
      console.warn('Falha ao ler localStorage acadêmico, utilizando dados padrão.', err)
      return INITIAL_ACADEMIC_DATA
    }
  },

  migrateGuestData(userId: string): AcademicData | null {
    if (!userId) return null

    const userData = this.load(userId)
    if (userData.notes.length > 0) {
      return null
    }

    const guestRaw =
      localStorage.getItem('organy_academic_guest') ??
      localStorage.getItem('dailyflow_academic_guest') ??
      localStorage.getItem('organocat_academic_guest')
    if (!guestRaw) return null

    try {
      const guestData = JSON.parse(guestRaw)
      if (!this.validateJSON(guestData)) return null

      if (
        (guestData.notes && guestData.notes.length > 0) ||
        (guestData.subjects && guestData.subjects.length > 0)
      ) {
        this.save(guestData, userId)
        return guestData
      }
    } catch {
      return null
    }

    return null
  },

  save(data: AcademicData, userId?: string | null): void {
    const key = this.getStorageKey(userId)
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (err) {
      console.error('Falha ao salvar dados acadêmicos no localStorage', err)
    }
  },

  exportJSON(data: AcademicData): void {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `dailyflow-academic-backup-${dateStr}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  validateJSON(content: unknown): content is AcademicData {
    if (typeof content !== 'object' || content === null) return false
    const obj = content as Record<string, unknown>
    if (!Array.isArray(obj.subjects) || !Array.isArray(obj.notes)) return false
    return true
  },

  clear(userId?: string | null): void {
    const key = this.getStorageKey(userId)
    localStorage.removeItem(key)
  },
}
