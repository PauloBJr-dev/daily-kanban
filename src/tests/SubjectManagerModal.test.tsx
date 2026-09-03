import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SubjectManagerModal } from '../components/academic/SubjectManagerModal'
import type { Subject } from '../types/academic'

describe('SubjectManagerModal', () => {
  const mockSubjects: Subject[] = [
    { id: 'sub-1', name: 'Cálculo I', color: 'indigo', code: 'MAT-101' },
    { id: 'sub-2', name: 'Física I', color: 'emerald', code: 'FIS-101' },
  ]

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    subjects: mockSubjects,
    notesCountBySubject: { 'sub-1': 3, 'sub-2': 1 },
    onAddSubject: vi.fn(),
    onDeleteSubject: vi.fn(),
  }

  it('não renderiza quando isOpen for false', () => {
    render(<SubjectManagerModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza o título, lista de disciplinas e contadores de anotações', () => {
    render(<SubjectManagerModal {...defaultProps} />)

    expect(screen.getByText('Gerenciar Disciplinas')).toBeInTheDocument()
    expect(screen.getByText('Cálculo I')).toBeInTheDocument()
    expect(screen.getByText('MAT-101')).toBeInTheDocument()
    expect(screen.getByText('3 anotação(ões) vinculada(s)')).toBeInTheDocument()
    expect(screen.getByText('Física I')).toBeInTheDocument()
    expect(screen.getByText('FIS-101')).toBeInTheDocument()
    expect(screen.getByText('1 anotação(ões) vinculada(s)')).toBeInTheDocument()
  })

  it('valida que o nome da matéria é obrigatório', () => {
    const onAddSubject = vi.fn()
    render(<SubjectManagerModal {...defaultProps} onAddSubject={onAddSubject} />)

    const addBtn = screen.getByText('Adicionar Disciplina')
    fireEvent.click(addBtn)

    expect(onAddSubject).not.toHaveBeenCalled()
  })

  it('adiciona uma nova disciplina ao submeter formulário preenchido', () => {
    const onAddSubject = vi.fn()
    render(<SubjectManagerModal {...defaultProps} onAddSubject={onAddSubject} />)

    const nameInput = screen.getByPlaceholderText('Ex: Teoria da Computação')
    fireEvent.change(nameInput, { target: { value: 'Álgebra Linear' } })

    const codeInput = screen.getByPlaceholderText('Ex: CC-301')
    fireEvent.change(codeInput, { target: { value: 'MAT-201' } })

    // Select color palette Esmeralda
    const emeraldColorBtn = screen.getByLabelText('Cor Esmeralda')
    fireEvent.click(emeraldColorBtn)

    const addBtn = screen.getByText('Adicionar Disciplina')
    fireEvent.click(addBtn)

    expect(onAddSubject).toHaveBeenCalledWith({
      name: 'Álgebra Linear',
      code: 'MAT-201',
      color: 'emerald',
    })
  })

  it('abre confirmação ao clicar em excluir e executa onDeleteSubject', () => {
    const onDeleteSubject = vi.fn()
    render(<SubjectManagerModal {...defaultProps} onDeleteSubject={onDeleteSubject} />)

    const deleteBtn = screen.getByLabelText('Excluir disciplina Cálculo I')
    fireEvent.click(deleteBtn)

    expect(screen.getByText('Excluir Disciplina?')).toBeInTheDocument()

    // Confirm deletion
    const confirmBtn = screen.getByRole('button', { name: 'Excluir Disciplina' })
    fireEvent.click(confirmBtn)

    expect(onDeleteSubject).toHaveBeenCalledWith('sub-1')
  })
})
