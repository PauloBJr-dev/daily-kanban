import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PomodoroFullscreen } from '../components/PomodoroFullscreen'
import type { PomodoroSession } from '../types/kanban'

describe('PomodoroFullscreen component', () => {
  const defaultSession: PomodoroSession = {
    taskId: 'task-1',
    taskTitle: 'Construir Nova Funcionalidade',
    timeLeft: 25 * 60,
    isRunning: true,
    mode: 'work',
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
    isSoundEnabled: true,
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  it('renderiza o timer gigante, badge de modo e título da tarefa vinculada', () => {
    render(
      <PomodoroFullscreen
        session={defaultSession}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClose={vi.fn()}
        formatTime={formatTime}
      />
    )

    expect(screen.getByText(/🎯 Foco Ativo/i)).toBeInTheDocument()
    expect(
      screen.getByText(/🎯 Focando em: Construir Nova Funcionalidade/i)
    ).toBeInTheDocument()
    expect(screen.getByTestId('fullscreen-timer-display')).toHaveTextContent('25:00')
    expect(screen.getByTestId('fullscreen-progress-bar')).toBeInTheDocument()
  })

  it('renderiza Foco Livre quando não há tarefa selecionada', () => {
    const freeSession: PomodoroSession = {
      ...defaultSession,
      taskId: null,
      taskTitle: undefined,
    }

    render(
      <PomodoroFullscreen
        session={freeSession}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClose={vi.fn()}
        formatTime={formatTime}
      />
    )

    expect(screen.getByText('🎯 Foco Livre')).toBeInTheDocument()
  })

  it('renderiza badge e cores correspondentes no modo de pausa (break)', () => {
    const breakSession: PomodoroSession = {
      ...defaultSession,
      mode: 'break',
      timeLeft: 5 * 60,
    }

    render(
      <PomodoroFullscreen
        session={breakSession}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClose={vi.fn()}
        formatTime={formatTime}
      />
    )

    expect(screen.getByText(/☕ Pausa Revigorante/i)).toBeInTheDocument()
    expect(screen.getByTestId('fullscreen-timer-display')).toHaveTextContent('05:00')
  })

  it('dispara onPlayPause ao clicar no botão central', () => {
    const onPlayPause = vi.fn()
    render(
      <PomodoroFullscreen
        session={defaultSession}
        onPlayPause={onPlayPause}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClose={vi.fn()}
        formatTime={formatTime}
      />
    )

    const playPauseBtn = screen.getByRole('button', { name: /pausar foco/i })
    fireEvent.click(playPauseBtn)
    expect(onPlayPause).toHaveBeenCalledTimes(1)
  })

  it('dispara onReset ao clicar no botão de reiniciar', () => {
    const onReset = vi.fn()
    render(
      <PomodoroFullscreen
        session={defaultSession}
        onPlayPause={vi.fn()}
        onReset={onReset}
        onSwitchMode={vi.fn()}
        onClose={vi.fn()}
        formatTime={formatTime}
      />
    )

    const resetBtn = screen.getByRole('button', { name: /reiniciar cronômetro/i })
    fireEvent.click(resetBtn)
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('dispara onSwitchMode ao clicar no botão de pular ciclo', () => {
    const onSwitchMode = vi.fn()
    render(
      <PomodoroFullscreen
        session={defaultSession}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={onSwitchMode}
        onClose={vi.fn()}
        formatTime={formatTime}
      />
    )

    const skipBtn = screen.getByRole('button', { name: /pular para pausa/i })
    fireEvent.click(skipBtn)
    expect(onSwitchMode).toHaveBeenCalledWith('break')
  })

  it('dispara onClose ao clicar no botão de minimizar', () => {
    const onClose = vi.fn()
    render(
      <PomodoroFullscreen
        session={defaultSession}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClose={onClose}
        formatTime={formatTime}
      />
    )

    const minimizeBtn = screen.getByRole('button', { name: /minimizar \(esc\)/i })
    fireEvent.click(minimizeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('dispara onClose ao pressionar a tecla Escape', () => {
    const onClose = vi.fn()
    render(
      <PomodoroFullscreen
        session={defaultSession}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClose={onClose}
        formatTime={formatTime}
      />
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('aplica sinal visual de pulsação nos últimos 5 segundos quando o timer estiver rodando', () => {
    const nearEndSession: PomodoroSession = {
      ...defaultSession,
      timeLeft: 4,
      isRunning: true,
    }

    const { rerender } = render(
      <PomodoroFullscreen
        session={nearEndSession}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClose={vi.fn()}
        formatTime={formatTime}
      />
    )

    const container = screen.getByTestId('fullscreen-timer-container')
    expect(container).toHaveClass('animate-pulse')
    expect(container).toHaveClass('ring-8')
    expect(container).toHaveClass('ring-amber-500/50')

    // Quando o tempo é maior que 5s, não deve ter classes de pulsação
    rerender(
      <PomodoroFullscreen
        session={{ ...defaultSession, timeLeft: 10, isRunning: true }}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClose={vi.fn()}
        formatTime={formatTime}
      />
    )
    expect(container).not.toHaveClass('animate-pulse')

    // Quando não estiver rodando (pausado), mesmo com timeLeft <= 5, não deve ter pulsação
    rerender(
      <PomodoroFullscreen
        session={{ ...defaultSession, timeLeft: 4, isRunning: false }}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClose={vi.fn()}
        formatTime={formatTime}
      />
    )
    expect(container).not.toHaveClass('animate-pulse')
  })
})
