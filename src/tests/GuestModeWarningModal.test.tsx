import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GuestModeWarningModal } from '../components/auth/GuestModeWarningModal'
import * as useAuthModule from '../hooks/useAuth'

describe('GuestModeWarningModal Component', () => {
  const mockContinueAsGuest = vi.fn()
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  beforeEach(() => {
    vi.restoreAllMocks()
    mockContinueAsGuest.mockClear()
    mockOnClose.mockClear()
    mockOnConfirm.mockClear()

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: false,
      isConfigured: false,
      authModalInitialTab: undefined,
      isPasswordRecovery: false,
      setIsPasswordRecovery: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      signUpWithPassword: vi.fn(),
      signInWithPassword: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUserPassword: vi.fn(),
      continueAsGuest: mockContinueAsGuest,
      isGuestAcknowledged: false,
      isAuthModalOpen: false,
      openAuthModal: vi.fn(),
      closeAuthModal: vi.fn(),
    })
  })

  it('não renderiza nada quando isOpen for false', () => {
    render(
      <GuestModeWarningModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza o título de aviso e os 3 tópicos sobre armazenamento local', () => {
    render(
      <GuestModeWarningModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /o que é armazenamento local?/i })
    ).toBeInTheDocument()

    // 3 Tópicos de aviso
    expect(screen.getByText('Sem sincronização na nuvem')).toBeInTheDocument()
    expect(screen.getByText('Risco de perda ao limpar cache/cookies')).toBeInTheDocument()
    expect(screen.getByText('Sem recuperação entre aparelhos')).toBeInTheDocument()

    // Botões
    expect(screen.getByRole('button', { name: /voltar ao login/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /continuar sem conta/i })
    ).toBeInTheDocument()
  })

  it('mantém o botão de confirmação desabilitado até que o checkbox obrigatório seja marcado', () => {
    render(
      <GuestModeWarningModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

    const confirmBtn = screen.getByRole('button', {
      name: /continuar sem conta/i,
    })
    const checkbox = screen.getByRole('checkbox', {
      name: /entendo os riscos do armazenamento local e desejo prosseguir sem login/i,
    })

    // Inicialmente desabilitado
    expect(confirmBtn).toBeDisabled()

    // Marca checkbox -> Habilita botão
    fireEvent.click(checkbox)
    expect(confirmBtn).not.toBeDisabled()

    // Desmarca checkbox -> Desabilita novamente
    fireEvent.click(checkbox)
    expect(confirmBtn).toBeDisabled()
  })

  it('chama continueAsGuest e onConfirm ao clicar no botão habilitado', () => {
    render(
      <GuestModeWarningModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

    const confirmBtn = screen.getByRole('button', {
      name: /continuar sem conta/i,
    })
    const checkbox = screen.getByRole('checkbox', {
      name: /entendo os riscos do armazenamento local e desejo prosseguir sem login/i,
    })

    fireEvent.click(checkbox)
    fireEvent.click(confirmBtn)

    expect(mockContinueAsGuest).toHaveBeenCalledTimes(1)
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao clicar em "Voltar ao Login" ou botão fechar', () => {
    render(
      <GuestModeWarningModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

    const backBtn = screen.getByRole('button', { name: /voltar ao login/i })
    fireEvent.click(backBtn)
    expect(mockOnClose).toHaveBeenCalledTimes(1)

    const closeIconBtn = screen.getByRole('button', { name: /fechar aviso/i })
    fireEvent.click(closeIconBtn)
    expect(mockOnClose).toHaveBeenCalledTimes(2)
  })

  it('fecha o modal ao pressionar a tecla Escape', () => {
    render(
      <GuestModeWarningModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
