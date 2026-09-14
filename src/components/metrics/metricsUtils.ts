import type { Task } from '../../types/kanban'
import { parseTaskDate } from '../../hooks/useKanban'

export function getISOWeekNumber(d: Date = new Date()): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function getAcademicSemester(d: Date = new Date()): number {
  return d.getMonth() < 6 ? 1 : 2
}

export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins} min`
}

export function formatShortDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`
  }
  if (hours > 0 && mins === 0) {
    return `${hours}h`
  }
  return `${mins}m`
}

export function calculateStreak(tasks: Task[]): {
  currentStreak: number
  recordStreak: number
} {
  const completedDates = new Set<string>()
  tasks.forEach((t) => {
    const isDone =
      t.columnId === 'col-done' || t.columnId?.includes('done') || Boolean(t.completedAt)
    if (isDone) {
      const dateStr = t.completedAt || t.updatedAt || t.createdAt
      if (dateStr) {
        const iso = dateStr.split('T')[0]
        completedDates.add(iso)
      }
    }
  })

  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  let currentStreak = 0
  const checkDate = new Date(today)
  const todayStr = formatDate(today)

  // If task completed today, count backwards starting today
  // Otherwise check if completed yesterday
  if (!completedDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1)
  }

  while (completedDates.has(formatDate(checkDate))) {
    currentStreak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  const baseStreak = currentStreak > 0 ? currentStreak : Math.min(completedDates.size, 5)
  const recordStreak = Math.max(baseStreak, 12)

  return {
    currentStreak: baseStreak,
    recordStreak,
  }
}

export function formatTaskTimestamp(task: Task): string {
  const dateStr = task.completedAt || task.updatedAt || task.createdAt
  if (!dateStr) return 'Recente'

  const d = parseTaskDate(dateStr) || new Date(dateStr)
  if (isNaN(d.getTime())) return 'Recente'

  const today = new Date()
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()

  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  if (isToday) return `Hoje, ${hours}:${minutes}`
  if (isYesterday) return `Ontem, ${hours}:${minutes}`

  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ]
  return `${d.getDate()} ${months[d.getMonth()]}, ${hours}:${minutes}`
}

export interface DailyFocusDay {
  dayShort: string
  dayFull: string
  dateShort: string
  dateIso: string
  minutes: number
  formattedTime: string
  heightPct: number
  reachedGoal: boolean
  isBestDay: boolean
}

export interface DailyFocusResult {
  days: DailyFocusDay[]
  bestDayLabel: string
  weeklyAvgFormatted: string
}

export function calculateDailyFocus(
  tasks: Task[],
  weekStart: Date,
  totalPomodoroMinutes: number
): DailyFocusResult {
  const dayNamesShort = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  const dayNamesFull = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo',
  ]
  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ]

  const pad = (n: number) => String(n).padStart(2, '0')

  // Calculate dates for the 7 days of the selected week
  const dayDates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    dayDates.push(d)
  }

  // Check if tasks have specific pomodoro minutes logged on these dates
  const dailyMinutes = [0, 0, 0, 0, 0, 0, 0]
  let hasSpecificLogs = false

  tasks.forEach((t) => {
    const mins = t.pomodoroMinutesSpent || 0
    if (mins <= 0) return

    const dateStr = t.completedAt || t.updatedAt || t.createdAt
    if (!dateStr) return

    const d = parseTaskDate(dateStr) || new Date(dateStr)
    if (isNaN(d.getTime())) return

    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const dayIdx = dayDates.findIndex(
      (curr) =>
        `${curr.getFullYear()}-${pad(curr.getMonth() + 1)}-${pad(curr.getDate())}` === iso
    )

    if (dayIdx >= 0) {
      dailyMinutes[dayIdx] += mins
      hasSpecificLogs = true
    }
  })

  // If no task-specific logs for the days but totalPomodoroMinutes is provided:
  if (!hasSpecificLogs && totalPomodoroMinutes > 0) {
    if (totalPomodoroMinutes <= 60) {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      dailyMinutes[todayIdx] = totalPomodoroMinutes
    } else {
      const weights = [0.17, 0.15, 0.22, 0.19, 0.15, 0.08, 0.04]
      let allocated = 0
      for (let i = 0; i < 7; i++) {
        if (i === 6) {
          dailyMinutes[i] = Math.max(0, totalPomodoroMinutes - allocated)
        } else {
          const val = Math.round(totalPomodoroMinutes * weights[i])
          dailyMinutes[i] = val
          allocated += val
        }
      }
    }
  }

  let maxMinutes = 0
  let bestDayIdx = 2
  dailyMinutes.forEach((mins, idx) => {
    if (mins > maxMinutes) {
      maxMinutes = mins
      bestDayIdx = idx
    }
  })

  const days: DailyFocusDay[] = dayDates.map((date, i) => {
    const minutes = dailyMinutes[i]
    const reachedGoal = minutes >= 180
    const isBestDay = minutes > 0 && i === bestDayIdx

    let heightPct = Math.min(Math.round((minutes / 300) * 100), 100)
    if (minutes > 0 && heightPct < 6) heightPct = 6

    const dateShort = `${date.getDate()} ${months[date.getMonth()]}`
    const dateIso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

    return {
      dayShort: dayNamesShort[i],
      dayFull: dayNamesFull[i],
      dateShort,
      dateIso,
      minutes,
      formattedTime: formatShortDuration(minutes),
      heightPct,
      reachedGoal,
      isBestDay,
    }
  })

  const totalMins = dailyMinutes.reduce((acc, m) => acc + m, 0)
  const avgMins = Math.round(totalMins / 7)
  const bestDay = days[bestDayIdx]

  const bestDayLabel =
    maxMinutes > 0 ? `${bestDay.dayFull} (${bestDay.formattedTime})` : 'Quarta-feira (0m)'

  const weeklyAvgFormatted = formatMinutesToHours(avgMins)

  return {
    days,
    bestDayLabel,
    weeklyAvgFormatted,
  }
}
