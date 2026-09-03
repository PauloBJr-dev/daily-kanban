import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { AcademicView } from '../components/academic/AcademicView'

describe('AcademicView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza os cards de estatísticas acadêmicas', () => {
    render(<AcademicView />)

    const statsSection = screen.getByRole('region', {
      name: 'Estatísticas Acadêmicas',
    })
    expect(within(statsSection).getByText('Total de Anotações')).toBeInTheDocument()
    expect(within(statsSection).getByText('Disciplinas Ativas')).toBeInTheDocument()
    expect(within(statsSection).getByText('A Revisar')).toBeInTheDocument()
    expect(within(statsSection).getByText('Dominadas')).toBeInTheDocument()
    expect(within(statsSection).getByText('Fixadas')).toBeInTheDocument()
  })

  it('renderiza a lista inicial de notas e as disciplinas na barra de filtros', () => {
    render(<AcademicView />)

    // Check seed notes
    expect(
      screen.getByText('Teorema Fundamental do Cálculo e Aplicações de Derivadas')
    ).toBeInTheDocument()
    expect(screen.getByText('Árvores Balanceadas: AVL e Rubro-Negra')).toBeInTheDocument()

    // Check subject pills in filter section
    const filterSection = screen.getByRole('region', {
      name: 'Filtros e Busca Acadêmica',
    })
    expect(within(filterSection).getByText('Todas Disciplinas')).toBeInTheDocument()
    expect(
      within(filterSection).getByText('Cálculo Diferencial e Integral')
    ).toBeInTheDocument()
    expect(
      within(filterSection).getByText('Estruturas de Dados e Algoritmos')
    ).toBeInTheDocument()
  })

  it('filtra anotações pelo campo de busca', () => {
    render(<AcademicView />)

    const searchInput = screen.getByPlaceholderText('Buscar notas, tags ou conteúdo...')
    fireEvent.change(searchInput, { target: { value: 'Backpropagation' } })

    expect(
      screen.getByText('Backpropagation e Otimizadores Gradiente Descendente')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Teorema Fundamental do Cálculo e Aplicações de Derivadas')
    ).not.toBeInTheDocument()
  })

  it('filtra anotações por status', () => {
    render(<AcademicView />)

    const toReviewBtn = screen.getByLabelText('Filtrar por status: Para Revisar')
    fireEvent.click(toReviewBtn)

    // note-2 (Árvores Balanceadas) is to_review
    expect(screen.getByText('Árvores Balanceadas: AVL e Rubro-Negra')).toBeInTheDocument()
    // note-3 (Camada de Transporte) is mastered -> should not be visible
    expect(
      screen.queryByText('Camada de Transporte: TCP vs UDP e Handshake de 3 Vias')
    ).not.toBeInTheDocument()
  })

  it('abre o modal de Nova Anotação ao clicar no botão correspondente', () => {
    render(<AcademicView />)

    const newNoteBtn = screen.getByLabelText('Criar nova anotação')
    fireEvent.click(newNoteBtn)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Nova Anotação Acadêmica')).toBeInTheDocument()

    // Close modal
    const cancelBtn = screen.getByText('Cancelar')
    fireEvent.click(cancelBtn)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('abre o modal de gerenciamento de disciplinas ao clicar em Disciplinas', () => {
    render(<AcademicView />)

    const manageSubjectsBtn = screen.getByLabelText('Gerenciar disciplinas')
    fireEvent.click(manageSubjectsBtn)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Gerenciar Disciplinas')).toBeInTheDocument()

    // Close modal
    const closeBtn = screen.getByText('Concluído')
    fireEvent.click(closeBtn)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('alterna o modo de visualização entre grade e lista', () => {
    render(<AcademicView />)

    const listModeBtn = screen.getByLabelText('Visualização em lista')
    fireEvent.click(listModeBtn)

    // Note is still rendered, viewMode persisted
    expect(
      screen.getByText('Teorema Fundamental do Cálculo e Aplicações de Derivadas')
    ).toBeInTheDocument()

    const gridModeBtn = screen.getByLabelText('Visualização em grade')
    fireEvent.click(gridModeBtn)

    expect(
      screen.getByText('Teorema Fundamental do Cálculo e Aplicações de Derivadas')
    ).toBeInTheDocument()
  })
})
