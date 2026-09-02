import { useState, useEffect, useCallback } from 'react'
import { PomodoroSession } from '../types/kanban'

const DEFAULT_WORK_TIME = 25 * 60 // 25 minutes
const DEFAULT_BREAK_TIME = 5 * 60 // 5 minutes

export function usePomodoro(
  onTaskMinuteLogged?: (taskId: string, minutes: number) => void
) {
  const [session, setSession] = useState<PomodoroSession>({
    taskId: null,
    taskTitle: undefined,
    timeLeft: DEFAULT_WORK_TIME,
    isRunning: false,
    mode: 'work',
    workDuration: DEFAULT_WORK_TIME,
    breakDuration: DEFAULT_BREAK_TIME,
  })

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (session.isRunning) {
      interval = setInterval(() => {
        setSession((prev) => {
          if (prev.timeLeft <= 1) {
            // Switch mode
            const nextMode = prev.mode === 'work' ? 'break' : 'work'
            const nextTime = nextMode === 'work' ? prev.workDuration : prev.breakDuration

            if (prev.mode === 'work' && prev.taskId && onTaskMinuteLogged) {
              onTaskMinuteLogged(prev.taskId, Math.round(prev.workDuration / 60))
            }

            return {
              ...prev,
              mode: nextMode,
              timeLeft: nextTime,
              isRunning: false,
            }
          }

          return {
            ...prev,
            timeLeft: prev.timeLeft - 1,
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [session.isRunning, onTaskMinuteLogged])

  const startFocus = useCallback((taskId?: string, taskTitle?: string) => {
    setSession((prev) => ({
      ...prev,
      taskId: taskId ?? prev.taskId,
      taskTitle: taskTitle ?? prev.taskTitle,
      isRunning: true,
      mode: 'work',
    }))
  }, [])

  const pauseFocus = useCallback(() => {
    setSession((prev) => ({ ...prev, isRunning: false }))
  }, [])

  const resumeFocus = useCallback(() => {
    setSession((prev) => ({ ...prev, isRunning: true }))
  }, [])

  const resetTimer = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.mode === 'work' ? prev.workDuration : prev.breakDuration,
    }))
  }, [])

  const switchMode = useCallback((mode: 'work' | 'break') => {
    setSession((prev) => ({
      ...prev,
      mode,
      isRunning: false,
      timeLeft: mode === 'work' ? prev.workDuration : prev.breakDuration,
    }))
  }, [])

  const clearFocusedTask = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      taskId: null,
      taskTitle: undefined,
    }))
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    session,
    startFocus,
    pauseFocus,
    resumeFocus,
    resetTimer,
    switchMode,
    clearFocusedTask,
    formatTime,
  }
}
