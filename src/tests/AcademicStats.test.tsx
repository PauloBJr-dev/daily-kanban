import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AcademicStats } from '../components/academic/AcademicStats'
import type { Subject, AcademicStats as AcademicStatsType } from '../types/academic'

describe('AcademicStats Component', () => {
  const mockStats: AcademicStatsType = {
    totalNotes: 12,
    toReviewCount: 3,
    inProgressCount: 1,
    masteredCount: 8,
    subjectsCount: 2,
    pinnedCount: 1,
  }

  const mockSubjects: Subject[] = [
    { id: 'sub-1', name: 'Cálculo', color: 'indigo' },
    { id: 'sub-2', name: 'Algoritmos', color: 'emerald' },
  ]

  it('renderiza os 4 bento cards de estatísticas', () => {
    render(<AcademicStats stats={mockStats} subjects={mockSubjects} />)

    expect(screen.getByText('Disciplinas Ativas')).toBeInTheDocument()
    expect(screen.getByText('Anotações Criadas')).toBeInTheDocument()
    expect(screen.getByText('Revisão Espaçada')).toBeInTheDocument()
    expect(screen.getByText('Retenção Estimada')).toBeInTheDocument()
  })

  it('NÃO renderiza o cabeçalho superior antigo nem o card de Algoritmo Spaced Repetition', () => {
    render(<AcademicStats stats={mockStats} subjects={mockSubjects} />)

    // O título "Espaço Acadêmico" e o card SM-2 foram removidos do componente
    expect(
      screen.queryByRole('heading', { name: 'Espaço Acadêmico' })
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Algoritmo Spaced Repetition')).not.toBeInTheDocument()
  })

  it('exibe as matérias cadastradas com suas tags de cores quando houver disciplinas', () => {
    render(<AcademicStats stats={mockStats} subjects={mockSubjects} />)

    expect(screen.getByText('Cálculo')).toBeInTheDocument()
    expect(screen.getByText('Algoritmos')).toBeInTheDocument()
    expect(screen.queryByText('Nenhuma disciplina cadastrada')).not.toBeInTheDocument()
  })

  it('exibe o estado vazio discreto "Nenhuma disciplina cadastrada" quando a lista estiver vazia', () => {
    render(<AcademicStats stats={{ ...mockStats, subjectsCount: 0 }} subjects={[]} />)

    expect(screen.getByText('Nenhuma disciplina cadastrada')).toBeInTheDocument()
    expect(screen.queryByText('Cálc I')).not.toBeInTheDocument()
    expect(screen.queryByText('ED')).not.toBeInTheDocument()
    expect(screen.queryByText('IA')).not.toBeInTheDocument()
    expect(screen.queryByText('ES')).not.toBeInTheDocument()
  })
})
