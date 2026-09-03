import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePomodoro, POMODORO_SETTINGS_KEY } from '../hooks/usePomodoro'
import * as soundService from '../services/soundService'
import * as notificationService from '../services/notificationService'
import confetti from 'canvas-confetti'

vi.mock('../services/soundService', () => ({
  playWorkCompleteSound: vi.fn(),
  playBreakCompleteSound: vi.fn(),
}))

vi.mock('../services/notificationService', () => ({
  notify: vi.fn(),
  notificationService: {
    notify: vi.fn(),
    isSupported: vi.fn(() => true),
    getPermission: vi.fn(() => 'granted'),
    requestPermission: vi.fn(() => Promise.resolve('granted')),
  },
}))

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

describe('usePomodoro hook', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    document.title = 'DailyFlow Kanban'
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('inicializa com valores padrão quando localStorage está vazio', () => {
    const { result } = renderHook(() => usePomodoro())

    expect(result.current.session.timeLeft).toBe(25 * 60)
    expect(result.current.session.workDuration).toBe(25 * 60)
    expect(result.current.session.breakDuration).toBe(5 * 60)
    expect(result.current.session.isRunning).toBe(false)
    expect(result.current.session.mode).toBe('work')
    expect(result.current.session.isSoundEnabled).toBe(true)
  })

  it('inicializa com configurações customizadas salvas no localStorage', () => {
    localStorage.setItem(
      POMODORO_SETTINGS_KEY,
      JSON.stringify({
        workDuration: 30 * 60,
        breakDuration: 10 * 60,
        isSoundEnabled: false,
      })
    )

    const { result } = renderHook(() => usePomodoro())

    expect(result.current.session.timeLeft).toBe(30 * 60)
    expect(result.current.session.workDuration).toBe(30 * 60)
    expect(result.current.session.breakDuration).toBe(10 * 60)
    expect(result.current.session.isSoundEnabled).toBe(false)
  })

  it('atualiza o document.title em tempo real enquanto o cronômetro estiver rodando no modo foco', () => {
    const { result } = renderHook(() => usePomodoro())

    act(() => {
      result.current.startFocus('task-1', 'Tarefa Teste')
    })

    expect(document.title).toBe('(25:00) 🎯 Foco | DailyFlow')

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(document.title).toBe('(24:59) 🎯 Foco | DailyFlow')

    act(() => {
      result.current.pauseFocus()
    })

    expect(document.title).toBe('DailyFlow Kanban')
  })

  it('atualiza o document.title em tempo real no modo pausa e restaura ao pausar ou reiniciar', () => {
    const { result } = renderHook(() => usePomodoro())

    act(() => {
      result.current.switchMode('break')
      result.current.resumeFocus()
    })

    expect(document.title).toBe('(05:00) ☕ Pausa | DailyFlow')

    act(() => {
      result.current.resetTimer()
    })

    expect(document.title).toBe('DailyFlow Kanban')
  })

  it('ao concluir modo foco: emite som, notificação, confetti, atualiza título e computa minutos da tarefa', () => {
    const onTaskMinuteLogged = vi.fn()
    const { result } = renderHook(() => usePomodoro(onTaskMinuteLogged))

    act(() => {
      result.current.startFocus('task-10', 'Finalizar Relatório')
    })

    // Avança o tempo até o fim do foco (25 minutos = 1500 segundos)
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000)
    })

    expect(soundService.playWorkCompleteSound).toHaveBeenCalledTimes(1)
    expect(notificationService.notify).toHaveBeenCalledWith(
      'Tempo de Foco Concluído! 🎉',
      expect.objectContaining({
        body: expect.stringContaining('pausa'),
      })
    )
    expect(confetti).toHaveBeenCalledTimes(1)
    expect(document.title).toBe('⏰ Foco Concluído! | DailyFlow')
    expect(onTaskMinuteLogged).toHaveBeenCalledWith('task-10', 25)

    // Modo deve ter mudado para descanso
    expect(result.current.session.mode).toBe('break')
    expect(result.current.session.isRunning).toBe(false)
    expect(result.current.session.timeLeft).toBe(5 * 60)
  })

  it('ao concluir modo descanso: emite som de pausa, notificação e destaca título', () => {
    const { result } = renderHook(() => usePomodoro())

    act(() => {
      result.current.switchMode('break')
      result.current.resumeFocus()
    })

    // Avança o tempo até o fim da pausa (5 minutos = 300 segundos)
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000)
    })

    expect(soundService.playBreakCompleteSound).toHaveBeenCalledTimes(1)
    expect(notificationService.notify).toHaveBeenCalledWith(
      'Intervalo Finalizado! ☕',
      expect.objectContaining({
        body: expect.stringContaining('pausa'),
      })
    )
    expect(document.title).toBe('⏰ Pausa Finalizada! | DailyFlow')
    expect(result.current.session.mode).toBe('work')
  })

  it('não toca som se isSoundEnabled estiver desativado', () => {
    const { result } = renderHook(() => usePomodoro())

    act(() => {
      result.current.toggleSound()
    })
    expect(result.current.session.isSoundEnabled).toBe(false)

    act(() => {
      result.current.startFocus()
      vi.advanceTimersByTime(25 * 60 * 1000)
    })

    expect(soundService.playWorkCompleteSound).not.toHaveBeenCalled()
  })

  it('atualiza durações personalizadas e atualiza timeLeft imediatamente se o cronômetro estiver parado', () => {
    const { result } = renderHook(() => usePomodoro())

    act(() => {
      result.current.updateDurations(45, 15)
    })

    expect(result.current.session.workDuration).toBe(45 * 60)
    expect(result.current.session.breakDuration).toBe(15 * 60)
    expect(result.current.session.timeLeft).toBe(45 * 60)

    const saved = JSON.parse(localStorage.getItem(POMODORO_SETTINGS_KEY) || '{}')
    expect(saved.workDuration).toBe(45 * 60)
    expect(saved.breakDuration).toBe(15 * 60)
  })

  it('mantém precisão absoluta e avança corretamente quando há salto de tempo em segundo plano (background timer jump)', () => {
    const { result } = renderHook(() => usePomodoro())

    act(() => {
      result.current.startFocus('task-1', 'Tarefa em Background')
    })

    expect(result.current.session.timeLeft).toBe(25 * 60)

    // Simula que a aba ficou em segundo plano por 3 minutos (180 segundos)
    act(() => {
      vi.advanceTimersByTime(3 * 60 * 1000)
    })

    expect(result.current.session.timeLeft).toBe(22 * 60)
    expect(document.title).toBe('(22:00) 🎯 Foco | DailyFlow')
  })

  it('conclui o ciclo e dispara notificações ao receber evento visibilitychange se o tempo expirou com tela bloqueada ou aba inativa', () => {
    const { result } = renderHook(() => usePomodoro())

    act(() => {
      result.current.startFocus('task-1', 'Tarefa Longa')
    })

    // Simula que o tempo passou completamente em segundo plano (26 minutos)
    act(() => {
      vi.advanceTimersByTime(26 * 60 * 1000)
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(soundService.playWorkCompleteSound).toHaveBeenCalledTimes(1)
    expect(notificationService.notify).toHaveBeenCalledTimes(1)
    expect(document.title).toBe('⏰ Foco Concluído! | DailyFlow')
    expect(result.current.session.mode).toBe('break')
    expect(result.current.session.isRunning).toBe(false)
  })
})
