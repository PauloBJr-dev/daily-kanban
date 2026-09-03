import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NoteCard } from '../components/academic/NoteCard'
import type { AcademicNote, Subject } from '../types/academic'

describe('NoteCard', () => {
  const sampleSubject: Subject = {
    id: 'sub-calc',
    name: 'Cálculo Diferencial',
    color: 'indigo',
    code: 'MAT-101',
  }

  const sampleNote: AcademicNote = {
    id: 'note-1',
    title: 'Teorema Fundamental do Cálculo',
    content: 'Derivadas e integrais são operações inversas com interpretação de área.',
    subjectId: 'sub-calc',
    status: 'in_progress',
    tags: ['Cálculo', 'Integrais'],
    isPinned: false,
    examDate: '2026-09-20',
    reviewDate: '2026-09-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const defaultProps = {
    note: sampleNote,
    subject: sampleSubject,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onTogglePin: vi.fn(),
    onSelectTag: vi.fn(),
  }

  it('renderiza o título, trecho de conteúdo, status, tags e datas', () => {
    render(<NoteCard {...defaultProps} />)

    expect(screen.getByText('Teorema Fundamental do Cálculo')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Derivadas e integrais são operações inversas com interpretação de área.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Em Andamento')).toBeInTheDocument()
    expect(screen.getByText('#Cálculo')).toBeInTheDocument()
    expect(screen.getByText('#Integrais')).toBeInTheDocument()
    expect(screen.getByText(/Prova:/)).toBeInTheDocument()
    expect(screen.getByText(/Revisão:/)).toBeInTheDocument()
  })

  it('renderiza o badge da disciplina com nome e código', () => {
    render(<NoteCard {...defaultProps} />)

    expect(screen.getByText('Cálculo Diferencial')).toBeInTheDocument()
    expect(screen.getByText('MAT-101')).toBeInTheDocument()
  })

  it('dispara onEdit ao clicar no título da nota', () => {
    const onEdit = vi.fn()
    render(<NoteCard {...defaultProps} onEdit={onEdit} />)

    fireEvent.click(screen.getByText('Teorema Fundamental do Cálculo'))
    expect(onEdit).toHaveBeenCalledWith(sampleNote)
  })

  it('dispara onTogglePin ao clicar no botão de pin', () => {
    const onTogglePin = vi.fn()
    render(<NoteCard {...defaultProps} onTogglePin={onTogglePin} />)

    const pinBtn = screen.getByLabelText('Fixar anotação')
    fireEvent.click(pinBtn)

    expect(onTogglePin).toHaveBeenCalledWith('note-1')
  })

  it('dispara onDelete ao selecionar excluir no menu de opções', () => {
    const onDelete = vi.fn()
    render(<NoteCard {...defaultProps} onDelete={onDelete} />)

    // Open options menu
    const menuBtn = screen.getByLabelText('Ações da anotação')
    fireEvent.click(menuBtn)

    const deleteBtn = screen.getByText('Excluir')
    fireEvent.click(deleteBtn)

    expect(onDelete).toHaveBeenCalledWith('note-1')
  })

  it('dispara onSelectTag ao clicar em uma tag', () => {
    const onSelectTag = vi.fn()
    render(<NoteCard {...defaultProps} onSelectTag={onSelectTag} />)

    const tagBtn = screen.getByText('#Cálculo')
    fireEvent.click(tagBtn)

    expect(onSelectTag).toHaveBeenCalledWith('Cálculo')
  })

  it('renderiza corretamente em modo lista', () => {
    const onTogglePin = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <NoteCard
        {...defaultProps}
        viewMode="list"
        onTogglePin={onTogglePin}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText('Teorema Fundamental do Cálculo')).toBeInTheDocument()
    expect(screen.getByText('Cálculo Diferencial')).toBeInTheDocument()

    // Test actions in list mode
    const pinBtn = screen.getByLabelText('Fixar anotação')
    fireEvent.click(pinBtn)
    expect(onTogglePin).toHaveBeenCalledWith('note-1')

    const editBtn = screen.getByLabelText('Editar anotação')
    fireEvent.click(editBtn)
    expect(onEdit).toHaveBeenCalledWith(sampleNote)

    const deleteBtn = screen.getByLabelText('Excluir anotação')
    fireEvent.click(deleteBtn)
    expect(onDelete).toHaveBeenCalledWith('note-1')
  })
})
