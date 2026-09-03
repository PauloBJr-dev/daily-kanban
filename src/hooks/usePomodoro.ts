import { useState, useEffect, useCallback, useRef } from 'react'
import confetti from 'canvas-confetti'
import type { PomodoroSession } from '../types/kanban'
import { playWorkCompleteSound, playBreakCompleteSound } from '../services/soundService'
import { notify } from '../services/notificationService'

export const POMODORO_SETTINGS_KEY = 'dailyflow_pomodoro_settings'

const DEFAULT_WORK_TIME = 25 * 60 // 25 minutes
const DEFAULT_BREAK_TIME = 5 * 60 // 5 minutes
const DEFAULT_DOCUMENT_TITLE = 'DailyFlow Kanban'

interface PomodoroSettings {
  workDuration: number
  breakDuration: number
  isSoundEnabled: boolean
}

const loadSettings = (): PomodoroSettings => {
  if (typeof window === 'undefined') {
    return {
      workDuration: DEFAULT_WORK_TIME,
      breakDuration: DEFAULT_BREAK_TIME,
      isSoundEnabled: true,
    }
  }

  try {
    const saved = localStorage.getItem(POMODORO_SETTINGS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        workDuration:
          typeof parsed.workDuration === 'number' && parsed.workDuration > 0
            ? parsed.workDuration
            : DEFAULT_WORK_TIME,
        breakDuration:
          typeof parsed.breakDuration === 'number' && parsed.breakDuration > 0
            ? parsed.breakDuration
            : DEFAULT_BREAK_TIME,
        isSoundEnabled:
          typeof parsed.isSoundEnabled === 'boolean' ? parsed.isSoundEnabled : true,
      }
    }
  } catch {
    // Ignora erros de parse do localStorage
  }

  return {
    workDuration: DEFAULT_WORK_TIME,
    breakDuration: DEFAULT_BREAK_TIME,
    isSoundEnabled: true,
  }
}

export function usePomodoro(
  onTaskMinuteLogged?: (taskId: string, minutes: number) => void
) {
  const [initialSettings] = useState<PomodoroSettings>(loadSettings)

  const [session, setSession] = useState<PomodoroSession>(() => ({
    taskId: null,
    taskTitle: undefined,
    timeLeft: initialSettings.workDuration,
    isRunning: false,
    mode: 'work',
    workDuration: initialSettings.workDuration,
    breakDuration: initialSettings.breakDuration,
    isSoundEnabled: initialSettings.isSoundEnabled,
  }))

  const originalTitleRef = useRef<string>(
    typeof document !== 'undefined' && document.title
      ? document.title
      : DEFAULT_DOCUMENT_TITLE
  )
  const completedTitleRef = useRef<string | null>(null)

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Sincronização em tempo real do título da aba do navegador
  useEffect(() => {
    if (typeof document === 'undefined') return

    if (session.isRunning) {
      completedTitleRef.current = null
      const modeLabel = session.mode === 'work' ? '🎯 Foco' : '☕ Pausa'
      document.title = `(${formatTime(session.timeLeft)}) ${modeLabel} | DailyFlow`
    } else if (completedTitleRef.current) {
      document.title = completedTitleRef.current
    } else {
      document.title = originalTitleRef.current
    }
  }, [session.isRunning, session.timeLeft, session.mode, formatTime])

  // Restaura título ao desmontar o componente
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.title = originalTitleRef.current
      }
    }
  }, [])

  // Cronômetro principal com tratamento de conclusão de ciclo
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (session.isRunning) {
      interval = setInterval(() => {
        setSession((prev) => {
          if (prev.timeLeft <= 1) {
            // Ciclo concluído
            const isWorkEnding = prev.mode === 'work'
            const nextMode = isWorkEnding ? 'break' : 'work'
            const nextTime = nextMode === 'work' ? prev.workDuration : prev.breakDuration

            if (isWorkEnding) {
              if (prev.isSoundEnabled ?? true) {
                playWorkCompleteSound()
              }
              notify('Tempo de Foco Concluído! 🎉', {
                body: 'Excelente trabalho! Hora de fazer uma pausa de descanso.',
                icon: '/vite.svg',
              })
              try {
                confetti({
                  particleCount: 60,
                  spread: 70,
                  origin: { y: 0.7 },
                })
              } catch {
                // Silencia falhas caso canvas não esteja disponível
              }
              completedTitleRef.current = '⏰ Foco Concluído! | DailyFlow'
              if (typeof document !== 'undefined') {
                document.title = '⏰ Foco Concluído! | DailyFlow'
              }

              if (prev.taskId && onTaskMinuteLogged) {
                onTaskMinuteLogged(prev.taskId, Math.round(prev.workDuration / 60))
              }
            } else {
              if (prev.isSoundEnabled ?? true) {
                playBreakCompleteSound()
              }
              notify('Intervalo Finalizado! ☕', {
                body: 'Sua pausa terminou. Pronto para mais um ciclo de foco produtivo?',
                icon: '/vite.svg',
              })
              completedTitleRef.current = '⏰ Pausa Finalizada! | DailyFlow'
              if (typeof document !== 'undefined') {
                document.title = '⏰ Pausa Finalizada! | DailyFlow'
              }
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
    completedTitleRef.current = null
    setSession((prev) => ({
      ...prev,
      taskId: taskId ?? prev.taskId,
      taskTitle: taskTitle ?? prev.taskTitle,
      isRunning: true,
      mode: 'work',
    }))
  }, [])

  const pauseFocus = useCallback(() => {
    completedTitleRef.current = null
    if (typeof document !== 'undefined') {
      document.title = originalTitleRef.current
    }
    setSession((prev) => ({ ...prev, isRunning: false }))
  }, [])

  const resumeFocus = useCallback(() => {
    completedTitleRef.current = null
    setSession((prev) => ({ ...prev, isRunning: true }))
  }, [])

  const resetTimer = useCallback(() => {
    completedTitleRef.current = null
    if (typeof document !== 'undefined') {
      document.title = originalTitleRef.current
    }
    setSession((prev) => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.mode === 'work' ? prev.workDuration : prev.breakDuration,
    }))
  }, [])

  const switchMode = useCallback((mode: 'work' | 'break') => {
    completedTitleRef.current = null
    if (typeof document !== 'undefined') {
      document.title = originalTitleRef.current
    }
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

  const updateDurations = useCallback((workMinutes: number, breakMinutes: number) => {
    const newWorkDuration = Math.max(1, Math.round(workMinutes)) * 60
    const newBreakDuration = Math.max(1, Math.round(breakMinutes)) * 60

    setSession((prev) => {
      const updated: PomodoroSession = {
        ...prev,
        workDuration: newWorkDuration,
        breakDuration: newBreakDuration,
        timeLeft: !prev.isRunning
          ? prev.mode === 'work'
            ? newWorkDuration
            : newBreakDuration
          : prev.timeLeft,
      }

      try {
        localStorage.setItem(
          POMODORO_SETTINGS_KEY,
          JSON.stringify({
            workDuration: newWorkDuration,
            breakDuration: newBreakDuration,
            isSoundEnabled: updated.isSoundEnabled ?? true,
          })
        )
      } catch {
        // Ignora falhas de escrita
      }

      return updated
    })
  }, [])

  const toggleSound = useCallback(() => {
    setSession((prev) => {
      const nextSound = !(prev.isSoundEnabled ?? true)
      try {
        localStorage.setItem(
          POMODORO_SETTINGS_KEY,
          JSON.stringify({
            workDuration: prev.workDuration,
            breakDuration: prev.breakDuration,
            isSoundEnabled: nextSound,
          })
        )
      } catch {
        // Ignora falhas de escrita
      }
      return {
        ...prev,
        isSoundEnabled: nextSound,
      }
    })
  }, [])

  return {
    session,
    startFocus,
    pauseFocus,
    resumeFocus,
    resetTimer,
    switchMode,
    clearFocusedTask,
    formatTime,
    updateDurations,
    toggleSound,
  }
}
