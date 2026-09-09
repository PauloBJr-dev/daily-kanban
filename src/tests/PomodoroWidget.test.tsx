import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PomodoroWidget } from '../components/PomodoroWidget'
import type { PomodoroSession } from '../types/kanban'

describe('PomodoroWidget component', () => {
  const defaultSession: PomodoroSession = {
    taskId: 'task-1',
    taskTitle: 'Escrever Testes Automatizados',
    timeLeft: 25 * 60,
    isRunning: false,
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

  it('renderiza o widget com tempo, modo de foco e título da tarefa vinculada', () => {
    render(
      <PomodoroWidget
        session={defaultSession}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClearTask={vi.fn()}
        formatTime={formatTime}
      />
    )

    expect(screen.getByText('Bloco de Foco Diário')).toBeInTheDocument()
    expect(screen.getByText('🎯 Escrever Testes Automatizados')).toBeInTheDocument()
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('renderiza botão de tela cheia e dispara onOpenFullscreen ao clicar', () => {
    const onOpenFullscreen = vi.fn()
    render(
      <PomodoroWidget
        session={defaultSession}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClearTask={vi.fn()}
        formatTime={formatTime}
        onOpenFullscreen={onOpenFullscreen}
      />
    )

    const maximizeBtn = screen.getByRole('button', { name: /expandir para tela cheia/i })
    expect(maximizeBtn).toBeInTheDocument()

    fireEvent.click(maximizeBtn)
    expect(onOpenFullscreen).toHaveBeenCalledTimes(1)
  })

  it('aplica sinal visual pulsante no widget minimizado nos últimos 5 segundos', () => {
    const nearEndSession: PomodoroSession = {
      ...defaultSession,
      timeLeft: 4,
      isRunning: true,
    }

    const { rerender } = render(
      <PomodoroWidget
        session={nearEndSession}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClearTask={vi.fn()}
        formatTime={formatTime}
      />
    )

    const widget = screen.getByTestId('pomodoro-widget')
    expect(widget).toHaveClass('animate-pulse')
    expect(widget).toHaveClass('ring-2')
    expect(widget).toHaveClass('ring-amber-500/60')

    // Quando o tempo é maior que 5s, não deve ter pulsação
    rerender(
      <PomodoroWidget
        session={{ ...defaultSession, timeLeft: 10, isRunning: true }}
        onPlayPause={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
        onClearTask={vi.fn()}
        formatTime={formatTime}
      />
    )
    expect(widget).not.toHaveClass('animate-pulse')
  })

  it('dispara onPlayPause e onReset ao interagir com os botões', () => {
    const onPlayPause = vi.fn()
    const onReset = vi.fn()

    render(
      <PomodoroWidget
        session={defaultSession}
        onPlayPause={onPlayPause}
        onReset={onReset}
        onSwitchMode={vi.fn()}
        onClearTask={vi.fn()}
        formatTime={formatTime}
      />
    )

    const playBtn = screen.getByRole('button', { name: /iniciar foco/i })
    fireEvent.click(playBtn)
    expect(onPlayPause).toHaveBeenCalledTimes(1)

    const resetBtn = screen.getByRole('button', { name: /reiniciar cronômetro/i })
    fireEvent.click(resetBtn)
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
