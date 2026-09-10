import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import confetti from 'canvas-confetti'
import type { Column, FilterState, KanbanData, Subtask, Task } from '../types/kanban'
import { storageService } from '../services/storageService'
import { INITIAL_DATA } from '../services/seedData'
import { useAuth } from './useAuth'
import { supabaseKanbanService } from '../services/supabaseKanbanService'

/**
 * Calculates the Monday 00:00:00 to Sunday 23:59:59 date range according to ISO-8601 week cycle.
 */
export function getISOWeekRange(
  scope: 'this_week' | 'last_week',
  baseDate: Date = new Date()
): { start: Date; end: Date } {
  const d = new Date(baseDate)
  const day = d.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day

  const start = new Date(d)
  start.setDate(d.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)

  if (scope === 'last_week') {
    start.setDate(start.getDate() - 7)
  }

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export function parseTaskDate(dateStr: string): Date | null {
  if (!dateStr) return null
  if (dateStr.length === 10 && dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number)
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null
    return new Date(year, month - 1, day, 12, 0, 0)
  }
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

export function isTaskInDateRange(task: Task, start: Date, end: Date): boolean {
  const dateStr = task.completedAt || task.updatedAt || task.createdAt
  if (!dateStr) return false
  const date = parseTaskDate(dateStr)
  if (!date) return false
  const time = date.getTime()
  return time >= start.getTime() && time <= end.getTime()
}

export const isProgressColumn = (colId: string) =>
  colId === 'col-progress' || colId.toLowerCase().includes('progress')

export const isReviewColumn = (colId: string) =>
  colId === 'col-review' ||
  colId.toLowerCase().includes('review') ||
  colId.toLowerCase().includes('espera')

export const isTrackedColumn = (colId: string) =>
  isProgressColumn(colId) || isReviewColumn(colId)

export function useKanban() {
  const { user } = useAuth(false)
  const userId = user?.id ?? null

  const prevUserIdRef = useRef<string | null>(userId)
  const [data, setData] = useState<KanbanData>(() => storageService.load(userId))
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    priority: 'all',
    tag: null,
    scope: 'all',
    weekScope: 'this_week',
  })

  // Synchronize with Supabase when user is authenticated or reset on logout
  useEffect(() => {
    let isMounted = true

    // Reset on logout transition (userId was authenticated and is now null)
    if (prevUserIdRef.current && !userId) {
      setData(INITIAL_DATA)
      prevUserIdRef.current = null
      return
    }

    if (!userId) {
      prevUserIdRef.current = null
      return
    }

    prevUserIdRef.current = userId

    const activeUserId = userId

    async function syncData() {
      try {
        const cloudData = await supabaseKanbanService.fetchKanbanData(activeUserId)
        if (!isMounted) return

        // Novo usuário sempre começa com quadro limpo inicial (INITIAL_DATA com 0 tarefas)
        if (cloudData.columns.length === 0 && cloudData.tasks.length === 0) {
          setData(INITIAL_DATA)
          return
        }

        setData({
          columns:
            cloudData.columns.length > 0 ? cloudData.columns : INITIAL_DATA.columns,
          tasks: cloudData.tasks,
          version: 1,
        })
      } catch (err) {
        console.error('Erro ao carregar dados do Kanban do Supabase:', err)
      }
    }

    void syncData()

    return () => {
      isMounted = false
    }
  }, [userId])

  // Save to localStorage partitioned by userId
  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      return
    }
    storageService.save(data, userId)
  }, [data, userId])

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#3b82f6'],
        disableForReducedMotion: true,
      })
    } catch {
      // Ignorar se confetti falhar no ambiente
    }
  }, [])

  const addTask = useCallback(
    (taskInput: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const isTracked = isTrackedColumn(taskInput.columnId)
      const initialTimeTracked = taskInput.timeTracked ?? {
        inProgressSeconds: 0,
        inReviewSeconds: 0,
        currentTimerStartedAt: isTracked ? now : null,
        currentTimerColumnId: isTracked ? taskInput.columnId : null,
      }

      const newTask: Task = {
        ...taskInput,
        timeTracked: initialTimeTracked,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      }

      setData((prev) => ({
        ...prev,
        tasks: [newTask, ...prev.tasks],
      }))

      if (userId) {
        supabaseKanbanService.syncTask(userId, newTask).catch((err) => {
          console.error('Erro ao sincronizar nova tarefa no Supabase:', err)
        })
      }

      return newTask
    },
    [userId]
  )

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      const now = new Date().toISOString()
      const currentTask = data.tasks.find((t) => t.id === taskId)
      if (!currentTask) return

      const updatedTask: Task = { ...currentTask, ...updates, updatedAt: now }

      setData((prev) => {
        const taskIndex = prev.tasks.findIndex((t) => t.id === taskId)
        if (taskIndex === -1) return prev

        const newTasks = [...prev.tasks]
        newTasks[taskIndex] = updatedTask
        return { ...prev, tasks: newTasks }
      })

      if (userId) {
        supabaseKanbanService.syncTask(userId, updatedTask).catch((err) => {
          console.error('Erro ao sincronizar atualizaÃ§Ã£o de tarefa no Supabase:', err)
        })
      }
    },
    [data.tasks, userId]
  )

  const deleteTask = useCallback(
    (taskId: string) => {
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
      }))

      if (userId) {
        supabaseKanbanService.deleteTask(taskId).catch((err) => {
          console.error('Erro ao deletar tarefa no Supabase:', err)
        })
      }
    },
    [userId]
  )

  const restoreTask = useCallback(
    (taskToRestore: Task) => {
      setData((prev) => {
        if (prev.tasks.some((t) => t.id === taskToRestore.id)) return prev
        return {
          ...prev,
          tasks: [taskToRestore, ...prev.tasks],
        }
      })

      if (userId) {
        supabaseKanbanService.syncTask(userId, taskToRestore).catch((err) => {
          console.error('Erro ao sincronizar tarefa restaurada no Supabase:', err)
        })
      }
    },
    [userId]
  )

  const moveTask = useCallback(
    (taskId: string, targetColumnId: string, targetIndex?: number) => {
      const currentTask = data.tasks.find((t) => t.id === taskId)
      if (!currentTask) return

      const isNowDone = targetColumnId === 'col-done' || targetColumnId.includes('done')
      const wasDone =
        currentTask.columnId === 'col-done' || currentTask.columnId.includes('done')

      if (isNowDone && !wasDone) {
        triggerCelebration()
      }

      const currentTimeTracked = currentTask.timeTracked || {
        inProgressSeconds: 0,
        inReviewSeconds: 0,
        currentTimerStartedAt: null,
        currentTimerColumnId: null,
      }

      let inProgressSeconds = currentTimeTracked.inProgressSeconds || 0
      let inReviewSeconds = currentTimeTracked.inReviewSeconds || 0

      if (
        currentTimeTracked.currentTimerStartedAt &&
        currentTimeTracked.currentTimerColumnId
      ) {
        const startedAtMs = new Date(currentTimeTracked.currentTimerStartedAt).getTime()
        if (!isNaN(startedAtMs)) {
          const elapsed = Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000))
          if (isProgressColumn(currentTimeTracked.currentTimerColumnId)) {
            inProgressSeconds += elapsed
          } else if (isReviewColumn(currentTimeTracked.currentTimerColumnId)) {
            inReviewSeconds += elapsed
          }
        }
      }

      const willTrack = isTrackedColumn(targetColumnId)
      const now = new Date().toISOString()
      const updatedTimeTracked = {
        inProgressSeconds,
        inReviewSeconds,
        currentTimerStartedAt: willTrack ? now : null,
        currentTimerColumnId: willTrack ? targetColumnId : null,
      }

      const updatedTask: Task = {
        ...currentTask,
        columnId: targetColumnId,
        completedAt: isNowDone ? currentTask.completedAt || now : undefined,
        updatedAt: now,
        timeTracked: updatedTimeTracked,
      }

      setData((prev) => {
        const remainingTasks = prev.tasks.filter((t) => t.id !== taskId)

        if (targetIndex !== undefined && targetIndex >= 0) {
          // Reorder within tasks of this target column
          const colTasks = remainingTasks.filter((t) => t.columnId === targetColumnId)
          const otherTasks = remainingTasks.filter((t) => t.columnId !== targetColumnId)

          colTasks.splice(targetIndex, 0, updatedTask)
          return { ...prev, tasks: [...colTasks, ...otherTasks] }
        }

        return {
          ...prev,
          tasks: [updatedTask, ...remainingTasks],
        }
      })

      if (userId) {
        supabaseKanbanService.syncTask(userId, updatedTask).catch((err) => {
          console.error('Erro ao mover tarefa no Supabase:', err)
        })
      }
    },
    [data.tasks, userId, triggerCelebration]
  )

  const toggleSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      const currentTask = data.tasks.find((t) => t.id === taskId)
      if (!currentTask) return

      const updatedSubtasks = currentTask.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
      const updatedTask: Task = {
        ...currentTask,
        subtasks: updatedSubtasks,
        updatedAt: new Date().toISOString(),
      }

      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) => (task.id === taskId ? updatedTask : task)),
      }))

      if (userId) {
        supabaseKanbanService.syncTask(userId, updatedTask).catch((err) => {
          console.error('Erro ao sincronizar subtarefa no Supabase:', err)
        })
      }
    },
    [data.tasks, userId]
  )

  const addSubtask = useCallback(
    (taskId: string, title: string) => {
      if (!title.trim()) return
      const currentTask = data.tasks.find((t) => t.id === taskId)
      if (!currentTask) return

      const newSubtask: Subtask = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        completed: false,
      }

      const updatedTask: Task = {
        ...currentTask,
        subtasks: [...currentTask.subtasks, newSubtask],
        updatedAt: new Date().toISOString(),
      }

      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) => (task.id === taskId ? updatedTask : task)),
      }))

      if (userId) {
        supabaseKanbanService.syncTask(userId, updatedTask).catch((err) => {
          console.error('Erro ao adicionar subtarefa no Supabase:', err)
        })
      }
    },
    [data.tasks, userId]
  )

  const removeSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      const currentTask = data.tasks.find((t) => t.id === taskId)
      if (!currentTask) return

      const updatedTask: Task = {
        ...currentTask,
        subtasks: currentTask.subtasks.filter((st) => st.id !== subtaskId),
        updatedAt: new Date().toISOString(),
      }

      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) => (task.id === taskId ? updatedTask : task)),
      }))

      if (userId) {
        supabaseKanbanService.syncTask(userId, updatedTask).catch((err) => {
          console.error('Erro ao remover subtarefa no Supabase:', err)
        })
      }
    },
    [data.tasks, userId]
  )

  const addColumn = useCallback(
    (title: string, colorTheme: Column['colorTheme']) => {
      if (!title.trim()) return
      const newColumn: Column = {
        id: `col-${Date.now()}`,
        title: title.trim(),
        order: 99,
        colorTheme,
      }
      setData((prev) => {
        const nextColumns = [...prev.columns, newColumn]
        if (userId) {
          supabaseKanbanService.syncColumns(userId, nextColumns).catch((err) => {
            console.error('Erro ao sincronizar nova coluna no Supabase:', err)
          })
        }
        return {
          ...prev,
          columns: nextColumns,
        }
      })
    },
    [userId]
  )

  const deleteColumn = useCallback(
    (columnId: string) => {
      setData((prev) => {
        const col = prev.columns.find((c) => c.id === columnId)
        if (!col) return prev
        if (
          col.isPermanent ||
          ['col-todo', 'col-progress', 'col-review', 'col-done'].includes(columnId)
        ) {
          return prev
        }
        if (prev.columns.length <= 1) return prev

        if (userId) {
          supabaseKanbanService.deleteColumn(columnId).catch((err) => {
            console.error('Erro ao deletar coluna no Supabase:', err)
          })
        }

        return {
          ...prev,
          columns: prev.columns.filter((c) => c.id !== columnId),
          tasks: prev.tasks.filter((t) => t.columnId !== columnId),
        }
      })
    },
    [userId]
  )

  const updateColumn = useCallback(
    (
      columnId: string,
      updates: { title?: string; colorTheme?: Column['colorTheme'] }
    ) => {
      setData((prev) => {
        const nextColumns = prev.columns.map((col) => {
          if (col.id !== columnId) return col
          return {
            ...col,
            ...(updates.title !== undefined && { title: updates.title.trim() }),
            ...(updates.colorTheme !== undefined && { colorTheme: updates.colorTheme }),
          }
        })

        if (userId) {
          supabaseKanbanService.syncColumns(userId, nextColumns).catch((err) => {
            console.error('Erro ao sincronizar atualizaÃ§Ã£o de coluna no Supabase:', err)
          })
        }

        return {
          ...prev,
          columns: nextColumns,
        }
      })
    },
    [userId]
  )

  const reorderColumns = useCallback(
    (newColumns: Column[]) => {
      const ordered = newColumns.map((col, idx) => ({ ...col, order: idx }))
      setData((prev) => ({
        ...prev,
        columns: ordered,
      }))

      if (userId) {
        supabaseKanbanService.syncColumns(userId, ordered).catch((err) => {
          console.error('Erro ao sincronizar reordenaÃ§Ã£o de colunas no Supabase:', err)
        })
      }
    },
    [userId]
  )

  const moveColumn = useCallback(
    (columnId: string, direction: 'left' | 'right') => {
      setData((prev) => {
        const sorted = [...prev.columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        const index = sorted.findIndex((c) => c.id === columnId)
        if (index === -1) return prev

        const targetIndex = direction === 'left' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= sorted.length) return prev

        const newCols = [...sorted]
        const [movedCol] = newCols.splice(index, 1)
        newCols.splice(targetIndex, 0, movedCol)

        const ordered = newCols.map((col, idx) => ({ ...col, order: idx }))

        if (userId) {
          supabaseKanbanService.syncColumns(userId, ordered).catch((err) => {
            console.error('Erro ao sincronizar movimento de coluna no Supabase:', err)
          })
        }

        return {
          ...prev,
          columns: ordered,
        }
      })
    },
    [userId]
  )

  const exportData = useCallback(() => {
    try {
      storageService.exportJSON(data)
    } catch {
      // Ignorar caso ambiente de teste não suporte download
    }
    return JSON.stringify(data, null, 2)
  }, [data])

  const importData = useCallback(
    (content: string | KanbanData) => {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content
        if (storageService.validateJSON(parsed)) {
          setData(parsed)
          if (userId) {
            supabaseKanbanService
              .uploadLocalData(userId, parsed.columns, parsed.tasks)
              .catch((err) => {
                console.error('Erro ao sincronizar dados importados no Supabase:', err)
              })
          }
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [userId]
  )

  const resetToSeed = useCallback(() => {
    setData(INITIAL_DATA)
    if (userId) {
      supabaseKanbanService
        .uploadLocalData(userId, INITIAL_DATA.columns, INITIAL_DATA.tasks)
        .catch((err) => {
          console.error('Erro ao sincronizar dados resetados no Supabase:', err)
        })
    }
  }, [userId])

  // All unique tags available in tasks
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    data.tasks.forEach((t) => t.tags.forEach((tag) => tagsSet.add(tag)))
    return Array.from(tagsSet)
  }, [data.tasks])

  // Filter tasks
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const filteredTasks = useMemo(() => {
    const { start: thisWeekStart, end: thisWeekEnd } = getISOWeekRange('this_week')
    const { start: lastWeekStart, end: lastWeekEnd } = getISOWeekRange('last_week')

    return data.tasks.filter((task) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(query)
        const matchesDesc = task.description?.toLowerCase().includes(query) ?? false
        const matchesTag = task.tags.some((t) => t.toLowerCase().includes(query))
        if (!matchesTitle && !matchesDesc && !matchesTag) return false
      }

      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false
      }

      // Tag filter (simplified - tag filtering removed from primary flow)
      if (filters.tag && !task.tags.includes(filters.tag)) {
        return false
      }

      // Scope filter
      if (filters.scope === 'today') {
        return task.dueDate === todayStr
      }
      if (filters.scope === 'upcoming') {
        return task.dueDate && task.dueDate > todayStr
      }
      if (filters.scope === 'overdue') {
        const isDone = task.columnId === 'col-done' || task.columnId.includes('done')
        return !isDone && task.dueDate && task.dueDate < todayStr
      }
      if (filters.scope === 'completed') {
        return task.columnId === 'col-done' || task.columnId.includes('done')
      }

      // Smart Weekly Filter
      // Crucial Business Rule:
      // The week filter ONLY affects completed tasks (col-done / includes 'done').
      // Active / pending tasks in other columns (col-todo, col-progress, etc.) ALWAYS remain visible
      // and rollover to subsequent weeks!
      const isDone = task.columnId === 'col-done' || task.columnId.includes('done')
      if (isDone) {
        if (filters.weekScope === 'this_week') {
          if (!isTaskInDateRange(task, thisWeekStart, thisWeekEnd)) return false
        } else if (filters.weekScope === 'last_week') {
          if (!isTaskInDateRange(task, lastWeekStart, lastWeekEnd)) return false
        }
        // If 'all', all completed tasks are shown
      }

      return true
    })
  }, [data.tasks, filters, todayStr])

  // Quick statistics for Daily Focus
  const stats = useMemo(() => {
    const total = data.tasks.length
    const doneTasks = data.tasks.filter(
      (t) => t.columnId === 'col-done' || t.columnId.includes('done')
    )
    const completedCount = doneTasks.length

    const todayTasks = data.tasks.filter((t) => t.dueDate === todayStr)
    const todayCompleted = todayTasks.filter(
      (t) => t.columnId === 'col-done' || t.columnId.includes('done')
    ).length

    const overdueCount = data.tasks.filter((t) => {
      const isDone = t.columnId === 'col-done' || t.columnId.includes('done')
      return !isDone && t.dueDate && t.dueDate < todayStr
    }).length

    const urgentCount = data.tasks.filter(
      (t) =>
        t.priority === 'urgent' &&
        !(t.columnId === 'col-done' || t.columnId.includes('done'))
    ).length

    const { start: thisWeekStart, end: thisWeekEnd } = getISOWeekRange('this_week')
    const weekCompletedCount = doneTasks.filter((t) =>
      isTaskInDateRange(t, thisWeekStart, thisWeekEnd)
    ).length

    const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0

    return {
      total,
      completedCount,
      todayTotal: todayTasks.length,
      todayCompleted,
      overdueCount,
      urgentCount,
      completionRate,
      weekCompletedCount,
    }
  }, [data.tasks, todayStr])

  const sortedColumns = useMemo(
    () => [...data.columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [data.columns]
  )

  return {
    columns: sortedColumns,
    tasks: filteredTasks,
    allTasksCount: data.tasks.length,
    filters,
    setFilters,
    allTags,
    stats,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    moveTask,
    toggleSubtask,
    addSubtask,
    removeSubtask,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    moveColumn,
    exportData,
    importData,
    resetToSeed,
  }
}
