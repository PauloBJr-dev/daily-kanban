import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HeroProfileCard } from '../components/profile/HeroProfileCard'
import type { User } from '@supabase/supabase-js'

describe('HeroProfileCard Component', () => {
  it('renderiza corretamente para visitante sem planos pagos ou vínculo universitário', () => {
    const onAuthAction = vi.fn()
    render(
      <HeroProfileCard
        user={null}
        displayName="Visitante Organy"
        displayEmail="Navegador Local (Sem vínculo com conta)"
        initials="OR"
        avatarUrl={null}
        onAuthAction={onAuthAction}
      />
    )

    expect(screen.getByText('Visitante Organy')).toBeInTheDocument()
    expect(
      screen.getByText('Navegador Local (Sem vínculo com conta)')
    ).toBeInTheDocument()
    expect(screen.getByText('Modo Visitante Local')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Entrar ou Criar Conta/i })
    ).toBeInTheDocument()

    // Valida que NÃO existem campos proibidos
    expect(screen.queryByText(/Estudante Pro/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Matrícula/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Universidade/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Membro desde/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Entrar ou Criar Conta/i }))
    expect(onAuthAction).toHaveBeenCalledTimes(1)
  })

  it('renderiza dados de usuário logado com ações de sair e alterar senha', () => {
    const onAuthAction = vi.fn()
    const onChangePassword = vi.fn()
    const mockUser = {
      id: 'user-1',
      email: 'alex@organy.dev',
      user_metadata: { full_name: 'Alexandre Silva' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User

    render(
      <HeroProfileCard
        user={mockUser}
        displayName="Alexandre Silva"
        displayEmail="alex@organy.dev"
        initials="AS"
        avatarUrl={null}
        onAuthAction={onAuthAction}
        onChangePassword={onChangePassword}
      />
    )

    expect(screen.getByText('Alexandre Silva')).toBeInTheDocument()
    expect(screen.getByText('alex@organy.dev')).toBeInTheDocument()
    expect(screen.getByText('Sincronização Nuvem Supabase')).toBeInTheDocument()

    const changePassBtn = screen.getByRole('button', { name: /Alterar Senha/i })
    expect(changePassBtn).toBeInTheDocument()
    fireEvent.click(changePassBtn)
    expect(onChangePassword).toHaveBeenCalledTimes(1)

    const signOutBtn = screen.getByRole('button', { name: /Sair da Conta/i })
    expect(signOutBtn).toBeInTheDocument()
    fireEvent.click(signOutBtn)
    expect(onAuthAction).toHaveBeenCalledTimes(1)
  })

  it('renderiza o avatar em formato perfeitamente circular (rounded-full)', () => {
    const { container } = render(
      <HeroProfileCard
        user={null}
        displayName="Visitante Organy"
        displayEmail="local@organy.dev"
        initials="VO"
        avatarUrl={null}
        onAuthAction={vi.fn()}
      />
    )

    const avatarDiv = container.querySelector('.rounded-full.bg-linear-to-tr')
    expect(avatarDiv).toBeInTheDocument()
    expect(avatarDiv).toHaveClass('w-20', 'h-20', 'rounded-full')
  })
})
