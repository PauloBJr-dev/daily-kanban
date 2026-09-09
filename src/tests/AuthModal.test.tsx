import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { AuthModal } from '../components/AuthModal'
import * as useAuthModule from '../hooks/useAuth'

describe('AuthModal Component', () => {
  const mockSignUpWithPassword = vi.fn().mockResolvedValue({ error: null })
  const mockSignInWithPassword = vi.fn().mockResolvedValue({ error: null })
  const mockContinueAsGuest = vi.fn()
  const mockCloseAuthModal = vi.fn()
  const mockOpenAuthModal = vi.fn()

  const defaultAuthValue = {
    user: null,
    session: null,
    loading: false,
    isConfigured: false,
    signInWithGoogle: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signUpWithPassword: mockSignUpWithPassword,
    signInWithPassword: mockSignInWithPassword,
    continueAsGuest: mockContinueAsGuest,
    isGuestAcknowledged: false,
    isAuthModalOpen: true,
    openAuthModal: mockOpenAuthModal,
    closeAuthModal: mockCloseAuthModal,
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    mockSignUpWithPassword.mockClear()
    mockSignInWithPassword.mockClear()
    mockContinueAsGuest.mockClear()
    mockCloseAuthModal.mockClear()
    mockOpenAuthModal.mockClear()

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue(defaultAuthValue)
  })

  it('não renderiza nada quando isOpen for false', () => {
    render(<AuthModal isOpen={false} onClose={mockCloseAuthModal} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza o título OrganoCat, abas Criar Conta e Entrar, e bloco explicativo de armazenamento local', () => {
    render(<AuthModal isOpen={true} onClose={mockCloseAuthModal} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('OrganoCat')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Criar Conta' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Entrar' })).toBeInTheDocument()

    // Bloco explicativo
    expect(screen.getByText('O que é Armazenamento Local?')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Seus dados \(tarefas, notas e rotinas\) ficam gravados exclusivamente/i
      )
    ).toBeInTheDocument()
    expect(screen.getByText(/Sem sincronização:/i)).toBeInTheDocument()
    expect(screen.getByText(/Risco de perda:/i)).toBeInTheDocument()
    expect(screen.getByText(/Sem recuperação:/i)).toBeInTheDocument()
  })

  it('alterna entre as abas Criar Conta e Entrar', () => {
    render(<AuthModal isOpen={true} onClose={mockCloseAuthModal} />)

    const tabCriar = screen.getByRole('tab', { name: 'Criar Conta' })
    const tabEntrar = screen.getByRole('tab', { name: 'Entrar' })

    expect(tabCriar).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByLabelText('Seu Nome ou Apelido')).toBeInTheDocument()

    // Clica na aba Entrar
    fireEvent.click(tabEntrar)
    expect(tabEntrar).toHaveAttribute('aria-selected', 'true')
    expect(tabCriar).toHaveAttribute('aria-selected', 'false')
    expect(screen.queryByLabelText('Seu Nome ou Apelido')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar na conta/i })).toBeInTheDocument()

    // Retorna para Criar Conta
    fireEvent.click(tabCriar)
    expect(tabCriar).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByLabelText('Seu Nome ou Apelido')).toBeInTheDocument()
  })

  it('valida senha em tempo real no cadastro exigindo no mínimo 8 caracteres', () => {
    render(<AuthModal isOpen={true} onClose={mockCloseAuthModal} />)

    const nameInput = screen.getByLabelText('Seu Nome ou Apelido')
    const emailInput = screen.getByLabelText('Seu e-mail')
    const passwordInput = screen.getByLabelText('Senha')
    const submitBtn = screen.getByRole('button', { name: /criar conta e começar/i })

    // Inicialmente sem valor de senha
    expect(screen.getByText('Mínimo de 8 caracteres.')).toBeInTheDocument()
    expect(submitBtn).toBeDisabled()

    // Digita nome e email
    fireEvent.change(nameInput, { target: { value: 'Lucas Mendes' } })
    fireEvent.change(emailInput, { target: { value: 'lucas@example.com' } })
    expect(submitBtn).toBeDisabled()

    // Digita senha curta (5 caracteres)
    fireEvent.change(passwordInput, { target: { value: '12345' } })
    expect(
      screen.getByText(/A senha precisa de pelo menos 8 caracteres \(faltam 3\)/i)
    ).toBeInTheDocument()
    expect(submitBtn).toBeDisabled()

    // Digita senha válida (8 caracteres)
    fireEvent.change(passwordInput, { target: { value: '12345678' } })
    expect(
      screen.getByText(/Senha válida \(mínimo de 8 caracteres\)/i)
    ).toBeInTheDocument()
    expect(submitBtn).not.toBeDisabled()
  })

  it('permite alternar a visibilidade da senha entre texto e senha oculta', () => {
    render(<AuthModal isOpen={true} onClose={mockCloseAuthModal} />)

    const passwordInput = screen.getByLabelText('Senha')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleBtn = screen.getByLabelText('Mostrar senha')
    fireEvent.click(toggleBtn)
    expect(passwordInput).toHaveAttribute('type', 'text')

    const hideBtn = screen.getByLabelText('Ocultar senha')
    fireEvent.click(hideBtn)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('mantém o botão Continuar sem Conta desabilitado até marcar o checkbox de consentimento', () => {
    render(<AuthModal isOpen={true} onClose={mockCloseAuthModal} />)

    const guestBtn = screen.getByRole('button', { name: /continuar sem conta/i })
    const checkbox = screen.getByRole('checkbox', {
      name: /estou ciente de que meus dados ficarão salvos apenas neste navegador/i,
    })

    expect(guestBtn).toBeDisabled()
    expect(checkbox).not.toBeChecked()

    // Marca o checkbox
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(guestBtn).not.toBeDisabled()

    // Desmarca o checkbox
    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(guestBtn).toBeDisabled()
  })

  it('chama continueAsGuest e fecha o modal ao confirmar modo convidado', () => {
    const handleClose = vi.fn()
    render(<AuthModal isOpen={true} onClose={handleClose} />)

    const checkbox = screen.getByRole('checkbox', {
      name: /estou ciente de que meus dados ficarão salvos apenas neste navegador/i,
    })
    const guestBtn = screen.getByRole('button', { name: /continuar sem conta/i })

    fireEvent.click(checkbox)
    fireEvent.click(guestBtn)

    expect(mockContinueAsGuest).toHaveBeenCalledTimes(1)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('submete cadastro com sucesso chamando signUpWithPassword', async () => {
    const handleClose = vi.fn()
    render(<AuthModal isOpen={true} onClose={handleClose} />)

    fireEvent.change(screen.getByLabelText('Seu Nome ou Apelido'), {
      target: { value: 'Mariana Lima' },
    })
    fireEvent.change(screen.getByLabelText('Seu e-mail'), {
      target: { value: 'mariana@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senhaForte123' },
    })

    const submitBtn = screen.getByRole('button', { name: /criar conta e começar/i })
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(mockSignUpWithPassword).toHaveBeenCalledWith(
      'Mariana Lima',
      'mariana@example.com',
      'senhaForte123'
    )
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('submete login com sucesso chamando signInWithPassword', async () => {
    const handleClose = vi.fn()
    render(<AuthModal isOpen={true} onClose={handleClose} />)

    // Vai para a aba Entrar
    fireEvent.click(screen.getByRole('tab', { name: 'Entrar' }))

    fireEvent.change(screen.getByLabelText('Seu e-mail'), {
      target: { value: 'pedro@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'minhaSenhaSegura' },
    })

    const submitBtn = screen.getByRole('button', { name: /entrar na conta/i })
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(mockSignInWithPassword).toHaveBeenCalledWith(
      'pedro@example.com',
      'minhaSenhaSegura'
    )
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('fecha o modal ao clicar no botão X e ao pressionar Escape', () => {
    const handleClose = vi.fn()
    render(<AuthModal isOpen={true} onClose={handleClose} />)

    const closeButton = screen.getByLabelText('Fechar')
    fireEvent.click(closeButton)
    expect(handleClose).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(2)
  })
})
