export type StudyStatus = 'to_review' | 'in_progress' | 'mastered'

export interface Subject {
  id: string
  name: string
  color: string // Hex or Tailwind color name (e.g. 'emerald', 'indigo', 'purple', 'amber', 'rose', 'sky')
  icon?: string
  code?: string
}

export interface AcademicNote {
  id: string
  title: string
  content: string
  subjectId: string
  status: StudyStatus
  tags: string[]
  isPinned: boolean
  examDate?: string // YYYY-MM-DD
  reviewDate?: string // YYYY-MM-DD
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

export interface AcademicData {
  subjects: Subject[]
  notes: AcademicNote[]
  version: number
}

export interface AcademicFilterState {
  searchQuery: string
  subjectId: string | 'all'
  status: 'all' | StudyStatus
  tag: string | null
  onlyPinned: boolean
}

export interface AcademicStats {
  totalNotes: number
  toReviewCount: number
  inProgressCount: number
  masteredCount: number
  subjectsCount: number
  pinnedCount: number
}
