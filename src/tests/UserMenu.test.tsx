import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { UserMenu } from '../components/UserMenu'
import * as useAuthModule from '../hooks/useAuth'
import type { User } from '@supabase/supabase-js'

describe('UserMenu Component', () => {
  const mockSignInWithGoogle = vi.fn().mockResolvedValue({ error: null })
  const mockSignOut = vi.fn().mockResolvedValue({ error: null })

  const baseAuthValue = {
    user: null,
    session: null,
    loading: false,
    isConfigured: true,
    signInWithGoogle: mockSignInWithGoogle,
    signOut: mockSignOut,
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    mockSignInWithGoogle.mockClear()
    mockSignOut.mockClear()
  })

  it('exibe spinner de carregamento quando loading for true', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      ...baseAuthValue,
      loading: true,
    })

    const { container } = render(<UserMenu />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.queryByText(/Entrar com Google/i)).not.toBeInTheDocument()
  })

  it('renderiza corretamente em modo visitante (não logado)', async () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      ...baseAuthValue,
      user: null,
    })

    render(<UserMenu />)

    const loginButton = screen.getByRole('button', { name: /entrar com google/i })
    expect(loginButton).toBeInTheDocument()
    expect(screen.getByText('Entrar com Google')).toBeInTheDocument()

    // Clicar no botão aciona signInWithGoogle
    await act(async () => {
      fireEvent.click(loginButton)
    })
    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('renderiza em modo logado com avatar de imagem e primeiro nome abreviado', () => {
    const loggedUser: User = {
      id: 'usr-1',
      app_metadata: {},
      user_metadata: {
        full_name: 'Carlos Alberto',
        avatar_url: 'https://example.com/photo.png',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'carlos@example.com',
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    }

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      ...baseAuthValue,
      user: loggedUser,
    })

    render(<UserMenu />)

    expect(screen.getByRole('button', { name: /menu do usuário/i })).toBeInTheDocument()
    expect(screen.getByText('Carlos')).toBeInTheDocument()

    const img = screen.getByRole('img', { name: 'Carlos Alberto' })
    expect(img).toHaveAttribute('src', 'https://example.com/photo.png')
  })

  it('renderiza iniciais estilizadas quando usuário não possui avatar_url', () => {
    const loggedUser: User = {
      id: 'usr-2',
      app_metadata: {},
      user_metadata: {
        full_name: 'Mariana Souza',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'mariana@example.com',
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    }

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      ...baseAuthValue,
      user: loggedUser,
    })

    render(<UserMenu />)

    expect(screen.getByText('MS')).toBeInTheDocument()
    expect(screen.getByText('Mariana')).toBeInTheDocument()
  })

  it('abre o dropdown com informações do usuário e indicador de sincronização ao clicar', () => {
    const loggedUser: User = {
      id: 'usr-3',
      app_metadata: {},
      user_metadata: {
        full_name: 'Lucas Pereira',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'lucas.pereira@empresa.com',
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    }

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      ...baseAuthValue,
      user: loggedUser,
    })

    render(<UserMenu />)

    // Inicialmente dropdown fechado
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    // Clica no botão para abrir
    const menuButton = screen.getByRole('button', { name: /menu do usuário/i })
    fireEvent.click(menuButton)

    // Dropdown visível
    const menu = screen.getByRole('menu')
    expect(menu).toBeInTheDocument()
    expect(screen.getByText('Lucas Pereira')).toBeInTheDocument()
    expect(screen.getByText('lucas.pereira@empresa.com')).toBeInTheDocument()
    expect(screen.getByText('Sincronização Ativa')).toBeInTheDocument()
    expect(screen.getByText('Nuvem')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /sair da conta/i })).toBeInTheDocument()
  })

  it('fecha o dropdown ao pressionar a tecla Escape', () => {
    const loggedUser: User = {
      id: 'usr-4',
      app_metadata: {},
      user_metadata: {
        name: 'Roberto Dias',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'roberto@example.com',
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    }

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      ...baseAuthValue,
      user: loggedUser,
    })

    render(<UserMenu />)

    const menuButton = screen.getByRole('button', { name: /menu do usuário/i })
    fireEvent.click(menuButton)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    // Pressiona Escape
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('fecha o dropdown ao clicar fora do componente', () => {
    const loggedUser: User = {
      id: 'usr-5',
      app_metadata: {},
      user_metadata: {
        full_name: 'Fernanda Lima',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'fernanda@example.com',
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    }

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      ...baseAuthValue,
      user: loggedUser,
    })

    render(
      <div>
        <div data-testid="outside">Área Externa</div>
        <UserMenu />
      </div>
    )

    fireEvent.click(screen.getByRole('button', { name: /menu do usuário/i }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('chama signOut e fecha o dropdown ao clicar em Sair da conta', async () => {
    const loggedUser: User = {
      id: 'usr-6',
      app_metadata: {},
      user_metadata: {
        full_name: 'Juliana Costa',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'juliana@example.com',
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    }

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      ...baseAuthValue,
      user: loggedUser,
    })

    render(<UserMenu />)

    fireEvent.click(screen.getByRole('button', { name: /menu do usuário/i }))

    const logoutButton = screen.getByRole('menuitem', { name: /sair da conta/i })
    await act(async () => {
      fireEvent.click(logoutButton)
    })

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
