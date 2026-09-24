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

  it('renderiza em modo de edição com dados pré-preenchidos sem exibir tags e preservando-as ao salvar', () => {
    const onSave = vi.fn()
    render(<TaskModal {...defaultProps} task={existingTask} onSave={onSave} />)

    expect(screen.getByText('Editar Tarefa')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Desenhar Mockup UI')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Criar wireframe no Figma')).toBeInTheDocument()
    expect(screen.queryByText('#Design')).not.toBeInTheDocument()
    expect(screen.queryByText('#UI')).not.toBeInTheDocument()
    expect(screen.getByText('Paleta de Cores')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Paleta de Cores' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByText(/25 minutos/)).toBeInTheDocument()
    expect(screen.getByText('Salvar Alterações')).toBeInTheDocument()

    // Salvar e verificar retrocompatibilidade com tags salvas
    const saveBtn = screen.getByText('Salvar Alterações')
    fireEvent.click(saveBtn)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Desenhar Mockup UI',
        tags: ['Design', 'UI'],
      }),
      'task-100'
    )
  })

  it('abre o dropdown customizado de colunas, lista opções com bolinhas de cores e seleciona uma coluna', () => {
    render(<TaskModal {...defaultProps} />)

    // O combobox exibe a coluna inicial
    const selectTrigger = screen.getByRole('combobox', { name: 'Selecionar coluna' })
    expect(selectTrigger).toBeInTheDocument()
    expect(selectTrigger).toHaveTextContent('A Fazer')

    // Clica para abrir o dropdown flutuante
    fireEvent.click(selectTrigger)

    const listbox = screen.getByRole('listbox', { name: 'Opções de colunas' })
    expect(listbox).toBeInTheDocument()

    // As opções de colunas devem ser renderizadas
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options[0]).toHaveTextContent('A Fazer')
    expect(options[1]).toHaveTextContent('Em Progresso')
    expect(options[2]).toHaveTextContent('Concluído')

    // Seleciona 'Em Progresso'
    fireEvent.click(options[1])

    // Dropdown fecha e botão exibe o novo valor
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(selectTrigger).toHaveTextContent('Em Progresso')
  })

  it('garante que clicar no backdrop NÃO fecha o modal', () => {
    const onClose = vi.fn()
    render(<TaskModal {...defaultProps} onClose={onClose} />)

    const backdrop = screen.getByRole('dialog')
    fireEvent.click(backdrop)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('fecha diretamente sem diálogo ao clicar em Cancelar ou X quando formulário está limpo (sem alterações)', () => {
    const onClose = vi.fn()
    render(<TaskModal {...defaultProps} onClose={onClose} />)

    const cancelBtn = screen.getByText('Cancelar')
    fireEvent.click(cancelBtn)

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Descartar alterações?')).not.toBeInTheDocument()
  })

  it('fecha diretamente sem diálogo ao pressionar Escape quando formulário está limpo', () => {
    const onClose = vi.fn()
    render(<TaskModal {...defaultProps} onClose={onClose} />)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Descartar alterações?')).not.toBeInTheDocument()
  })

  it('exibe diálogo de confirmação ao tentar fechar via botão X com alterações não salvas', () => {
    const onClose = vi.fn()
    render(<TaskModal {...defaultProps} onClose={onClose} />)

    // Altera o título para tornar o formulário dirty
    const titleInput = screen.getByPlaceholderText(
      'Ex: Revisar layout da nova landing page'
    )
    fireEvent.change(titleInput, { target: { value: 'Nova Tarefa Incompleta' } })

    // Clica no botão X
    const closeBtn = screen.getByLabelText('Fechar modal')
    fireEvent.click(closeBtn)

    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('Descartar alterações?')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Você possui alterações não salvas. Se sair agora, seus dados serão perdidos.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Continuar Editando')).toBeInTheDocument()
    expect(screen.getByText('Descartar Alterações')).toBeInTheDocument()
  })

  it('exibe diálogo de confirmação ao tentar fechar via botão Cancelar com alterações não salvas', () => {
    const onClose = vi.fn()
    render(<TaskModal {...defaultProps} onClose={onClose} />)

    const titleInput = screen.getByPlaceholderText(
      'Ex: Revisar layout da nova landing page'
    )
    fireEvent.change(titleInput, { target: { value: 'Alteração em andamento' } })

    const cancelBtn = screen.getByText('Cancelar')
    fireEvent.click(cancelBtn)

    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('Descartar alterações?')).toBeInTheDocument()
  })

  it('exibe diálogo de confirmação ao pressionar Escape com alterações não salvas', () => {
    const onClose = vi.fn()
    render(<TaskModal {...defaultProps} onClose={onClose} />)

    const descInput = screen.getByPlaceholderText(
      'Adicione notas, contexto ou detalhes da tarefa...'
    )
    fireEvent.change(descInput, { target: { value: 'Descrição detalhada' } })

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('Descartar alterações?')).toBeInTheDocument()
  })

  it('mantém o modal aberto e preserva dados digitados ao clicar em "Continuar Editando"', () => {
    const onClose = vi.fn()
    render(<TaskModal {...defaultProps} onClose={onClose} />)

    const titleInput = screen.getByPlaceholderText(
      'Ex: Revisar layout da nova landing page'
    )
    fireEvent.change(titleInput, { target: { value: 'Manter Dados Digitados' } })

    // Tenta fechar
    const cancelBtn = screen.getByText('Cancelar')
    fireEvent.click(cancelBtn)

    expect(screen.getByText('Descartar alterações?')).toBeInTheDocument()

    // Clica em Continuar Editando
    const keepEditingBtn = screen.getByText('Continuar Editando')
    fireEvent.click(keepEditingBtn)

    expect(screen.queryByText('Descartar alterações?')).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByDisplayValue('Manter Dados Digitados')).toBeInTheDocument()
  })

  it('descarta alterações e fecha o modal ao clicar em "Descartar Alterações"', () => {
    const onClose = vi.fn()
    render(<TaskModal {...defaultProps} onClose={onClose} />)

    const titleInput = screen.getByPlaceholderText(
      'Ex: Revisar layout da nova landing page'
    )
    fireEvent.change(titleInput, { target: { value: 'Descartar esta tarefa' } })

    const cancelBtn = screen.getByText('Cancelar')
    fireEvent.click(cancelBtn)

    const discardBtn = screen.getByText('Descartar Alterações')
    fireEvent.click(discardBtn)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('valida que o título é obrigatório ao tentar salvar em branco', () => {
    const onSave = vi.fn()
    render(<TaskModal {...defaultProps} onSave={onSave} />)

    const submitBtn = screen.getByText('Criar Tarefa')
    fireEvent.click(submitBtn)

    expect(screen.getByText('O título da tarefa é obrigatório.')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('cria uma nova tarefa com título, subtarefas e salva com dados válidos', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    render(<TaskModal {...defaultProps} onSave={onSave} onClose={onClose} />)

    // Preenche título
    const titleInput = screen.getByPlaceholderText(
      'Ex: Revisar layout da nova landing page'
    )
    fireEvent.change(titleInput, { target: { value: 'Escrever Testes' } })

    // Seleciona prioridade Alta
    const highPriorityBtn = screen.getByText('Alta')
    fireEvent.click(highPriorityBtn)

    // Adiciona subtarefa
    const subtaskInput = screen.getByPlaceholderText(
      'Adicionar item ao checklist... (Pressione Enter)'
    )
    fireEvent.change(subtaskInput, { target: { value: 'Testes Unitários' } })
    const addSubtaskBtn = screen.getByText('Adicionar')
    fireEvent.click(addSubtaskBtn)

    expect(screen.getByText('Testes Unitários')).toBeInTheDocument()
    const subtaskCheckbox = screen.getByRole('checkbox', { name: 'Testes Unitários' })
    expect(subtaskCheckbox).toBeInTheDocument()
    expect(subtaskCheckbox).toHaveAttribute('aria-checked', 'false')

    // Alterna estado da subtarefa
    fireEvent.click(subtaskCheckbox)
    expect(subtaskCheckbox).toHaveAttribute('aria-checked', 'true')

    // Submete o formulário
    const submitBtn = screen.getByText('Criar Tarefa')
    fireEvent.click(submitBtn)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Escrever Testes',
        priority: 'high',
        tags: [],
        subtasks: expect.arrayContaining([
          expect.objectContaining({
            title: 'Testes Unitários',
            completed: true,
          }),
        ]),
      }),
      undefined
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('permite remover uma subtarefa ao clicar no botão de exclusão', () => {
    render(<TaskModal {...defaultProps} task={existingTask} />)

    expect(screen.getByText('Paleta de Cores')).toBeInTheDocument()
    const removeBtn = screen.getByTitle('Remover subtarefa')
    fireEvent.click(removeBtn)

    expect(screen.queryByText('Paleta de Cores')).not.toBeInTheDocument()
  })

  it('chama onDelete quando botão de excluir tarefa é clicado', () => {
    const onDelete = vi.fn()
    render(<TaskModal {...defaultProps} task={existingTask} onDelete={onDelete} />)

    const deleteBtn = screen.getByText('Excluir Tarefa')
    fireEvent.click(deleteBtn)

    expect(onDelete).toHaveBeenCalledWith('task-100')
  })
})
