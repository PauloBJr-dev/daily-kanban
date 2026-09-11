import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileView } from '../components/profile/ProfileView'
import type { Task } from '../types/kanban'
import * as useAuthModule from '../hooks/useAuth'

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Tarefa 1',
    columnId: 'col-todo',
    priority: 'medium',
    tags: ['dev'],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Tarefa 2',
    columnId: 'col-done',
    priority: 'high',
    tags: ['test'],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    pomodoroMinutesSpent: 25,
  },
]

describe('ProfileView Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza corretamente em modo visitante com aviso de armazenamento local', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: false,
      isConfigured: true,
      isAuthModalOpen: false,
      authModalInitialTab: 'signin',
      openAuthModal: vi.fn(),
      closeAuthModal: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithPassword: vi.fn(),
      signUpWithPassword: vi.fn(),
      continueAsGuest: vi.fn(),
      isGuestAcknowledged: true,
      signOut: vi.fn(),
    })

    render(<ProfileView tasks={mockTasks} academicNotesCount={3} />)

    expect(screen.getByText('Perfil & Sincronização')).toBeInTheDocument()
    expect(screen.getByText('Visitante OrganoCat')).toBeInTheDocument()
    expect(screen.getByText('Modo Visitante Local')).toBeInTheDocument()
    expect(
      screen.getByText('Navegador Local (Sem vínculo com conta)')
    ).toBeInTheDocument()

    // Botão de login para visitantes
    const authBtn = screen.getByRole('button', { name: /Entrar ou Criar Conta/i })
    expect(authBtn).toBeInTheDocument()
  })

  it('chama onOpenAuthModal ao clicar em Entrar ou Criar Conta', () => {
    const onOpenAuthModal = vi.fn()
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: false,
      isConfigured: true,
      isAuthModalOpen: false,
      authModalInitialTab: 'signin',
      openAuthModal: vi.fn(),
      closeAuthModal: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithPassword: vi.fn(),
      signUpWithPassword: vi.fn(),
      continueAsGuest: vi.fn(),
      isGuestAcknowledged: true,
      signOut: vi.fn(),
    })

    render(<ProfileView tasks={mockTasks} onOpenAuthModal={onOpenAuthModal} />)

    const authBtn = screen.getByRole('button', { name: /Entrar ou Criar Conta/i })
    fireEvent.click(authBtn)

    expect(onOpenAuthModal).toHaveBeenCalledTimes(1)
  })

  it('renderiza dados do usuário autenticado e status de sincronização nuvem', () => {
    const signOut = vi.fn()
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: 'user-123',
        email: 'paulo@organocat.dev',
        user_metadata: { full_name: 'Paulo Dev' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
      session: null,
      loading: false,
      isConfigured: true,
      isAuthModalOpen: false,
      authModalInitialTab: 'signin',
      openAuthModal: vi.fn(),
      closeAuthModal: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithPassword: vi.fn(),
      signUpWithPassword: vi.fn(),
      continueAsGuest: vi.fn(),
      isGuestAcknowledged: true,
      signOut,
    })

    render(<ProfileView tasks={mockTasks} academicNotesCount={5} />)

    expect(screen.getByText('Paulo Dev')).toBeInTheDocument()
    expect(screen.getByText('paulo@organocat.dev')).toBeInTheDocument()
    expect(screen.getByText('Sincronização Nuvem Supabase')).toBeInTheDocument()

    const signOutBtn = screen.getByRole('button', { name: /Sair da Conta/i })
    fireEvent.click(signOutBtn)
    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it('exibe resumo de produtividade com tarefas, notas e pomodoro', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: false,
      isConfigured: true,
      isAuthModalOpen: false,
      authModalInitialTab: 'signin',
      openAuthModal: vi.fn(),
      closeAuthModal: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithPassword: vi.fn(),
      signUpWithPassword: vi.fn(),
      continueAsGuest: vi.fn(),
      isGuestAcknowledged: true,
      signOut: vi.fn(),
    })

    render(<ProfileView tasks={mockTasks} academicNotesCount={4} />)

    expect(screen.getByText('Resumo de Produtividade da Conta')).toBeInTheDocument()
    expect(screen.getByText('Total de Tarefas')).toBeInTheDocument()
    expect(screen.getByText('Tarefas Concluídas')).toBeInTheDocument()
    expect(screen.getByText('Tempo de Foco')).toBeInTheDocument()
    expect(screen.getByText('Anotações Acadêmicas')).toBeInTheDocument()
  })
})
