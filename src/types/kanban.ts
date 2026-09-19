export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  columnId: string
  priority: Priority
  tags: string[]
  dueDate?: string // YYYY-MM-DD
  subtasks: Subtask[]
  completedAt?: string // ISO string
  createdAt: string // ISO string
  updatedAt: string // ISO string
  pomodoroMinutesSpent?: number
  timeTracked?: {
    inProgressSeconds?: number
    inReviewSeconds?: number
    currentTimerStartedAt?: string | null
    currentTimerColumnId?: string | null
  }
}

export const DEFAULT_COLUMN_IDS = [
  'col-todo',
  'col-progress',
  'col-review',
  'col-done',
] as const

export type DefaultColumnId = (typeof DEFAULT_COLUMN_IDS)[number]

export type DeleteColumnAction = 'delete_tasks' | 'move_to_todo'

export function generateSecurityCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export interface Column {
  id: string
  title: string
  order: number
  colorTheme: 'blue' | 'amber' | 'purple' | 'emerald' | 'rose' | 'slate'
  isPermanent?: boolean
}

export interface KanbanData {
  columns: Column[]
  tasks: Task[]
  version: number
}

export type FilterPriority = 'all' | Priority
export type FilterScope = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed'
export type WeekScope = 'this_week' | 'last_week' | 'all'

export interface FilterState {
  searchQuery: string
  priority: FilterPriority
  tag?: string | null
  scope: FilterScope
  weekScope: WeekScope
}

export type CatPurrType = 'none' | 'soft' | 'deep' | 'rhythmic'

export interface PomodoroSession {
  taskId: string | null
  taskTitle?: string
  timeLeft: number // in seconds
  isRunning: boolean
  mode: 'work' | 'break'
  workDuration: number // in seconds (default 25 * 60)
  breakDuration: number // in seconds (default 5 * 60)
  isSoundEnabled?: boolean
  catPurrType?: CatPurrType
  catPurrVolume?: number // 0 to 1 (default 0.6)
}
