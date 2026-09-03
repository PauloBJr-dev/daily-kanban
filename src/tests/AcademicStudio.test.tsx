import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AcademicStudio } from '../components/academic/studio/AcademicStudio'
import type { AcademicNote, Subject } from '../types/academic'

const mockSubjects: Subject[] = [
  { id: 'sub-1', name: 'Cálculo', color: 'indigo' },
  { id: 'sub-2', name: 'Algoritmos', color: 'emerald' },
]

const mockNotes: AcademicNote[] = [
  {
    id: 'note-1',
    title: 'Nota de Cálculo',
    content: 'Conteúdo da nota de cálculo',
    subjectId: 'sub-1',
    status: 'to_review',
    tags: ['calculo'],
    isPinned: true,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'note-2',
    title: 'Nota de Algoritmos',
    content: 'Conteúdo da nota de algoritmos',
    subjectId: 'sub-2',
    status: 'in_progress',
    tags: ['algoritmos'],
    isPinned: false,
    createdAt: '2026-09-02T10:00:00.000Z',
    updatedAt: '2026-09-02T10:00:00.000Z',
  },
]

describe('AcademicStudio', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza os painéis integrados com a primeira nota ativa por padrão', () => {
    render(<AcademicStudio notes={mockNotes} subjects={mockSubjects} />)

    // Sidebar exists with Caderno
    expect(screen.getByText('Caderno')).toBeInTheDocument()
    expect(screen.getByText('Nota de Cálculo')).toBeInTheDocument()
    expect(screen.getByText('Nota de Algoritmos')).toBeInTheDocument()

    // Editor displays the active note (fallback to first note)
    const titleInput = screen.getByLabelText('Título da anotação')
    expect(titleInput).toHaveValue('Nota de Cálculo')
    const contentTextarea = screen.getByLabelText('Conteúdo da anotação')
    expect(contentTextarea).toHaveValue('Conteúdo da nota de cálculo')
  })

  it('permite selecionar diferentes notas atualizando o editor', () => {
    const handleSelectNote = vi.fn()
    render(
      <AcademicStudio
        notes={mockNotes}
        subjects={mockSubjects}
        onSelectNote={handleSelectNote}
      />
    )

    const note2Item = screen.getByLabelText('Selecionar anotação: Nota de Algoritmos')
    fireEvent.click(note2Item)

    expect(handleSelectNote).toHaveBeenCalledWith('note-2')

    const titleInput = screen.getByLabelText('Título da anotação')
    expect(titleInput).toHaveValue('Nota de Algoritmos')
    const contentTextarea = screen.getByLabelText('Conteúdo da anotação')
    expect(contentTextarea).toHaveValue('Conteúdo da nota de algoritmos')
  })

  it('permite criar nova nota via prop customizada', () => {
    const createdNote: AcademicNote = {
      id: 'note-new',
      title: 'Nota Recém Criada',
      content: 'Conteúdo da nova nota',
      subjectId: 'sub-1',
      status: 'to_review',
      tags: [],
      isPinned: false,
      createdAt: '2026-09-03T10:00:00.000Z',
      updatedAt: '2026-09-03T10:00:00.000Z',
    }
    const handleNewNote = vi.fn(() => createdNote)

    render(
      <AcademicStudio
        notes={[...mockNotes, createdNote]}
        subjects={mockSubjects}
        onNewNote={handleNewNote}
      />
    )

    const newBtn = screen.getByLabelText('+ Nova Nota')
    fireEvent.click(newBtn)

    expect(handleNewNote).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Título da anotação')).toHaveValue('Nota Recém Criada')
  })

  it('alterna o estado da sidebar (recolher e expandir)', () => {
    render(<AcademicStudio notes={mockNotes} subjects={mockSubjects} />)

    // Initially open
    expect(screen.getByText('Caderno')).toBeInTheDocument()

    // Collapse
    const collapseBtn = screen.getByLabelText('Recolher barra lateral')
    fireEvent.click(collapseBtn)

    // Sidebar is collapsed (Caderno text hidden, expand button shown)
    expect(screen.queryByText('Caderno')).not.toBeInTheDocument()
    const expandBtn = screen.getByLabelText('Expandir barra lateral')
    expect(expandBtn).toBeInTheDocument()

    // Expand again
    fireEvent.click(expandBtn)
    expect(screen.getByText('Caderno')).toBeInTheDocument()
  })

  it('alterna o Modo Zen ocultando a barra lateral para imersão total', () => {
    render(<AcademicStudio notes={mockNotes} subjects={mockSubjects} />)

    expect(screen.getByText('Caderno')).toBeInTheDocument()

    // Enter Zen Mode
    const zenBtn = screen.getByLabelText('Modo Zen')
    fireEvent.click(zenBtn)

    // Sidebar should be completely removed from DOM
    expect(screen.queryByText('Caderno')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Expandir barra lateral')).not.toBeInTheDocument()

    // Exit Zen Mode via button
    const exitZenBtn = screen.getByLabelText('Sair do Modo Zen')
    fireEvent.click(exitZenBtn)

    expect(screen.getByText('Caderno')).toBeInTheDocument()
  })

  it('chama onBackToGrid quando fornecido', () => {
    const handleBackToGrid = vi.fn()
    render(
      <AcademicStudio
        notes={mockNotes}
        subjects={mockSubjects}
        onBackToGrid={handleBackToGrid}
      />
    )

    const backBtn = screen.getByLabelText('Voltar para Grade')
    fireEvent.click(backBtn)
    expect(handleBackToGrid).toHaveBeenCalledTimes(1)
  })
})
