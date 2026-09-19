import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColumnSelect } from '../components/ColumnSelect'
import type { Column } from '../types/kanban'

describe('ColumnSelect Component', () => {
  const mockColumns: Column[] = [
    { id: 'col-todo', title: 'A Fazer', order: 0, colorTheme: 'blue' },
    { id: 'col-doing', title: 'Em Progresso', order: 1, colorTheme: 'amber' },
    { id: 'col-review', title: 'Em Revisão', order: 2, colorTheme: 'purple' },
    { id: 'col-done', title: 'Concluído', order: 3, colorTheme: 'emerald' },
  ]

  it('renderiza o botão disparador com o título e dot da coluna selecionada', () => {
    render(<ColumnSelect columns={mockColumns} value="col-doing" onChange={vi.fn()} />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Em Progresso')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('abre o menu suspenso ao clicar no disparador e exibe todas as opções com check na ativa', () => {
    render(<ColumnSelect columns={mockColumns} value="col-doing" onChange={vi.fn()} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(4)
    expect(options[0]).toHaveTextContent('A Fazer')
    expect(options[1]).toHaveTextContent('Em Progresso')
    expect(options[1]).toHaveAttribute('aria-selected', 'true')
    expect(options[2]).toHaveTextContent('Em Revisão')
    expect(options[3]).toHaveTextContent('Concluído')
  })

  it('seleciona uma nova coluna e fecha o dropdown ao clicar em uma opção', () => {
    const onChange = vi.fn()
    render(<ColumnSelect columns={mockColumns} value="col-todo" onChange={onChange} />)

    fireEvent.click(screen.getByRole('combobox'))
    const reviewOption = screen.getByRole('option', { name: /Em Revisão/ })
    fireEvent.click(reviewOption)

    expect(onChange).toHaveBeenCalledWith('col-review')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('fecha o dropdown ao pressionar Escape sem propagar para modais pais', () => {
    render(<ColumnSelect columns={mockColumns} value="col-todo" onChange={vi.fn()} />)

    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('fecha o dropdown ao clicar fora do componente', () => {
    render(
      <div>
        <div data-testid="outside">Fora</div>
        <ColumnSelect columns={mockColumns} value="col-todo" onChange={vi.fn()} />
      </div>
    )

    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
