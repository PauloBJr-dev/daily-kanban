import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudioEditor } from '../components/academic/studio/StudioEditor'
import type { AcademicNote, Subject } from '../types/academic'

const mockSubjects: Subject[] = [
  { id: 'sub-1', name: 'Cálculo', color: 'indigo' },
  { id: 'sub-2', name: 'Algoritmos', color: 'emerald' },
]

const mockNote: AcademicNote = {
  id: 'note-1',
  title: 'Derivadas Parciais',
  content: 'Uma duas três quatro cinco palavras',
  subjectId: 'sub-1',
  status: 'to_review',
  tags: ['calculo', 'derivadas'],
  isPinned: false,
  examDate: '2026-09-15',
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
}

describe('StudioEditor', () => {
  it('exibe estado vazio com mensagem amigável e botão quando note === null', () => {
    const handleNewNote = vi.fn()
    render(
      <StudioEditor
        note={null}
        subjects={mockSubjects}
        onUpdateNote={vi.fn()}
        isZenMode={false}
        onToggleZenMode={vi.fn()}
        onNewNote={handleNewNote}
      />
    )

    expect(screen.getByText('Nenhuma anotação selecionada')).toBeInTheDocument()
    const createBtn = screen.getByText('Criar Nova Nota')
    fireEvent.click(createBtn)
    expect(handleNewNote).toHaveBeenCalledTimes(1)
  })

  it('permite a edição de título', () => {
    const handleUpdate = vi.fn()
    render(
      <StudioEditor
        note={mockNote}
        subjects={mockSubjects}
        onUpdateNote={handleUpdate}
        isZenMode={false}
        onToggleZenMode={vi.fn()}
      />
    )

    const titleInput = screen.getByLabelText('Título da anotação')
    expect(titleInput).toHaveValue('Derivadas Parciais')

    fireEvent.change(titleInput, { target: { value: 'Derivadas Direcionais' } })
    expect(handleUpdate).toHaveBeenCalledWith('note-1', {
      title: 'Derivadas Direcionais',
    })
  })

  it('permite a edição de conteúdo', () => {
    const handleUpdate = vi.fn()
    render(
      <StudioEditor
        note={mockNote}
        subjects={mockSubjects}
        onUpdateNote={handleUpdate}
        isZenMode={false}
        onToggleZenMode={vi.fn()}
      />
    )

    const contentTextarea = screen.getByLabelText('Conteúdo da anotação')
    expect(contentTextarea).toHaveValue('Uma duas três quatro cinco palavras')

    fireEvent.change(contentTextarea, {
      target: { value: 'Novo conteúdo de estudo aprofundado' },
    })
    expect(handleUpdate).toHaveBeenCalledWith('note-1', {
      content: 'Novo conteúdo de estudo aprofundado',
    })
  })

  it('permite alterar status e disciplina da anotação', () => {
    const handleUpdate = vi.fn()
    render(
      <StudioEditor
        note={mockNote}
        subjects={mockSubjects}
        onUpdateNote={handleUpdate}
        isZenMode={false}
        onToggleZenMode={vi.fn()}
      />
    )

    // Alterar disciplina
    const subjectSelect = screen.getByLabelText('Selecionar disciplina')
    expect(subjectSelect).toHaveValue('sub-1')
    fireEvent.change(subjectSelect, { target: { value: 'sub-2' } })
    expect(handleUpdate).toHaveBeenCalledWith('note-1', { subjectId: 'sub-2' })

    // Alterar status
    const statusSelect = screen.getByLabelText('Selecionar status')
    expect(statusSelect).toHaveValue('to_review')
    fireEvent.change(statusSelect, { target: { value: 'mastered' } })
    expect(handleUpdate).toHaveBeenCalledWith('note-1', { status: 'mastered' })
  })

  it('gerencia tags permitindo adicionar e remover', () => {
    const handleUpdate = vi.fn()
    render(
      <StudioEditor
        note={mockNote}
        subjects={mockSubjects}
        onUpdateNote={handleUpdate}
        isZenMode={false}
        onToggleZenMode={vi.fn()}
      />
    )

    // Remover tag
    const removeTagBtn = screen.getByLabelText('Remover tag calculo')
    fireEvent.click(removeTagBtn)
    expect(handleUpdate).toHaveBeenCalledWith('note-1', { tags: ['derivadas'] })

    // Adicionar nova tag
    const addTagBtn = screen.getByLabelText('Adicionar tag')
    fireEvent.click(addTagBtn)

    const tagInput = screen.getByLabelText('Nova tag')
    fireEvent.change(tagInput, { target: { value: 'limites' } })
    fireEvent.submit(tagInput.closest('form')!)

    expect(handleUpdate).toHaveBeenCalledWith('note-1', {
      tags: ['calculo', 'derivadas', 'limites'],
    })
  })

  it('exibe o contador de palavras, caracteres, tempo de leitura e status salvo', () => {
    render(
      <StudioEditor
        note={mockNote}
        subjects={mockSubjects}
        onUpdateNote={vi.fn()}
        isZenMode={false}
        onToggleZenMode={vi.fn()}
      />
    )

    expect(screen.getByText('6 palavras')).toBeInTheDocument()
    expect(screen.getByText('35 caracteres')).toBeInTheDocument()
    expect(screen.getByText('~1 min de leitura')).toBeInTheDocument()
    expect(screen.getByText('Salvo no navegador')).toBeInTheDocument()
  })

  it('alterna o modo zen e botão de fixar', () => {
    const handleToggleZen = vi.fn()
    const handleTogglePin = vi.fn()
    const { rerender } = render(
      <StudioEditor
        note={mockNote}
        subjects={mockSubjects}
        onUpdateNote={vi.fn()}
        onTogglePin={handleTogglePin}
        isZenMode={false}
        onToggleZenMode={handleToggleZen}
      />
    )

    // Modo Zen
    const zenBtn = screen.getByLabelText('Modo Zen')
    fireEvent.click(zenBtn)
    expect(handleToggleZen).toHaveBeenCalledTimes(1)

    // Rerender in Zen mode
    rerender(
      <StudioEditor
        note={mockNote}
        subjects={mockSubjects}
        onUpdateNote={vi.fn()}
        onTogglePin={handleTogglePin}
        isZenMode={true}
        onToggleZenMode={handleToggleZen}
      />
    )
    expect(screen.getByLabelText('Sair do Modo Zen')).toBeInTheDocument()

    // Pin
    const pinBtn = screen.getByLabelText('Fixar anotação')
    fireEvent.click(pinBtn)
    expect(handleTogglePin).toHaveBeenCalledWith('note-1')
  })

  it('solicita confirmação e exclui anotação', () => {
    const handleDelete = vi.fn()
    render(
      <StudioEditor
        note={mockNote}
        subjects={mockSubjects}
        onUpdateNote={vi.fn()}
        onDeleteNote={handleDelete}
        isZenMode={false}
        onToggleZenMode={vi.fn()}
      />
    )

    const deleteBtn = screen.getByLabelText('Excluir anotação')
    fireEvent.click(deleteBtn)

    // Confirm dialog opened
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Excluir Anotação' })).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: 'Excluir Anotação' })
    fireEvent.click(confirmBtn)

    expect(handleDelete).toHaveBeenCalledWith('note-1')
  })
})
