import type { AcademicData } from '../types/academic'
import { INITIAL_ACADEMIC_DATA } from './academicSeedData'

const STORAGE_KEY = 'dailyflow_academic_data_v1'

export const academicStorageService = {
  load(): AcademicData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
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

  save(data: AcademicData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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

  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}
