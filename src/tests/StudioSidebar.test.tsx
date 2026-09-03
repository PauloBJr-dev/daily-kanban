import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudioSidebar } from '../components/academic/studio/StudioSidebar'
import type { AcademicNote, Subject } from '../types/academic'

const mockSubjects: Subject[] = [
  { id: 'sub-1', name: 'Cálculo', color: 'indigo' },
  { id: 'sub-2', name: 'Algoritmos', color: 'emerald' },
]

const mockNotes: AcademicNote[] = [
  {
    id: 'note-1',
    title: 'Derivadas Parciais',
    content: 'Conteúdo de cálculo diferencial e derivadas',
    subjectId: 'sub-1',
    status: 'to_review',
    tags: ['calculo', 'derivadas'],
    isPinned: true,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'note-2',
    title: 'Árvores Binárias',
    content: 'Estruturas de dados e grafos',
    subjectId: 'sub-2',
    status: 'in_progress',
    tags: ['algoritmos', 'arvores'],
    isPinned: false,
    createdAt: '2026-09-02T10:00:00.000Z',
    updatedAt: '2026-09-02T10:00:00.000Z',
  },
]

describe('StudioSidebar', () => {
  it('renderiza título, seções de notas fixadas e todas anotações com badges', () => {
    render(
      <StudioSidebar
        notes={mockNotes}
        subjects={mockSubjects}
        selectedNoteId="note-1"
        onSelectNote={vi.fn()}
        onNewNote={vi.fn()}
        isOpen={true}
        onToggle={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        selectedSubjectId="all"
        onSelectSubject={vi.fn()}
      />
    )

    expect(screen.getByText('Caderno')).toBeInTheDocument()
    expect(screen.getByText('Fixadas')).toBeInTheDocument()
    expect(screen.getByText('Todas as Anotações')).toBeInTheDocument()
    expect(screen.getByText('Derivadas Parciais')).toBeInTheDocument()
    expect(screen.getByText('Árvores Binárias')).toBeInTheDocument()
    expect(screen.getAllByText('Cálculo').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Algoritmos').length).toBeGreaterThan(0)
  })

  it('permite a seleção de uma anotação', () => {
    const handleSelect = vi.fn()
    render(
      <StudioSidebar
        notes={mockNotes}
        subjects={mockSubjects}
        selectedNoteId="note-1"
        onSelectNote={handleSelect}
        onNewNote={vi.fn()}
        isOpen={true}
        onToggle={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        selectedSubjectId="all"
        onSelectSubject={vi.fn()}
      />
    )

    const note2Button = screen.getByLabelText('Selecionar anotação: Árvores Binárias')
    fireEvent.click(note2Button)

    expect(handleSelect).toHaveBeenCalledWith('note-2')
  })

  it('dispara busca e filtra itens por texto e tags', () => {
    const handleSearchChange = vi.fn()
    const { rerender } = render(
      <StudioSidebar
        notes={mockNotes}
        subjects={mockSubjects}
        selectedNoteId="note-1"
        onSelectNote={vi.fn()}
        onNewNote={vi.fn()}
        isOpen={true}
        onToggle={vi.fn()}
        searchQuery=""
        onSearchChange={handleSearchChange}
        selectedSubjectId="all"
        onSelectSubject={vi.fn()}
      />
    )

    const searchInput = screen.getByPlaceholderText('Buscar notas...')
    fireEvent.change(searchInput, { target: { value: 'Derivadas' } })
    expect(handleSearchChange).toHaveBeenCalledWith('Derivadas')

    // Rerender with searchQuery applied
    rerender(
      <StudioSidebar
        notes={mockNotes}
        subjects={mockSubjects}
        selectedNoteId="note-1"
        onSelectNote={vi.fn()}
        onNewNote={vi.fn()}
        isOpen={true}
        onToggle={vi.fn()}
        searchQuery="Derivadas"
        onSearchChange={handleSearchChange}
        selectedSubjectId="all"
        onSelectSubject={vi.fn()}
      />
    )

    expect(screen.getByText('Derivadas Parciais')).toBeInTheDocument()
    expect(screen.queryByText('Árvores Binárias')).not.toBeInTheDocument()

    // Test clear search button
    const clearBtn = screen.getByLabelText('Limpar busca')
    fireEvent.click(clearBtn)
    expect(handleSearchChange).toHaveBeenCalledWith('')
  })

  it('permite filtrar anotações por disciplina', () => {
    const handleSelectSubject = vi.fn()
    const { rerender } = render(
      <StudioSidebar
        notes={mockNotes}
        subjects={mockSubjects}
        selectedNoteId="note-1"
        onSelectNote={vi.fn()}
        onNewNote={vi.fn()}
        isOpen={true}
        onToggle={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        selectedSubjectId="all"
        onSelectSubject={handleSelectSubject}
      />
    )

    const subjectFilterBtn = screen.getByLabelText('Filtrar por Algoritmos')
    fireEvent.click(subjectFilterBtn)
    expect(handleSelectSubject).toHaveBeenCalledWith('sub-2')

    // Rerender with subjectId selected
    rerender(
      <StudioSidebar
        notes={mockNotes}
        subjects={mockSubjects}
        selectedNoteId="note-2"
        onSelectNote={vi.fn()}
        onNewNote={vi.fn()}
        isOpen={true}
        onToggle={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        selectedSubjectId="sub-2"
        onSelectSubject={handleSelectSubject}
      />
    )

    expect(screen.queryByText('Derivadas Parciais')).not.toBeInTheDocument()
    expect(screen.getByText('Árvores Binárias')).toBeInTheDocument()
  })

  it('dispara o callback ao clicar no botão de Nova Nota', () => {
    const handleNewNote = vi.fn()
    render(
      <StudioSidebar
        notes={mockNotes}
        subjects={mockSubjects}
        selectedNoteId="note-1"
        onSelectNote={vi.fn()}
        onNewNote={handleNewNote}
        isOpen={true}
        onToggle={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        selectedSubjectId="all"
        onSelectSubject={vi.fn()}
      />
    )

    const newNoteBtn = screen.getByLabelText('+ Nova Nota')
    fireEvent.click(newNoteBtn)
    expect(handleNewNote).toHaveBeenCalledTimes(1)
  })

  it('recolhe a sidebar ao clicar no botão de toggle', () => {
    const handleToggle = vi.fn()
    const { rerender } = render(
      <StudioSidebar
        notes={mockNotes}
        subjects={mockSubjects}
        selectedNoteId="note-1"
        onSelectNote={vi.fn()}
        onNewNote={vi.fn()}
        isOpen={true}
        onToggle={handleToggle}
        searchQuery=""
        onSearchChange={vi.fn()}
        selectedSubjectId="all"
        onSelectSubject={vi.fn()}
      />
    )

    const collapseBtn = screen.getByLabelText('Recolher barra lateral')
    fireEvent.click(collapseBtn)
    expect(handleToggle).toHaveBeenCalledTimes(1)

    // Render closed state
    rerender(
      <StudioSidebar
        notes={mockNotes}
        subjects={mockSubjects}
        selectedNoteId="note-1"
        onSelectNote={vi.fn()}
        onNewNote={vi.fn()}
        isOpen={false}
        onToggle={handleToggle}
        searchQuery=""
        onSearchChange={vi.fn()}
        selectedSubjectId="all"
        onSelectSubject={vi.fn()}
      />
    )

    const expandBtn = screen.getByLabelText('Expandir barra lateral')
    expect(expandBtn).toBeInTheDocument()
    fireEvent.click(expandBtn)
    expect(handleToggle).toHaveBeenCalledTimes(2)
  })
})
