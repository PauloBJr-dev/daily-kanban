import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskModal } from '../components/TaskModal'
import type { Column, Task } from '../types/kanban'

describe('TaskModal', () => {
  const mockColumns: Column[] = [
    { id: 'col-todo', title: 'A Fazer', order: 0, colorTheme: 'blue' },
    { id: 'col-doing', title: 'Em Progresso', order: 1, colorTheme: 'amber' },
    { id: 'col-done', title: 'Concluído', order: 2, colorTheme: 'emerald' },
  ]

  const existingTask: Task = {
    id: 'task-100',
    title: 'Desenhar Mockup UI',
    description: 'Criar wireframe no Figma',
    columnId: 'col-todo',
    priority: 'urgent',
    tags: ['Design', 'UI'],
    dueDate: '2026-09-05',
    subtasks: [{ id: 'sub-1', title: 'Paleta de Cores', completed: true }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pomodoroMinutesSpent: 25,
  }

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    onDelete: vi.fn(),
    columns: mockColumns,
    availableTags: ['Design', 'Dev', 'Docs'],
  }

  it('não renderiza quando isOpen for false', () => {
    render(<TaskModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza em modo de criação quando task não é informada', () => {
    render(<TaskModal {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Nova Tarefa')).toBeInTheDocument()
    expect(screen.getByText('Criar Tarefa')).toBeInTheDocument()
  })

  it('valida que o título é obrigatório ao tentar salvar em branco', () => {
    const onSave = vi.fn()
    render(<TaskModal {...defaultProps} onSave={onSave} />)

    const submitBtn = screen.getByText('Criar Tarefa')
    fireEvent.click(submitBtn)

    expect(screen.getByText('O título da tarefa é obrigatório.')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('cria uma nova tarefa com título, tags e subtarefas preenchidas', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    render(<TaskModal {...defaultProps} onSave={onSave} onClose={onClose} />)

    // Fill title
    const titleInput = screen.getByPlaceholderText(
      'Ex: Revisar layout da nova landing page'
    )
    fireEvent.change(titleInput, { target: { value: 'Escrever Testes' } })

    // Select priority Alta
    const highPriorityBtn = screen.getByText('Alta')
    fireEvent.click(highPriorityBtn)

    // Add subtask
    const subtaskInput = screen.getByPlaceholderText(
      'Adicionar item ao checklist... (Pressione Enter)'
    )
    fireEvent.change(subtaskInput, { target: { value: 'Testes Unitários' } })
    const addSubtaskBtn = screen.getByText('Adicionar')
    fireEvent.click(addSubtaskBtn)

    expect(screen.getByText('Testes Unitários')).toBeInTheDocument()

    // Add tag
    const tagInput = screen.getByPlaceholderText('Nova tag... (Enter)')
    fireEvent.change(tagInput, { target: { value: 'QA' } })
    const addTagBtn = screen.getByText('Inserir')
    fireEvent.click(addTagBtn)

    expect(screen.getByText('#QA')).toBeInTheDocument()

    // Submit form
    const submitBtn = screen.getByText('Criar Tarefa')
    fireEvent.click(submitBtn)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Escrever Testes',
        priority: 'high',
        tags: ['QA'],
        subtasks: expect.arrayContaining([
          expect.objectContaining({
            title: 'Testes Unitários',
            completed: false,
          }),
        ]),
      }),
      undefined
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('renderiza em modo de edição com dados pré-preenchidos', () => {
    render(<TaskModal {...defaultProps} task={existingTask} />)

    expect(screen.getByText('Editar Tarefa')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Desenhar Mockup UI')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Criar wireframe no Figma')).toBeInTheDocument()
    expect(screen.getByText('#Design')).toBeInTheDocument()
    expect(screen.getByText('#UI')).toBeInTheDocument()
    expect(screen.getByText('Paleta de Cores')).toBeInTheDocument()
    expect(screen.getByText(/25 minutos/)).toBeInTheDocument()
    expect(screen.getByText('Salvar Alterações')).toBeInTheDocument()
  })

  it('chama onDelete quando botão de excluir tarefa é clicado', () => {
    const onDelete = vi.fn()
    render(<TaskModal {...defaultProps} task={existingTask} onDelete={onDelete} />)

    const deleteBtn = screen.getByText('Excluir Tarefa')
    fireEvent.click(deleteBtn)

    expect(onDelete).toHaveBeenCalledWith('task-100')
  })

  it('chama onClose ao clicar em Cancelar ou no botão X', () => {
    const onClose = vi.fn()
    render(<TaskModal {...defaultProps} onClose={onClose} />)

    const cancelBtn = screen.getByText('Cancelar')
    fireEvent.click(cancelBtn)

    expect(onClose).toHaveBeenCalled()
  })
})
