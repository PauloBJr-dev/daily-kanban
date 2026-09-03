import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { App } from '../App'

describe('App Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza o cabeçalho, quick stats, pomodoro widget, filtros e colunas do quadro', () => {
    render(<App />)

    // Header
    expect(screen.getByText('DailyFlow')).toBeInTheDocument()
    expect(screen.getByText('Nova Tarefa')).toBeInTheDocument()

    // QuickStats
    expect(screen.getByText('Metas de Hoje')).toBeInTheDocument()
    expect(screen.getByText('Taxa Geral de Conclusão')).toBeInTheDocument()

    // Pomodoro
    expect(screen.getByText('Bloco de Foco Diário')).toBeInTheDocument()

    // Board columns
    expect(screen.getByText('A Fazer')).toBeInTheDocument()
    expect(screen.getByText('Em Progresso')).toBeInTheDocument()
    expect(screen.getByText('Em Espera')).toBeInTheDocument()
    expect(screen.getByText('Concluído Hoje')).toBeInTheDocument()
  })

  it('abre e fecha o TaskModal ao clicar em Nova Tarefa', () => {
    render(<App />)

    const newTaskBtn = screen.getByText('Nova Tarefa')
    fireEvent.click(newTaskBtn)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Criar Tarefa')).toBeInTheDocument()

    const cancelBtn = screen.getByText('Cancelar')
    fireEvent.click(cancelBtn)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('alterna tema escuro e claro ao clicar no botão de tema', () => {
    render(<App />)

    const themeToggleBtn = screen.getByTitle(/Ativar Modo/i)
    fireEvent.click(themeToggleBtn)

    expect(localStorage.getItem('dailyflow_theme')).toBeDefined()
  })

  it('renderiza o seletor de visualização (switcher) no cabeçalho', () => {
    render(<App />)

    const kanbanTab = screen.getByRole('tab', { name: /quadro diário/i })
    const academicTab = screen.getByRole('tab', { name: /espaço acadêmico/i })

    expect(kanbanTab).toBeInTheDocument()
    expect(academicTab).toBeInTheDocument()
    expect(kanbanTab).toHaveAttribute('aria-selected', 'true')
    expect(academicTab).toHaveAttribute('aria-selected', 'false')

    // Pill central exibe progresso diário no modo Kanban
    expect(screen.getByText('Progresso Diário:')).toBeInTheDocument()
  })

  it('alterna para o Espaço Acadêmico e renderiza o AcademicView', () => {
    render(<App />)

    const academicTab = screen.getByRole('tab', { name: /espaço acadêmico/i })
    fireEvent.click(academicTab)

    // Academic View renderizada
    expect(screen.getByText('Caderno Acadêmico')).toBeInTheDocument()
    expect(
      screen.getByText(/Organize suas matérias, conceitos de estudo/i)
    ).toBeInTheDocument()

    // Elementos do Kanban não devem estar visíveis
    expect(screen.queryByText('Metas de Hoje')).not.toBeInTheDocument()
    expect(screen.queryByText('A Fazer')).not.toBeInTheDocument()

    // Botão de ação do cabeçalho agora é Nova Anotação (presente no header e no caderno)
    expect(
      screen.getAllByRole('button', { name: 'Criar nova anotação' })[0]
    ).toBeInTheDocument()

    // Pill central agora é acadêmico
    expect(screen.getByText('Espaço de Estudos e Revisões')).toBeInTheDocument()

    // Tab switcher atualizado
    expect(academicTab).toHaveAttribute('aria-selected', 'true')
    expect(localStorage.getItem('dailyflow_active_view')).toBe('academic')
  })

  it('alterna de volta para o Quadro Diário', () => {
    render(<App />)

    const academicTab = screen.getByRole('tab', { name: /espaço acadêmico/i })
    fireEvent.click(academicTab)
    expect(screen.getByText('Caderno Acadêmico')).toBeInTheDocument()

    const kanbanTab = screen.getByRole('tab', { name: /quadro diário/i })
    fireEvent.click(kanbanTab)

    // Retorna ao Kanban
    expect(screen.getByText('Metas de Hoje')).toBeInTheDocument()
    expect(screen.getByText('A Fazer')).toBeInTheDocument()
    expect(screen.getByText('Nova Tarefa')).toBeInTheDocument()
    expect(localStorage.getItem('dailyflow_active_view')).toBe('kanban')
  })

  it('abre o NoteModal ao clicar no botão Nova Anotação do cabeçalho no modo acadêmico', () => {
    render(<App />)

    // Muda para o modo acadêmico
    fireEvent.click(screen.getByRole('tab', { name: /espaço acadêmico/i }))

    // Clica no botão de criar anotação
    const newNoteButtons = screen.getAllByRole('button', { name: 'Criar nova anotação' })
    fireEvent.click(newNoteButtons[0])

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Nova Anotação Acadêmica')).toBeInTheDocument()
  })

  it('respeita o atalho "n" para abrir o modal correto em cada contexto', () => {
    render(<App />)

    // No modo Kanban, "n" abre Nova Tarefa
    fireEvent.keyDown(window, { key: 'n' })
    expect(screen.getByText('Criar Tarefa')).toBeInTheDocument()

    // Fecha o modal de tarefa
    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Alterna para o modo acadêmico
    fireEvent.click(screen.getByRole('tab', { name: /espaço acadêmico/i }))

    // No modo Acadêmico, "n" abre Nova Anotação
    fireEvent.keyDown(window, { key: 'n' })
    expect(screen.getByText('Nova Anotação Acadêmica')).toBeInTheDocument()
  })

  it('inicializa na visão salva no localStorage quando presente', () => {
    localStorage.setItem('dailyflow_active_view', 'academic')

    render(<App />)

    expect(screen.getByText('Caderno Acadêmico')).toBeInTheDocument()
    expect(screen.queryByText('A Fazer')).not.toBeInTheDocument()
  })

  it('alterna para o Modo Zen no Studio e oculta o cabeçalho global do App, restaurando com Escape', () => {
    render(<App />)

    // Muda para o modo acadêmico
    fireEvent.click(screen.getByRole('tab', { name: /espaço acadêmico/i }))
    expect(screen.getByText('DailyFlow')).toBeInTheDocument()

    // Alterna para o Modo Studio
    fireEvent.click(screen.getByRole('button', { name: 'Modo Studio' }))

    // Ativa o Modo Zen
    const zenBtn = screen.getByLabelText('Modo Zen')
    fireEvent.click(zenBtn)

    // Cabeçalho global do DailyFlow deve estar oculto
    expect(screen.queryByText('DailyFlow')).not.toBeInTheDocument()

    // Pressiona Escape para desativar o Modo Zen
    fireEvent.keyDown(window, { key: 'Escape' })

    // Cabeçalho global restaurado
    expect(screen.getByText('DailyFlow')).toBeInTheDocument()
  })
})
