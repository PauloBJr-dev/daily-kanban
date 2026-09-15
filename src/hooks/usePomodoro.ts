import { useState, useEffect, useCallback, useRef } from 'react'
import confetti from 'canvas-confetti'
import type { PomodoroSession, CatPurrType } from '../types/kanban'
import type { ActivePomodoroSession } from '../services/pomodoroSessionService'
import {
  playWorkCompleteSound,
  playBreakCompleteSound,
  startCatPurr,
  stopCatPurr,
} from '../services/soundService'
import { notify, requestPermission } from '../services/notificationService'

export const POMODORO_SETTINGS_KEY = 'dailyflow_pomodoro_settings'

const DEFAULT_WORK_TIME = 25 * 60 // 25 minutes
const DEFAULT_BREAK_TIME = 5 * 60 // 5 minutes
const DEFAULT_DOCUMENT_TITLE = 'Organy - Organização e estudos'
const DEFAULT_CAT_PURR_TYPE: CatPurrType = 'none'
const DEFAULT_CAT_PURR_VOLUME = 0.6

export interface PomodoroSessionCompletedEvent {
  taskId?: string | null
  taskTitle?: string | null
  mode: 'work' | 'break'
  durationMinutes: number
  completedAt: string
}

export interface UsePomodoroOptions {
  onTaskMinuteLogged?: (taskId: string, minutes: number) => void
  onActiveSessionChange?: (session: ActivePomodoroSession | null) => void
  onSessionCompleted?: (event: PomodoroSessionCompletedEvent) => void
  initialActiveSession?: ActivePomodoroSession | null
}

interface PomodoroSettings {
  workDuration: number
  breakDuration: number
  isSoundEnabled: boolean
  catPurrType: CatPurrType
  catPurrVolume: number
}

const loadSettings = (): PomodoroSettings => {
  const defaults: PomodoroSettings = {
    workDuration: DEFAULT_WORK_TIME,
    breakDuration: DEFAULT_BREAK_TIME,
    isSoundEnabled: true,
    catPurrType: DEFAULT_CAT_PURR_TYPE,
    catPurrVolume: DEFAULT_CAT_PURR_VOLUME,
  }

  if (typeof window === 'undefined') {
    return defaults
  }

  try {
    const saved = localStorage.getItem(POMODORO_SETTINGS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const validPurrTypes: CatPurrType[] = ['none', 'soft', 'deep', 'rhythmic']
      const catPurrType = validPurrTypes.includes(parsed.catPurrType)
        ? (parsed.catPurrType as CatPurrType)
        : DEFAULT_CAT_PURR_TYPE
      const catPurrVolume =
        typeof parsed.catPurrVolume === 'number' &&
        parsed.catPurrVolume >= 0 &&
        parsed.catPurrVolume <= 1
          ? parsed.catPurrVolume
          : DEFAULT_CAT_PURR_VOLUME

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
        catPurrType,
        catPurrVolume,
      }
    }
  } catch {
    // Ignora erros de parse do localStorage
  }

  return defaults
}

export function usePomodoro(
  optionsOrTaskLogged?: ((taskId: string, minutes: number) => void) | UsePomodoroOptions
) {
  const options: UsePomodoroOptions =
    typeof optionsOrTaskLogged === 'function'
      ? { onTaskMinuteLogged: optionsOrTaskLogged }
      : optionsOrTaskLogged || {}

  const [initialSettings] = useState<PomodoroSettings>(loadSettings)

  const originalTitleRef = useRef<string>(
    typeof document !== 'undefined' && document.title
      ? document.title
      : DEFAULT_DOCUMENT_TITLE
  )
  const completedTitleRef = useRef<string | null>(null)
  const targetEndTimeRef = useRef<number | null>(null)

  const callbacksRef = useRef(options)
  useEffect(() => {
    callbacksRef.current = options
  })

  const [isUserPaused, setIsUserPaused] = useState<boolean>(false)

  const [session, setSession] = useState<PomodoroSession>(() => ({
    taskId: null,
    taskTitle: undefined,
    timeLeft: initialSettings.workDuration,
    isRunning: false,
    mode: 'work',
    workDuration: initialSettings.workDuration,
    breakDuration: initialSettings.breakDuration,
    isSoundEnabled: initialSettings.isSoundEnabled,
    catPurrType: initialSettings.catPurrType,
    catPurrVolume: initialSettings.catPurrVolume,
  }))

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
      if (session.timeLeft <= 5 && session.timeLeft > 0) {
        document.title = `⚡ (${formatTime(session.timeLeft)}) Reta Final! Quase lá! | Organy`
      } else if (session.mode === 'work') {
        if (session.taskTitle) {
          document.title = `(${formatTime(session.timeLeft)}) 📖 ${session.taskTitle} | Organy`
        } else {
          document.title = `(${formatTime(session.timeLeft)}) 🎯 Foco & Estudos | Organy`
        }
      } else {
        document.title = `(${formatTime(session.timeLeft)}) ☕ Pausa Revigorante | Organy`
      }
    } else if (isUserPaused) {
      completedTitleRef.current = null
      document.title = `⏸️ (${formatTime(session.timeLeft)}) Pausado | Organy`
    } else if (completedTitleRef.current) {
      document.title = completedTitleRef.current
    } else {
      document.title = originalTitleRef.current
    }
  }, [
    session.isRunning,
    session.timeLeft,
    session.mode,
    session.taskTitle,
    isUserPaused,
    formatTime,
  ])

  // Restaura título e interrompe áudio ao desmontar o componente
  useEffect(() => {
    return () => {
      stopCatPurr()
      if (typeof document !== 'undefined') {
        document.title = originalTitleRef.current
      }
    }
  }, [])

  // Gerenciamento acústico do ronrom de gato durante a pausa (break)
  useEffect(() => {
    const shouldPurr =
      session.isRunning &&
      session.mode === 'break' &&
      (session.isSoundEnabled ?? true) &&
      session.catPurrType &&
      session.catPurrType !== 'none'

    if (shouldPurr) {
      startCatPurr(session.catPurrType!, session.catPurrVolume ?? DEFAULT_CAT_PURR_VOLUME)
    } else {
      stopCatPurr()
    }

    return () => {
      stopCatPurr()
    }
  }, [
    session.isRunning,
    session.mode,
    session.isSoundEnabled,
    session.catPurrType,
    session.catPurrVolume,
  ])

  // Função central para processar conclusão de ciclo (foco -> descanso ou descanso -> foco)
  const handleCycleComplete = useCallback(() => {
    targetEndTimeRef.current = null
    setSession((prev) => {
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
        completedTitleRef.current = '🎉 Foco Concluído! Parabéns! | Organy'
        setIsUserPaused(false)
        if (typeof document !== 'undefined') {
          document.title = '🎉 Foco Concluído! Parabéns! | Organy'
        }

        if (prev.taskId && callbacksRef.current.onTaskMinuteLogged) {
          callbacksRef.current.onTaskMinuteLogged(
            prev.taskId,
            Math.round(prev.workDuration / 60)
          )
        }

        callbacksRef.current.onSessionCompleted?.({
          taskId: prev.taskId,
          taskTitle: prev.taskTitle,
          mode: 'work',
          durationMinutes: Math.round(prev.workDuration / 60),
          completedAt: new Date().toISOString(),
        })
      } else {
        if (prev.isSoundEnabled ?? true) {
          playBreakCompleteSound()
        }
        notify('Intervalo Finalizado! ☕', {
          body: 'Sua pausa terminou. Pronto para mais um ciclo de foco produtivo?',
          icon: '/vite.svg',
        })
        completedTitleRef.current = '⏰ Pausa Finalizada! Pronto para Estudar? | Organy'
        setIsUserPaused(false)
        if (typeof document !== 'undefined') {
          document.title = '⏰ Pausa Finalizada! Pronto para Estudar? | Organy'
        }

        callbacksRef.current.onSessionCompleted?.({
          taskId: prev.taskId,
          taskTitle: prev.taskTitle,
          mode: 'break',
          durationMinutes: Math.round(prev.breakDuration / 60),
          completedAt: new Date().toISOString(),
        })
      }

      callbacksRef.current.onActiveSessionChange?.(null)

      return {
        ...prev,
        mode: nextMode,
        timeLeft: nextTime,
        isRunning: false,
      }
    })
  }, [])

  // Ticker de alta precisão baseado em Date.now() delta
  const tick = useCallback(() => {
    if (!targetEndTimeRef.current) return

    const now = Date.now()
    const diffMs = targetEndTimeRef.current - now
    const remainingSeconds = Math.max(0, Math.ceil(diffMs / 1000))

    if (remainingSeconds <= 0) {
      handleCycleComplete()
    } else {
      setSession((prev) => {
        if (prev.timeLeft === remainingSeconds) return prev
        return {
          ...prev,
          timeLeft: remainingSeconds,
        }
      })
    }
  }, [handleCycleComplete])

  const timeLeftRef = useRef(session.timeLeft)
  useEffect(() => {
    timeLeftRef.current = session.timeLeft
  }, [session.timeLeft])

  // Cronômetro principal com Web Worker e fallback para setInterval
  useEffect(() => {
    if (!session.isRunning) {
      targetEndTimeRef.current = null
      return
    }

    // Inicializa targetEndTime se ainda não existir
    if (!targetEndTimeRef.current) {
      targetEndTimeRef.current = Date.now() + timeLeftRef.current * 1000
    }

    let workerTimer: {
      start: () => void
      stop: () => void
      terminate: () => void
    } | null = null
    let fallbackInterval: ReturnType<typeof setInterval> | null = null

    try {
      if (
        typeof window !== 'undefined' &&
        typeof Worker !== 'undefined' &&
        typeof Blob !== 'undefined' &&
        typeof URL !== 'undefined' &&
        typeof URL.createObjectURL === 'function'
      ) {
        const workerBlob = new Blob(
          [
            `let timer = null;
            self.onmessage = function(e) {
              if (e.data === 'start') {
                if (timer) clearInterval(timer);
                timer = setInterval(() => self.postMessage('tick'), 1000);
              } else if (e.data === 'stop') {
                if (timer) clearInterval(timer);
                timer = null;
              }
            };`,
          ],
          { type: 'application/javascript' }
        )
        const workerUrl = URL.createObjectURL(workerBlob)
        const worker = new Worker(workerUrl)
        worker.onmessage = (e) => {
          if (e.data === 'tick') {
            tick()
          }
        }
        workerTimer = {
          start: () => worker.postMessage('start'),
          stop: () => worker.postMessage('stop'),
          terminate: () => {
            worker.terminate()
            URL.revokeObjectURL(workerUrl)
          },
        }
        workerTimer.start()
      }
    } catch {
      workerTimer = null
    }

    if (!workerTimer) {
      fallbackInterval = setInterval(() => {
        tick()
      }, 1000)
    }

    return () => {
      if (workerTimer) {
        workerTimer.stop()
        workerTimer.terminate()
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval)
      }
    }
  }, [session.isRunning, tick])

  // Sincronização imediata ao reativar aba do navegador ou desbloquear a tela do celular
  useEffect(() => {
    const handleSyncOnResume = () => {
      if (session.isRunning && targetEndTimeRef.current) {
        tick()
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleSyncOnResume)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleSyncOnResume)
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleSyncOnResume)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleSyncOnResume)
      }
    }
  }, [session.isRunning, tick])

  const startFocus = useCallback((taskId?: string, taskTitle?: string) => {
    completedTitleRef.current = null
    setIsUserPaused(false)
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      window.Notification.permission === 'default'
    ) {
      requestPermission().catch(() => {})
    }
    setSession((prev) => {
      const durationSeconds = prev.timeLeft
      targetEndTimeRef.current = Date.now() + durationSeconds * 1000
      const activeState: ActivePomodoroSession = {
        taskId: taskId !== undefined ? taskId : prev.taskId,
        taskTitle: taskTitle !== undefined ? taskTitle : prev.taskTitle,
        mode: 'work',
        startedAt: new Date().toISOString(),
        durationSeconds,
        isRunning: true,
        pausedTimeLeft: null,
      }
      callbacksRef.current.onActiveSessionChange?.(activeState)
      return {
        ...prev,
        taskId: taskId ?? prev.taskId,
        taskTitle: taskTitle ?? prev.taskTitle,
        isRunning: true,
        mode: 'work',
      }
    })
  }, [])

  const pauseFocus = useCallback(() => {
    targetEndTimeRef.current = null
    completedTitleRef.current = null
    setIsUserPaused(true)
    setSession((prev) => {
      const activeState: ActivePomodoroSession = {
        taskId: prev.taskId,
        taskTitle: prev.taskTitle,
        mode: prev.mode,
        startedAt: null,
        durationSeconds: prev.mode === 'work' ? prev.workDuration : prev.breakDuration,
        isRunning: false,
        pausedTimeLeft: prev.timeLeft,
      }
      callbacksRef.current.onActiveSessionChange?.(activeState)
      return { ...prev, isRunning: false }
    })
  }, [])

  const resumeFocus = useCallback(() => {
    completedTitleRef.current = null
    setIsUserPaused(false)
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      window.Notification.permission === 'default'
    ) {
      requestPermission().catch(() => {})
    }
    setSession((prev) => {
      const durationSeconds = prev.timeLeft
      targetEndTimeRef.current = Date.now() + durationSeconds * 1000
      const activeState: ActivePomodoroSession = {
        taskId: prev.taskId,
        taskTitle: prev.taskTitle,
        mode: prev.mode,
        startedAt: new Date().toISOString(),
        durationSeconds,
        isRunning: true,
        pausedTimeLeft: null,
      }
      callbacksRef.current.onActiveSessionChange?.(activeState)
      return { ...prev, isRunning: true }
    })
  }, [])

  const resetTimer = useCallback(() => {
    targetEndTimeRef.current = null
    completedTitleRef.current = null
    setIsUserPaused(false)
    if (typeof document !== 'undefined') {
      document.title = originalTitleRef.current
    }
    callbacksRef.current.onActiveSessionChange?.(null)
    setSession((prev) => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.mode === 'work' ? prev.workDuration : prev.breakDuration,
    }))
  }, [])

  const switchMode = useCallback((mode: 'work' | 'break') => {
    targetEndTimeRef.current = null
    completedTitleRef.current = null
    setIsUserPaused(false)
    if (typeof document !== 'undefined') {
      document.title = originalTitleRef.current
    }
    callbacksRef.current.onActiveSessionChange?.(null)
    setSession((prev) => ({
      ...prev,
      mode,
      isRunning: false,
      timeLeft: mode === 'work' ? prev.workDuration : prev.breakDuration,
    }))
  }, [])

  const clearFocusedTask = useCallback(() => {
    setSession((prev) => {
      if (prev.isRunning) {
        callbacksRef.current.onActiveSessionChange?.({
          taskId: null,
          taskTitle: null,
          mode: prev.mode,
          startedAt: new Date().toISOString(),
          durationSeconds: prev.timeLeft,
          isRunning: true,
          pausedTimeLeft: null,
        })
      }
      return {
        ...prev,
        taskId: null,
        taskTitle: undefined,
      }
    })
  }, [])

  const restoreActiveSession = useCallback((persisted: ActivePomodoroSession | null) => {
    if (!persisted) return

    completedTitleRef.current = null

    if (persisted.isRunning && persisted.startedAt) {
      const elapsed = Math.floor(
        (Date.now() - new Date(persisted.startedAt).getTime()) / 1000
      )
      const remainingSeconds = Math.max(0, persisted.durationSeconds - elapsed)

      if (remainingSeconds > 0) {
        targetEndTimeRef.current = Date.now() + remainingSeconds * 1000
        setIsUserPaused(false)
        setSession((prev) => ({
          ...prev,
          taskId: persisted.taskId,
          taskTitle: persisted.taskTitle ?? undefined,
          mode: persisted.mode,
          timeLeft: remainingSeconds,
          isRunning: true,
        }))
      } else {
        // A contagem terminou enquanto o usuário estava longe ou trocou de máquina
        targetEndTimeRef.current = null
        setIsUserPaused(false)
        const isWorkEnding = persisted.mode === 'work'
        const nextMode = isWorkEnding ? 'break' : 'work'

        callbacksRef.current.onSessionCompleted?.({
          taskId: persisted.taskId,
          taskTitle: persisted.taskTitle,
          mode: persisted.mode,
          durationMinutes: Math.round(persisted.durationSeconds / 60),
          completedAt: new Date().toISOString(),
        })

        callbacksRef.current.onActiveSessionChange?.(null)

        setSession((prev) => ({
          ...prev,
          taskId: isWorkEnding ? prev.taskId : null,
          taskTitle: isWorkEnding ? prev.taskTitle : undefined,
          mode: nextMode,
          timeLeft: nextMode === 'work' ? prev.workDuration : prev.breakDuration,
          isRunning: false,
        }))
      }
    } else {
      targetEndTimeRef.current = null
      const timeLeft =
        typeof persisted.pausedTimeLeft === 'number'
          ? persisted.pausedTimeLeft
          : persisted.durationSeconds

      setIsUserPaused(true)
      setSession((prev) => ({
        ...prev,
        taskId: persisted.taskId,
        taskTitle: persisted.taskTitle ?? undefined,
        mode: persisted.mode,
        timeLeft,
        isRunning: false,
      }))
    }
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
            catPurrType: updated.catPurrType ?? DEFAULT_CAT_PURR_TYPE,
            catPurrVolume: updated.catPurrVolume ?? DEFAULT_CAT_PURR_VOLUME,
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
            catPurrType: prev.catPurrType ?? DEFAULT_CAT_PURR_TYPE,
            catPurrVolume: prev.catPurrVolume ?? DEFAULT_CAT_PURR_VOLUME,
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

  const updateSettings = useCallback(
    (
      workMinutes: number,
      breakMinutes: number,
      isSoundEnabled: boolean,
      catPurrType: CatPurrType,
      catPurrVolume: number
    ) => {
      const newWorkDuration = Math.max(1, Math.round(workMinutes)) * 60
      const newBreakDuration = Math.max(1, Math.round(breakMinutes)) * 60
      const validVolume = Math.max(0, Math.min(1, catPurrVolume))

      setSession((prev) => {
        const updated: PomodoroSession = {
          ...prev,
          workDuration: newWorkDuration,
          breakDuration: newBreakDuration,
          isSoundEnabled,
          catPurrType,
          catPurrVolume: validVolume,
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
              isSoundEnabled,
              catPurrType,
              catPurrVolume: validVolume,
            })
          )
        } catch {
          // Ignora falhas de escrita
        }

        return updated
      })
    },
    []
  )

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
    updateSettings,
    restoreActiveSession,
  }
}
