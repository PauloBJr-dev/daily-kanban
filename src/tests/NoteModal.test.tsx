import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NoteModal } from '../components/academic/NoteModal'
import type { AcademicNote, Subject } from '../types/academic'

describe('NoteModal', () => {
  const mockSubjects: Subject[] = [
    { id: 'sub-calc', name: 'Cálculo I', color: 'indigo', code: 'MAT-101' },
    { id: 'sub-eda', name: 'Estrutura de Dados', color: 'emerald', code: 'CC-201' },
  ]

  const existingNote: AcademicNote = {
    id: 'note-100',
    title: 'Árvores AVL e Balanceamento',
    content: 'Rotações LL, RR, LR, RL para manter altura O(log n).',
    subjectId: 'sub-eda',
    status: 'in_progress',
    tags: ['Árvores', 'AVL'],
    isPinned: true,
    examDate: '2026-09-30',
    reviewDate: '2026-09-22',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    onDelete: vi.fn(),
    subjects: mockSubjects,
    availableTags: ['Árvores', 'AVL', 'Complexidade', 'Grafos'],
  }

  it('não renderiza quando isOpen for false', () => {
    render(<NoteModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza em modo de criação quando note não é informada', () => {
    render(<NoteModal {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Nova Anotação Acadêmica')).toBeInTheDocument()
    expect(screen.getByText('Criar Anotação')).toBeInTheDocument()
  })

  it('valida que o título é obrigatório ao tentar salvar em branco', () => {
    const onSave = vi.fn()
    render(<NoteModal {...defaultProps} onSave={onSave} />)

    const submitBtn = screen.getByText('Criar Anotação')
    fireEvent.click(submitBtn)

    expect(screen.getByText('O título da anotação é obrigatório.')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('cria uma nova anotação com preenchimento completo e submissão', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    render(<NoteModal {...defaultProps} onSave={onSave} onClose={onClose} />)

    // Fill title
    const titleInput = screen.getByPlaceholderText(
      'Ex: Teorema Central do Limite e Intervalos de Confiança'
    )
    fireEvent.change(titleInput, {
      target: { value: 'Dijkstra e Menor Caminho' },
    })

    // Fill content
    const contentInput = screen.getByPlaceholderText(
      'Escreva anotações, fórmulas, deduções, resumos e referências...'
    )
    fireEvent.change(contentInput, {
      target: { value: 'Algoritmo guloso com fila de prioridade min-heap.' },
    })

    // Select status Dominado
    const masteredBtn = screen.getByText('Dominado')
    fireEvent.click(masteredBtn)

    // Check pin to top
    const pinCheckbox = screen.getByRole('checkbox')
    fireEvent.click(pinCheckbox)

    // Add tag
    const tagInput = screen.getByPlaceholderText('Nova tag... (Pressione Enter)')
    fireEvent.change(tagInput, { target: { value: 'Grafos' } })
    const addTagBtn = screen.getByText('Inserir')
    fireEvent.click(addTagBtn)

    expect(screen.getByText('#Grafos')).toBeInTheDocument()

    // Submit form
    const submitBtn = screen.getByText('Criar Anotação')
    fireEvent.click(submitBtn)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Dijkstra e Menor Caminho',
        content: 'Algoritmo guloso com fila de prioridade min-heap.',
        status: 'mastered',
        isPinned: true,
        tags: expect.arrayContaining(['Grafos']),
      }),
      undefined
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('renderiza em modo de edição com dados pré-preenchidos', () => {
    render(<NoteModal {...defaultProps} note={existingNote} />)

    expect(screen.getByText('Editar Anotação Acadêmica')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Árvores AVL e Balanceamento')).toBeInTheDocument()
    expect(
      screen.getByDisplayValue('Rotações LL, RR, LR, RL para manter altura O(log n).')
    ).toBeInTheDocument()
    expect(screen.getByText('#Árvores')).toBeInTheDocument()
    expect(screen.getByText('#AVL')).toBeInTheDocument()
    expect(screen.getByText('Salvar Alterações')).toBeInTheDocument()
  })

  it('chama onDelete quando botão de excluir anotação é clicado', () => {
    const onDelete = vi.fn()
    render(<NoteModal {...defaultProps} note={existingNote} onDelete={onDelete} />)

    const deleteBtn = screen.getByText('Excluir Anotação')
    fireEvent.click(deleteBtn)

    expect(onDelete).toHaveBeenCalledWith('note-100')
  })

  it('chama onClose ao clicar em Cancelar ou no botão X', () => {
    const onClose = vi.fn()
    render(<NoteModal {...defaultProps} onClose={onClose} />)

    const cancelBtn = screen.getByText('Cancelar')
    fireEvent.click(cancelBtn)

    expect(onClose).toHaveBeenCalled()
  })
})
