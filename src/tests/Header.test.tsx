import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Header } from '../components/Header'
import { AuthProvider } from '../context/AuthContext'

describe('Header Component', () => {
  const defaultProps = {
    onNewTask: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    onReset: vi.fn(),
    onOpenShortcuts: vi.fn(),
    isDark: false,
    onToggleTheme: vi.fn(),
    stats: {
      completedCount: 3,
      total: 5,
      completionRate: 60,
    },
    activeView: 'kanban' as 'kanban' | 'academic',
    onViewChange: vi.fn(),
    onNewNote: vi.fn(),
  }

  const renderHeader = async (props = defaultProps) => {
    let result: any
    await act(async () => {
      result = render(
        <AuthProvider>
          <Header {...props} />
        </AuthProvider>
      )
    })
    return result
  }

  it('renderiza corretamente no modo Kanban com título OrganoCat, tabs e progresso diário', async () => {
    await renderHeader()

    expect(screen.getByText('OrganoCat')).toBeInTheDocument()
    expect(screen.getByText('Kanban')).toBeInTheDocument()
    expect(screen.getByText('Progresso Diário:')).toBeInTheDocument()
    expect(screen.getByText('3/5 (60%)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar nova tarefa' })).toBeInTheDocument()

    const kanbanTab = screen.getByRole('tab', { name: /quadro diário/i })
    const academicTab = screen.getByRole('tab', { name: /espaço acadêmico/i })

    expect(kanbanTab).toHaveAttribute('aria-selected', 'true')
    expect(academicTab).toHaveAttribute('aria-selected', 'false')
  })

  it('renderiza o menu de autenticação com botão Entrar / Criar Conta', async () => {
    await renderHeader()

    expect(
      await screen.findByRole('button', { name: /entrar ou criar conta/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Entrar / Criar Conta')).toBeInTheDocument()
  })

  it('chama onViewChange ao clicar nas abas do switcher', async () => {
    const onViewChange = vi.fn()
    await renderHeader({ ...defaultProps, onViewChange })

    const academicTab = screen.getByRole('tab', { name: /espaço acadêmico/i })
    fireEvent.click(academicTab)

    expect(onViewChange).toHaveBeenCalledWith('academic')
  })

  it('renderiza corretamente no modo Acadêmico com pill de estudos e botão Nova Anotação', async () => {
    await renderHeader({ ...defaultProps, activeView: 'academic' })

    expect(screen.getByText('OrganoCat')).toBeInTheDocument()
    expect(screen.getByText('Acadêmico')).toBeInTheDocument()
    expect(screen.getByText('Espaço de Estudos e Revisões')).toBeInTheDocument()
    expect(screen.queryByText('Progresso Diário:')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Criar nova anotação' })
    ).toBeInTheDocument()

    const kanbanTab = screen.getByRole('tab', { name: /quadro diário/i })
    const academicTab = screen.getByRole('tab', { name: /espaço acadêmico/i })

    expect(kanbanTab).toHaveAttribute('aria-selected', 'false')
    expect(academicTab).toHaveAttribute('aria-selected', 'true')
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

  it('chama onOpenShortcuts ao clicar no botão de atalhos', async () => {
    const onOpenShortcuts = vi.fn()
    await renderHeader({ ...defaultProps, onOpenShortcuts })

    const shortcutsBtn = screen.getByRole('button', { name: /atalhos de teclado/i })
    fireEvent.click(shortcutsBtn)

    expect(onOpenShortcuts).toHaveBeenCalledTimes(1)
  })
})
