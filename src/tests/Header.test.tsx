import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Header, type HeaderProps } from '../components/Header'
import { AuthProvider } from '../context/AuthContext'

describe('Header Component (Topbar Reformulada)', () => {
  const defaultProps: HeaderProps = {
    onNewTask: vi.fn(),
    isDark: false,
    onToggleTheme: vi.fn(),
    stats: {
      completedCount: 3,
      total: 5,
      completionRate: 60,
    },
    activeView: 'kanban',
    onViewChange: vi.fn(),
    onNewNote: vi.fn(),
    onToggleSidebar: vi.fn(),
  }

  const renderHeader = async (props = defaultProps) => {
    let result: unknown
    await act(async () => {
      result = render(
        <AuthProvider>
          <Header {...props} />
        </AuthProvider>
      )
    })
    return result
  }

  it('renderiza corretamente no modo Kanban sem progresso diário e sem botão de tema na topbar', async () => {
    await renderHeader()

    // Título da tela ativa
    expect(
      screen.getByRole('heading', { level: 1, name: 'Quadro Kanban' })
    ).toBeInTheDocument()

    // Botão de alternar sidebar presente
    expect(
      screen.getByRole('button', { name: 'Alternar barra lateral' })
    ).toBeInTheDocument()

    // Progresso diário e botão de tema NÃO devem estar na topbar
    expect(screen.queryByText('Progresso Diário:')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /ativar modo escuro/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /ativar modo claro/i })
    ).not.toBeInTheDocument()

    // Botão de ação principal Nova Tarefa está presente
    expect(screen.getByRole('button', { name: 'Criar nova tarefa' })).toBeInTheDocument()
  })

  it('dispara onToggleSidebar ao clicar no botão de alternar sidebar', async () => {
    const onToggleSidebar = vi.fn()
    await renderHeader({ ...defaultProps, onToggleSidebar })

    const toggleBtn = screen.getByRole('button', { name: 'Alternar barra lateral' })
    fireEvent.click(toggleBtn)

    expect(onToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it('renderiza o menu de autenticação com botão Entrar / Criar Conta na extremidade direita', async () => {
    await renderHeader()

    expect(
      await screen.findByRole('button', { name: /entrar ou criar conta/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Entrar / Criar Conta')).toBeInTheDocument()
  })

  it('renderiza corretamente no modo Acadêmico com título da tela ativa, pill de estudos e botão Nova Anotação', async () => {
    await renderHeader({ ...defaultProps, activeView: 'academic' })

    expect(
      screen.getByRole('heading', { level: 1, name: 'Espaço Acadêmico' })
    ).toBeInTheDocument()
    expect(screen.getByText('Espaço de Estudos e Revisões')).toBeInTheDocument()
    expect(screen.queryByText('Progresso Diário:')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Criar nova anotação' })
    ).toBeInTheDocument()
  })

  it('renderiza títulos corretos da tela ativa para Métricas, Configurações e Perfil', async () => {
    const { rerender } = render(
      <AuthProvider>
        <Header {...defaultProps} activeView="metrics" />
      </AuthProvider>
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Métricas & Produtividade' })
    ).toBeInTheDocument()
    expect(screen.getByText('Painel Analítico de Produtividade')).toBeInTheDocument()

    rerender(
      <AuthProvider>
        <Header {...defaultProps} activeView="settings" />
      </AuthProvider>
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Configurações' })
    ).toBeInTheDocument()
    expect(screen.getByText('Preferências & Personalização')).toBeInTheDocument()

    rerender(
      <AuthProvider>
        <Header {...defaultProps} activeView="profile" />
      </AuthProvider>
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Perfil' })).toBeInTheDocument()
    expect(screen.getByText('Gestão de Perfil & Dados')).toBeInTheDocument()
  })

  it('chama onNewNote ao clicar em Nova Anotação no modo acadêmico', async () => {
    const onNewNote = vi.fn()
    await renderHeader({ ...defaultProps, activeView: 'academic', onNewNote })

    const newNoteBtn = screen.getByRole('button', { name: 'Criar nova anotação' })
    fireEvent.click(newNoteBtn)

    expect(onNewNote).toHaveBeenCalledTimes(1)
  })

  it('chama onNewTask ao clicar em Nova Tarefa no modo kanban', async () => {
    const onNewTask = vi.fn()
    await renderHeader({ ...defaultProps, onNewTask })

    const newTaskBtn = screen.getByRole('button', { name: 'Criar nova tarefa' })
    fireEvent.click(newTaskBtn)

    expect(onNewTask).toHaveBeenCalledTimes(1)
  })
})
