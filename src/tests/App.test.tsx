import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { App } from '../App'

describe('App Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('organocat_guest_acknowledged', 'true')
  })

  it('abre automaticamente o AuthModal na primeira visita quando usuário não está logado e não consentiu', async () => {
    localStorage.removeItem('organocat_guest_acknowledged')
    render(<App />)

    // Modal de autenticação abre na primeira visita
    expect(await screen.findByRole('dialog', {}, { timeout: 5000 })).toBeInTheDocument()
    expect(screen.getByText('O que é Armazenamento Local?')).toBeInTheDocument()

    // Marca o checkbox e continua sem conta
    const checkbox = screen.getByRole('checkbox', {
      name: /estou ciente de que meus dados ficarão salvos apenas neste navegador/i,
    })
    fireEvent.click(checkbox)

    const continueBtn = screen.getByRole('button', { name: /continuar sem conta/i })
    fireEvent.click(continueBtn)

    // Modal fecha e usuário vê o aplicativo
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(localStorage.getItem('organocat_guest_acknowledged')).toBe('true')
  })

  it('renderiza o cabeçalho OrganoCat, quick stats, pomodoro widget, filtros e colunas do quadro', async () => {
    render(<App />)

    // Header
    expect(screen.getByText('OrganoCat')).toBeInTheDocument()
    expect(screen.getByText('Nova Tarefa')).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /entrar ou criar conta/i })
    ).toBeInTheDocument()

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
    expect(screen.getByText('OrganoCat')).toBeInTheDocument()

    // Alterna para o Modo Studio
    fireEvent.click(screen.getByRole('button', { name: 'Modo Studio' }))

    // Ativa o Modo Zen
    const zenBtn = screen.getByLabelText('Modo Zen')
    fireEvent.click(zenBtn)

    // Cabeçalho global do OrganoCat deve estar oculto
    expect(screen.queryByText('OrganoCat')).not.toBeInTheDocument()

    // Pressiona Escape para desativar o Modo Zen
    fireEvent.keyDown(window, { key: 'Escape' })

    // Cabeçalho global restaurado
    expect(screen.getByText('OrganoCat')).toBeInTheDocument()
  })

  it('renderiza o link de acessibilidade para pular para o conteúdo principal', () => {
    render(<App />)
    const skipLink = screen.getByText('Pular para o conteúdo')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('exibe toast ao criar uma nova tarefa', () => {
    render(<App />)

    fireEvent.click(screen.getByText('Nova Tarefa'))
    expect(screen.getByText('Criar Tarefa')).toBeInTheDocument()

    const titleInput = screen.getByPlaceholderText(
      'Ex: Revisar layout da nova landing page'
    )
    fireEvent.change(titleInput, { target: { value: 'Nova Tarefa de Teste Toast' } })

    const submitBtn = screen.getByRole('button', { name: 'Criar Tarefa' })
    fireEvent.click(submitBtn)

    expect(screen.getByText('Tarefa criada com sucesso')).toBeInTheDocument()
  })

  it('exibe confirmação com palavra de segurança "RESTAURAR" ao solicitar restauração padrão', () => {
    render(<App />)

    const resetBtn = screen.getByTitle('Restaurar dados de demonstração')
    fireEvent.click(resetBtn)

    expect(screen.getByText('Restaurar Dados Padrão')).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: 'Restaurar' })
    expect(confirmBtn).toBeDisabled()

    const input = screen.getByPlaceholderText('Digite "RESTAURAR"')
    fireEvent.change(input, { target: { value: 'RESTAURAR' } })

    expect(confirmBtn).not.toBeDisabled()
    fireEvent.click(confirmBtn)

    expect(screen.getByText('Dados de demonstração restaurados')).toBeInTheDocument()
  })

  it('abre automaticamente em tela cheia ao iniciar foco em uma tarefa e fecha com Escape', () => {
    render(<App />)

    const focusButtons = screen.getAllByRole('button', { name: /iniciar pomodoro para/i })
    fireEvent.click(focusButtons[0])

    expect(
      screen.getByRole('dialog', { name: /cronômetro pomodoro em tela cheia/i })
    ).toBeInTheDocument()
    expect(screen.getByTestId('fullscreen-timer-display')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(
      screen.queryByRole('dialog', { name: /cronômetro pomodoro em tela cheia/i })
    ).not.toBeInTheDocument()
  })

  it('abre o cronômetro em tela cheia ao clicar no botão de maximizar do widget e fecha no botão minimizar', () => {
    render(<App />)

    const maximizeBtn = screen.getByRole('button', { name: /expandir para tela cheia/i })
    fireEvent.click(maximizeBtn)

    expect(
      screen.getByRole('dialog', { name: /cronômetro pomodoro em tela cheia/i })
    ).toBeInTheDocument()

    const minimizeBtn = screen.getByRole('button', { name: 'Minimizar (Esc)' })
    fireEvent.click(minimizeBtn)

    expect(
      screen.queryByRole('dialog', { name: /cronômetro pomodoro em tela cheia/i })
    ).not.toBeInTheDocument()
  })
})
