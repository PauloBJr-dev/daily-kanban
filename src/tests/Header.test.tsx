import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Header, type HeaderProps } from '../components/Header'
import { AuthProvider } from '../context/AuthContext'

describe('Header Component', () => {
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

  it('renderiza corretamente no modo Kanban com título da tela ativa, botão da sidebar e progresso diário', async () => {
    await renderHeader()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Quadro Kanban' })
    ).toBeInTheDocument()
    expect(screen.queryByText('OrganoCat')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Alternar barra lateral' })
    ).toBeInTheDocument()
    expect(screen.getByText('Progresso Diário:')).toBeInTheDocument()
    expect(screen.getByText('3/5 (60%)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar nova tarefa' })).toBeInTheDocument()
  })

  it('dispara onToggleSidebar ao clicar no botão de alternar sidebar', async () => {
    const onToggleSidebar = vi.fn()
    await renderHeader({ ...defaultProps, onToggleSidebar })

    const toggleBtn = screen.getByRole('button', { name: 'Alternar barra lateral' })
    fireEvent.click(toggleBtn)

    expect(onToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it('renderiza o menu de autenticação com botão Entrar / Criar Conta', async () => {
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
    expect(screen.queryByText('OrganoCat')).not.toBeInTheDocument()
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

  it('chama onToggleTheme ao clicar no botão de alternar tema', async () => {
    const onToggleTheme = vi.fn()
    await renderHeader({ ...defaultProps, onToggleTheme })

    const themeBtn = screen.getByRole('button', { name: /ativar modo escuro/i })
    fireEvent.click(themeBtn)

    expect(onToggleTheme).toHaveBeenCalledTimes(1)
  })
})
