import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileStatsGrid } from '../components/profile/ProfileStatsGrid'

describe('ProfileStatsGrid Component', () => {
  it('renderiza os 4 Bento Cards de produtividade com seus valores e rótulos', () => {
    render(
      <ProfileStatsGrid
        totalTasks={20}
        completedTasks={15}
        notesCount={8}
        pomodoroFormatted="3h 45m"
      />
    )

    expect(screen.getByText('Resumo de Produtividade da Conta')).toBeInTheDocument()
    expect(screen.getByText('Total de Tarefas')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('No quadro Kanban')).toBeInTheDocument()

    expect(screen.getByText('Tarefas Concluídas')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()

    expect(screen.getByText('Anotações Acadêmicas')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()

    expect(screen.getByText('Tempo de Foco')).toBeInTheDocument()
    expect(screen.getByText('3h 45m')).toBeInTheDocument()
  })

  it('lida graciosamente com 0 tarefas sem divisão por zero', () => {
    render(
      <ProfileStatsGrid
        totalTasks={0}
        completedTasks={0}
        notesCount={0}
        pomodoroFormatted="0 min"
      />
    )

    expect(screen.getByText('Total de Tarefas')).toBeInTheDocument()
    expect(screen.queryByText('%')).not.toBeInTheDocument()
    expect(screen.getByText('0 min')).toBeInTheDocument()
  })
})
