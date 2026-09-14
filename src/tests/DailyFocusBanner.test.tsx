import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DailyFocusBanner } from '../components/DailyFocusBanner'

describe('DailyFocusBanner', () => {
  const mockStats = {
    total: 7,
    completedCount: 4,
    completionRate: 57,
  }

  it('renderiza o título de Foco Diário e estatísticas corretamente', () => {
    render(<DailyFocusBanner stats={mockStats} focusMinutesSpent={165} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Foco Diário:/i)
    expect(screen.getByText(/4 de 7/i)).toBeInTheDocument()
    expect(screen.getByText('57%')).toBeInTheDocument()
    expect(screen.getByText('4/7 concluídas')).toBeInTheDocument()
    expect(screen.getByText('2h 45m')).toBeInTheDocument()
    expect(screen.getByText('+57%')).toBeInTheDocument()
  })

  it('exibe badge de ritmo constante quando completionRate for baixo', () => {
    render(
      <DailyFocusBanner
        stats={{
          total: 10,
          completedCount: 1,
          completionRate: 10,
        }}
        focusMinutesSpent={20}
      />
    )

    expect(screen.getByText('Ritmo Constante')).toBeInTheDocument()
    expect(screen.getByText('20m')).toBeInTheDocument()
  })

  it('exibe status de pausa do Pomodoro quando ativo', () => {
    render(
      <DailyFocusBanner
        stats={mockStats}
        pomodoroSession={{
          mode: 'work',
          timeLeft: 1440,
          isRunning: true,
        }}
      />
    )

    expect(screen.getByText('em 24 min')).toBeInTheDocument()
  })
})
