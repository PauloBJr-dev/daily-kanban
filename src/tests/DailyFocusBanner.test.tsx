import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DailyFocusBanner } from '../components/DailyFocusBanner'

describe('DailyFocusBanner (Banner Monolítico de Foco Diário e Pomodoro)', () => {
  const mockStats = {
    total: 7,
    completedCount: 4,
    completionRate: 57,
  }

  it('renderiza banner monolítico com foco diário, frase motivacional e barra linear sem sub-cards', () => {
    render(<DailyFocusBanner stats={mockStats} focusMinutesSpent={165} />)

    // Lado esquerdo: Foco Diário, Frase Motivacional e Progresso Linear
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Foco Diário:/i)
    expect(screen.getByText(/Você completou/i)).toHaveTextContent('4 de 7')
    expect(screen.getByText(/Excelente ritmo!/i)).toBeInTheDocument()
    expect(screen.getByText(/Progresso diário •/i)).toHaveTextContent(
      '4 de 7 tarefas concluídas hoje (57%)'
    )

    // Elementos antigos REMOVIDOS completamente
    expect(screen.queryByText(/Sprint Semanal/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Conclusão')).not.toBeInTheDocument()
    expect(screen.queryByText('Desempenho')).not.toBeInTheDocument()
    expect(screen.queryByText('Intervalo')).not.toBeInTheDocument()
  })

  it('renderiza badge de ritmo constante quando completionRate for baixo', () => {
    render(
      <DailyFocusBanner
        stats={{
          total: 10,
          completedCount: 1,
          completionRate: 10,
        }}
      />
    )

    expect(screen.getByText('Ritmo Constante')).toBeInTheDocument()
    expect(screen.getByText(/Progresso diário •/i)).toHaveTextContent(
      '1 de 10 tarefas concluídas hoje (10%)'
    )
    expect(
      screen.getByText(/Mantenha a consistência nos seus objetivos!/i)
    ).toBeInTheDocument()
  })

  it('renderiza o console integrado do Pomodoro no lado direito com pílulas, display digital e ações', () => {
    const onPlayPause = vi.fn()
    const onReset = vi.fn()
    const onSwitchMode = vi.fn()
    const onOpenFullscreen = vi.fn()

    render(
      <DailyFocusBanner
        stats={mockStats}
        pomodoroSession={{
          mode: 'work',
          timeLeft: 1500,
          isRunning: false,
          workDuration: 1500,
          breakDuration: 300,
        }}
        onPlayPause={onPlayPause}
        onReset={onReset}
        onSwitchMode={onSwitchMode}
        onOpenFullscreen={onOpenFullscreen}
      />
    )

    // Pílulas de seleção de modo
    expect(
      screen.getByRole('button', { name: /Ativar modo de foco de 25 minutos/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Ativar modo de pausa de 5 minutos/i })
    ).toBeInTheDocument()

    // Display digital e status
    expect(screen.getByTestId('pomodoro-digital-display')).toHaveTextContent('25 : 00')
    expect(screen.getByText(/Pronto para iniciar ciclo/i)).toBeInTheDocument()

    // Botões de ação
    const playBtn = screen.getByRole('button', { name: /Iniciar foco/i })
    expect(playBtn).toBeInTheDocument()
    fireEvent.click(playBtn)
    expect(onPlayPause).toHaveBeenCalledTimes(1)

    const resetBtn = screen.getByRole('button', { name: /Reiniciar cronômetro/i })
    expect(resetBtn).toBeInTheDocument()
    fireEvent.click(resetBtn)
    expect(onReset).toHaveBeenCalledTimes(1)

    const fullscreenBtn = screen.getByRole('button', {
      name: /Expandir para tela cheia/i,
    })
    expect(fullscreenBtn).toBeInTheDocument()
    fireEvent.click(fullscreenBtn)
    expect(onOpenFullscreen).toHaveBeenCalledTimes(1)

    // Rodapé de foco livre
    expect(screen.getByText(/Nenhuma tarefa vinculada/i)).toBeInTheDocument()
  })

  it('exibe status ativo e título da tarefa vinculada com botão de desvincular', () => {
    const onClearTask = vi.fn()

    render(
      <DailyFocusBanner
        stats={mockStats}
        pomodoroSession={{
          mode: 'work',
          timeLeft: 1440,
          isRunning: true,
          taskTitle: 'Estudar TypeScript Avançado',
          taskId: 'task-ts',
        }}
        onClearTask={onClearTask}
      />
    )

    expect(screen.getByText(/Em foco ativo/i)).toBeInTheDocument()
    expect(screen.getByText(/Estudar TypeScript Avançado/i)).toBeInTheDocument()

    const clearBtn = screen.getByRole('button', { name: /Desvincular tarefa do timer/i })
    expect(clearBtn).toBeInTheDocument()
    fireEvent.click(clearBtn)
    expect(onClearTask).toHaveBeenCalledTimes(1)
  })
})
