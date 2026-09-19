import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AcademicSection } from '../components/settings/AcademicSection'
import { academicStorageService } from '../services/academicStorageService'

describe('AcademicSection Component', () => {
  const onOpenAcademicSubjects = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem(
      academicStorageService.getStorageKey(),
      JSON.stringify({
        subjects: [{ id: 'sub-1', name: 'Algoritmos', color: 'indigo' }],
        notes: [
          {
            id: 'note-1',
            title: 'Estruturas de Dados',
            content: 'Pilhas e Filas',
            subjectId: 'sub-1',
            status: 'to_review',
            tags: ['Estrutura'],
            isPinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        version: 1,
      })
    )
  })

  it('renderiza título, contador de notas e disciplinas e botão para acessar caderno', () => {
    render(<AcademicSection onOpenAcademicSubjects={onOpenAcademicSubjects} />)

    expect(screen.getByText('Espaço Acadêmico & Caderno')).toBeInTheDocument()
    expect(screen.getAllByText('1')).toHaveLength(2)
    expect(screen.getByText(/disciplinas/i)).toBeInTheDocument()
    expect(screen.getByText(/anotações de estudo/i)).toBeInTheDocument()

    const accessBtn = screen.getByRole('button', { name: /acessar espaço acadêmico/i })
    expect(accessBtn).toBeInTheDocument()
    fireEvent.click(accessBtn)
    expect(onOpenAcademicSubjects).toHaveBeenCalledTimes(1)
  })

  it('dispara a exportação de backup ao clicar em Exportar Anotações (JSON)', () => {
    const exportSpy = vi
      .spyOn(academicStorageService, 'exportJSON')
      .mockImplementation(() => {})

    render(<AcademicSection onOpenAcademicSubjects={onOpenAcademicSubjects} />)

    const exportBtn = screen.getByRole('button', {
      name: 'Exportar anotações e disciplinas em JSON',
    })
    fireEvent.click(exportBtn)

    expect(exportSpy).toHaveBeenCalledTimes(1)
  })

  it('abre diálogo de confirmação ao clicar em Restaurar Demonstração e exige confirmação', () => {
    render(<AcademicSection onOpenAcademicSubjects={onOpenAcademicSubjects} />)

    const resetBtn = screen.getByRole('button', {
      name: 'Restaurar dados acadêmicos de demonstração',
    })
    fireEvent.click(resetBtn)

    // Modal opens
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Restaurar Dados Padrão Acadêmicos')).toBeInTheDocument()
    expect(
      screen.getByText(/todas as anotações e disciplinas atuais serão substituídas/i)
    ).toBeInTheDocument()

    // Confirmation button disabled until RESTAURAR is typed
    const confirmBtn = screen.getByRole('button', { name: 'Restaurar Dados' })
    expect(confirmBtn).toBeDisabled()

    const input = screen.getByPlaceholderText('Digite "RESTAURAR"')
    fireEvent.change(input, { target: { value: 'RESTAURAR' } })

    expect(confirmBtn).not.toBeDisabled()
    fireEvent.click(confirmBtn)

    // Modal closes
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
