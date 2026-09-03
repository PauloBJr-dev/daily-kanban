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
}

export interface Column {
  id: string
  title: string
  order: number
  colorTheme: 'blue' | 'amber' | 'purple' | 'emerald' | 'rose' | 'slate'
}

export interface KanbanData {
  columns: Column[]
  tasks: Task[]
  version: number
}

export type FilterPriority = 'all' | Priority
export type FilterScope = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed'

export interface FilterState {
  searchQuery: string
  priority: FilterPriority
  tag: string | null
  scope: FilterScope
}

export interface PomodoroSession {
  taskId: string | null
  taskTitle?: string
  timeLeft: number // in seconds
  isRunning: boolean
  mode: 'work' | 'break'
  workDuration: number // in seconds (default 25 * 60)
  breakDuration: number // in seconds (default 5 * 60)
  isSoundEnabled?: boolean
}
