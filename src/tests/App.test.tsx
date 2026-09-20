import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { App } from '../App'
import { academicStorageService } from '../services/academicStorageService'
import { userPreferencesService } from '../services/userPreferencesService'
import { pomodoroSessionService } from '../services/pomodoroSessionService'
import * as useAuthModule from '../hooks/useAuth'
import type { User } from '@supabase/supabase-js'

describe('App Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('organy_guest_acknowledged', 'true')
  })

  it('abre automaticamente o AuthModal na primeira visita quando usuário não está logado e não consentiu', async () => {
    localStorage.removeItem('organy_guest_acknowledged')
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
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(localStorage.getItem('organy_guest_acknowledged')).toBe('true')
  })

  it('renderiza o cabeçalho Organy, pomodoro widget, filtros e colunas do quadro na visão Kanban', async () => {
    render(<App />)

    // Header & Sidebar
    expect(
      screen.getByRole('heading', { level: 1, name: /quadro kanban/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /organy/i })).toBeInTheDocument()
    expect(screen.getByText('Nova Tarefa')).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /entrar ou criar conta/i })
    ).toBeInTheDocument()

    // Kanban com ordem estrita:
    // 1. Banner Monolítico de Foco Diário & Pomodoro Integrado
    expect(
      screen.getByRole('heading', { level: 1, name: /foco diário:/i })
    ).toBeInTheDocument()
    expect(screen.getByTestId('pomodoro-digital-display')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar foco/i })).toBeInTheDocument()

    // 2. Filtros Minimalistas do Stitch
    expect(screen.getByText('Filtros:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ordenar por prazo/i })).toBeInTheDocument()

    // 3. Colunas do Quadro Kanban
    expect(screen.getByText('A Fazer')).toBeInTheDocument()
    expect(screen.getByText('Em Progresso')).toBeInTheDocument()
    expect(screen.getByText('Em Espera')).toBeInTheDocument()
    expect(screen.getByText('Concluído Hoje')).toBeInTheDocument()

    // KPIs agora estão em Métricas, não devem poluir o Kanban
    expect(screen.queryByText('Taxa Geral de Conclusão')).not.toBeInTheDocument()
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

    const themeToggleBtn = screen.getAllByTitle(/Ativar Modo/i)[0]
    fireEvent.click(themeToggleBtn)

    expect(localStorage.getItem('dailyflow_theme')).toBeDefined()
  })

  it('renderiza as opções de navegação na barra lateral e badge de contexto no cabeçalho', () => {
    render(<App />)

    expect(screen.getAllByRole('button', { name: 'Kanban' })[0]).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'Espaço Acadêmico' })[0]
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Métricas' })[0]).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'Configurações' })[0]
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Perfil' })[0]).toBeInTheDocument()

    // Progresso diário agora está no banner monolítico, não no Header
    expect(screen.queryByText('Progresso Diário:')).not.toBeInTheDocument()
    expect(screen.getByText(/progresso diário •/i)).toBeInTheDocument()
  })

  it('alterna para a visão de Métricas e exibe os KPIs e painel analítico', () => {
    render(<App />)

    const metricsBtn = screen.getAllByRole('button', { name: 'Métricas' })[0]
    fireEvent.click(metricsBtn)

    // Métricas renderizada com os KPIs movidos
    expect(screen.getByText('Metas de Hoje')).toBeInTheDocument()
    expect(screen.getByText('Taxa Geral de Conclusão')).toBeInTheDocument()

    // Kanban não deve estar visível
    expect(
      screen.queryByRole('region', { name: 'Coluna A Fazer' })
    ).not.toBeInTheDocument()
    expect(localStorage.getItem('dailyflow_active_view')).toBe('metrics')
  })

  it('alterna para o Espaço Acadêmico e renderiza o AcademicView', () => {
    render(<App />)

    const academicBtn = screen.getAllByRole('button', { name: 'Espaço Acadêmico' })[0]
    fireEvent.click(academicBtn)

    // Academic View renderizada
    expect(
      screen.getByRole('heading', { level: 1, name: 'Espaço Acadêmico' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Estatísticas Acadêmicas' })
    ).toBeInTheDocument()

    // Elementos do Kanban não devem estar visíveis
    expect(screen.queryByText('A Fazer')).not.toBeInTheDocument()

    // Botão de ação do cabeçalho agora é Nova Anotação
    expect(
      screen.getAllByRole('button', { name: 'Criar nova anotação' })[0]
    ).toBeInTheDocument()

    expect(localStorage.getItem('dailyflow_active_view')).toBe('academic')
  })

  it('alterna de volta para o Quadro Kanban', () => {
    render(<App />)

    const academicBtn = screen.getAllByRole('button', { name: 'Espaço Acadêmico' })[0]
    fireEvent.click(academicBtn)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Espaço Acadêmico' })
    ).toBeInTheDocument()

    const kanbanBtn = screen.getAllByRole('button', { name: 'Kanban' })[0]
    fireEvent.click(kanbanBtn)

    // Retorna ao Kanban
    expect(screen.getByText('A Fazer')).toBeInTheDocument()
    expect(screen.getByText('Nova Tarefa')).toBeInTheDocument()
    expect(localStorage.getItem('dailyflow_active_view')).toBe('kanban')
  })

  it('abre o NoteModal ao clicar no botão Nova Anotação do cabeçalho no modo acadêmico', () => {
    render(<App />)

    // Muda para o modo acadêmico
    fireEvent.click(screen.getAllByRole('button', { name: 'Espaço Acadêmico' })[0])

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
    fireEvent.click(screen.getAllByRole('button', { name: 'Espaço Acadêmico' })[0])

    // No modo Acadêmico, "n" abre Nova Anotação
    fireEvent.keyDown(window, { key: 'n' })
    expect(screen.getByText('Nova Anotação Acadêmica')).toBeInTheDocument()
  })

  it('inicializa na visão salva no localStorage quando presente', () => {
    localStorage.setItem('dailyflow_active_view', 'academic')

    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Espaço Acadêmico' })
    ).toBeInTheDocument()
    expect(screen.queryByText('A Fazer')).not.toBeInTheDocument()
  })

  it('alterna para o Modo Zen no Studio e oculta o cabeçalho global do App, restaurando com Escape', () => {
    localStorage.setItem(
      academicStorageService.getStorageKey(),
      JSON.stringify({
        subjects: [{ id: 'sub-calc', name: 'Cálculo', color: 'indigo' }],
        notes: [
          {
            id: 'note-zen',
            title: 'Nota para Teste Zen',
            content: 'Conteúdo de estudo',
            subjectId: 'sub-calc',
            status: 'in_progress',
            tags: ['Zen'],
            isPinned: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        version: 1,
      })
    )

    render(<App />)

    // Muda para o modo acadêmico
    fireEvent.click(screen.getAllByRole('button', { name: 'Espaço Acadêmico' })[0])
    expect(
      screen.getByRole('heading', { level: 1, name: /espaço acadêmico/i })
    ).toBeInTheDocument()

    // Alterna para o Modo Studio
    fireEvent.click(screen.getByText('Nota para Teste Zen'))

    // Ativa o Modo Zen
    const zenBtn = screen.getByLabelText('Modo Zen')
    fireEvent.click(zenBtn)

    // Cabeçalho global deve estar oculto no Modo Zen
    expect(
      screen.queryByRole('heading', { level: 1, name: /espaço acadêmico/i })
    ).not.toBeInTheDocument()

    // Pressiona Escape para desativar o Modo Zen
    fireEvent.keyDown(window, { key: 'Escape' })

    // Cabeçalho global restaurado
    expect(
      screen.getByRole('heading', { level: 1, name: /espaço acadêmico/i })
    ).toBeInTheDocument()
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

  it('exibe confirmação com palavra de segurança "RESTAURAR" ao solicitar restauração em Configurações', () => {
    render(<App />)

    // Abre a aba de Configurações
    fireEvent.click(screen.getAllByRole('button', { name: 'Configurações' })[0])

    const resetBtn = screen.getByRole('button', {
      name: /restaurar dados de demonstração/i,
    })
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

    // Cria uma nova tarefa para iniciar o foco
    fireEvent.click(screen.getByText('Nova Tarefa'))
    const titleInput = screen.getByPlaceholderText(
      'Ex: Revisar layout da nova landing page'
    )
    fireEvent.change(titleInput, { target: { value: 'Tarefa de Teste para Foco' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar Tarefa' }))

    const focusBtn = screen.getByRole('button', {
      name: /iniciar pomodoro para/i,
    })
    fireEvent.click(focusBtn)

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
  it('carrega preferências e restaura sessão pomodoro ativa do Supabase ao detectar usuário autenticado', async () => {
    const mockUser: Partial<User> = {
      id: 'user-synced-123',
      email: 'sync@organy.app',
    }

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser as User,
      session: null,
      loading: false,
      isConfigured: true,
      authModalInitialTab: undefined,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      signUpWithPassword: vi.fn(),
      signInWithPassword: vi.fn(),
      continueAsGuest: vi.fn(),
      isGuestAcknowledged: true,
      isAuthModalOpen: false,
      openAuthModal: vi.fn(),
      closeAuthModal: vi.fn(),
    })

    const fetchPrefsSpy = vi
      .spyOn(userPreferencesService, 'fetchUserPreferences')
      .mockResolvedValueOnce({
        theme: 'dark',
        activeView: 'metrics',
        sidebarCollapsed: true,
        pomodoro: {
          workDurationMinutes: 50,
          breakDurationMinutes: 10,
        },
      })

    const fetchActiveSessionSpy = vi
      .spyOn(pomodoroSessionService, 'fetchActiveSession')
      .mockResolvedValueOnce({
        taskId: null,
        taskTitle: 'Foco no Escritório',
        mode: 'work',
        startedAt: new Date().toISOString(),
        durationSeconds: 1500,
        isRunning: true,
      })

    render(<App />)

    await waitFor(() => {
      expect(fetchPrefsSpy).toHaveBeenCalledWith('user-synced-123')
      expect(fetchActiveSessionSpy).toHaveBeenCalledWith('user-synced-123')
    })
  })
})
