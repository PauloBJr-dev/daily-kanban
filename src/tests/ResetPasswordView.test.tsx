import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { ResetPasswordView } from '../views/ResetPasswordView'
import * as useAuthModule from '../hooks/useAuth'

describe('ResetPasswordView Component', () => {
  const mockUpdateUserPassword = vi.fn().mockResolvedValue({ error: null })
  const mockSignOut = vi.fn().mockResolvedValue({ error: null })
  const mockOpenAuthModal = vi.fn()
  const mockOnSuccess = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnToggleTheme = vi.fn()

  const defaultAuthValue = {
    user: null,
    session: null,
    loading: false,
    isConfigured: true,
    authModalInitialTab: undefined as 'signin' | 'signup' | undefined,
    isPasswordRecovery: false,
    setIsPasswordRecovery: vi.fn(),
    signInWithGoogle: vi.fn().mockResolvedValue({ error: null }),
    signOut: mockSignOut,
    signUpWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    updateUserPassword: mockUpdateUserPassword,
    continueAsGuest: vi.fn(),
    isGuestAcknowledged: true,
    isAuthModalOpen: false,
    openAuthModal: mockOpenAuthModal,
    closeAuthModal: vi.fn(),
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    mockUpdateUserPassword.mockClear()
    mockSignOut.mockClear()
    mockOpenAuthModal.mockClear()
    mockOnSuccess.mockClear()
    mockOnCancel.mockClear()
    mockOnToggleTheme.mockClear()

    // Configura window.location padrão limpo
    delete (window as any).location
    window.location = new URL('http://localhost:5173/') as any

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({ ...defaultAuthValue })
  })

  describe('Segurança e Bloqueio de Acesso Indevido à URL', () => {
    it('bloqueia o formulário e exibe o card de alerta de segurança quando acessado diretamente sem token/sessão', () => {
      window.location = new URL('http://localhost:5173/reset-password') as any
      vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        ...defaultAuthValue,
        isPasswordRecovery: false,
      })

      render(<ResetPasswordView onCancel={mockOnCancel} onSuccess={mockOnSuccess} />)

      // Deve exibir o aviso de segurança
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Link inválido ou expirado')).toBeInTheDocument()
      expect(
        screen.getByText(
          /Por motivos de segurança, a redefinição de senha só pode ser feita através do link enviado ao seu e-mail/i
        )
      ).toBeInTheDocument()

      // Os campos de senha não devem existir
      expect(screen.queryByLabelText('Nova Senha')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Confirmar Nova Senha')).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /Redefinir Senha/i })
      ).not.toBeInTheDocument()

      // Botões de navegação
      const btnHome = screen.getByRole('button', { name: /Voltar para o início/i })
      fireEvent.click(btnHome)
      expect(mockOnCancel).toHaveBeenCalled()

      const btnNewLink = screen.getByRole('button', { name: /Solicitar novo link/i })
      fireEvent.click(btnNewLink)
      expect(mockOpenAuthModal).toHaveBeenCalledWith('signin')
    })

    it('permite acesso ao formulário quando isPasswordRecovery for true', () => {
      vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        ...defaultAuthValue,
        isPasswordRecovery: true,
      })

      render(<ResetPasswordView onCancel={mockOnCancel} onSuccess={mockOnSuccess} />)

      expect(screen.queryByText('Link inválido ou expirado')).not.toBeInTheDocument()
      expect(screen.getByText('Criar Nova Senha')).toBeInTheDocument()
      expect(screen.getByLabelText('Nova Senha')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirmar Nova Senha')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Redefinir Senha/i })).toBeInTheDocument()
    })

    it('permite acesso ao formulário quando a URL contiver hash com type=recovery e higieniza a URL', () => {
      window.location = new URL(
        'http://localhost:5173/reset-password#access_token=fake-token&type=recovery'
      ) as any
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState')

      render(<ResetPasswordView onCancel={mockOnCancel} onSuccess={mockOnSuccess} />)

      expect(screen.getByText('Criar Nova Senha')).toBeInTheDocument()
      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/reset-password')
    })
  })

  describe('Validação de Senha em Tempo Real e Indicador de Força', () => {
    beforeEach(() => {
      vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        ...defaultAuthValue,
        isPasswordRecovery: true,
      })
    })

    it('avalia senha fraca (< 8 caracteres ou sem número/símbolo) com cor vermelha e barra em 33%', () => {
      render(<ResetPasswordView onCancel={mockOnCancel} onSuccess={mockOnSuccess} />)

      const passwordInput = screen.getByLabelText('Nova Senha')
      const submitBtn = screen.getByRole('button', { name: /Redefinir Senha/i })

      // Inicialmente desabilitado
      expect(submitBtn).toBeDisabled()

      // Digita apenas 4 letras
      fireEvent.change(passwordInput, { target: { value: 'abcd' } })

      expect(screen.getByText('Fraca')).toBeInTheDocument()
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '33')
      expect(submitBtn).toBeDisabled()
    })

    it('avalia senha média (8+ caracteres e apenas um dos requisitos) com cor amarela e barra em 66%', () => {
      render(<ResetPasswordView onCancel={mockOnCancel} onSuccess={mockOnSuccess} />)

      const passwordInput = screen.getByLabelText('Nova Senha')
      const submitBtn = screen.getByRole('button', { name: /Redefinir Senha/i })

      // Digita 8 caracteres com número mas sem símbolo
      fireEvent.change(passwordInput, { target: { value: 'Senha123' } })

      expect(screen.getByText('Média')).toBeInTheDocument()
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '66')
      expect(submitBtn).toBeDisabled()
    })

    it('avalia senha forte (8+ caracteres + número + símbolo) com cor verde e barra em 100%', () => {
      render(<ResetPasswordView onCancel={mockOnCancel} onSuccess={mockOnSuccess} />)

      const passwordInput = screen.getByLabelText('Nova Senha')

      // Digita 8 caracteres com número E símbolo especial
      fireEvent.change(passwordInput, { target: { value: 'Senha@123' } })

      expect(screen.getByText('Forte')).toBeInTheDocument()
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '100')
    })

    it('atualiza o checklist visual dos requisitos em tempo real', () => {
      render(<ResetPasswordView onCancel={mockOnCancel} onSuccess={mockOnSuccess} />)

      const passwordInput = screen.getByLabelText('Nova Senha')
      const confirmInput = screen.getByLabelText('Confirmar Nova Senha')

      // Requisitos na tela
      expect(screen.getByText('Mínimo de 8 caracteres')).toBeInTheDocument()
      expect(screen.getByText('Pelo menos 1 número')).toBeInTheDocument()
      expect(
        screen.getByText('Pelo menos 1 símbolo especial (!@#$%...)')
      ).toBeInTheDocument()
      expect(screen.getByText('Senhas coincidem')).toBeInTheDocument()

      // Digita senha válida completa
      fireEvent.change(passwordInput, { target: { value: 'Organy#2026' } })

      // Confirmação diferente
      fireEvent.change(confirmInput, { target: { value: 'Organy#2025' } })
      const submitBtn = screen.getByRole('button', { name: /Redefinir Senha/i })
      expect(submitBtn).toBeDisabled()

      // Confirmação idêntica
      fireEvent.change(confirmInput, { target: { value: 'Organy#2026' } })
      expect(submitBtn).not.toBeDisabled()
    })

    it('permite alternar visibilidade de ambos os campos de senha', () => {
      render(<ResetPasswordView onCancel={mockOnCancel} onSuccess={mockOnSuccess} />)

      const passwordInput = screen.getByLabelText('Nova Senha')
      const confirmInput = screen.getByLabelText('Confirmar Nova Senha')

      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(confirmInput).toHaveAttribute('type', 'password')

      const togglePasswordBtn = screen.getByLabelText('Mostrar nova senha')
      fireEvent.click(togglePasswordBtn)
      expect(passwordInput).toHaveAttribute('type', 'text')

      const toggleConfirmBtn = screen.getByLabelText('Mostrar confirmação de senha')
      fireEvent.click(toggleConfirmBtn)
      expect(confirmInput).toHaveAttribute('type', 'text')
    })
  })

  describe('Fluxo de Submissão, Término de Sessão e Sucesso', () => {
    beforeEach(() => {
      vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        ...defaultAuthValue,
        isPasswordRecovery: true,
      })
    })

    it('submete com sucesso chamando updateUserPassword, chamando signOut e renderizando tela de confirmação', async () => {
      render(<ResetPasswordView onCancel={mockOnCancel} onSuccess={mockOnSuccess} />)

      fireEvent.change(screen.getByLabelText('Nova Senha'), {
        target: { value: 'NovaSenha#2026' },
      })
      fireEvent.change(screen.getByLabelText('Confirmar Nova Senha'), {
        target: { value: 'NovaSenha#2026' },
      })

      const submitBtn = screen.getByRole('button', { name: /Redefinir Senha/i })
      expect(submitBtn).not.toBeDisabled()

      await act(async () => {
        fireEvent.click(submitBtn)
      })

      expect(mockUpdateUserPassword).toHaveBeenCalledWith('NovaSenha#2026')
      expect(mockSignOut).toHaveBeenCalled()

      // Tela de sucesso
      await waitFor(() => {
        expect(screen.getByText('Senha redefinida com sucesso!')).toBeInTheDocument()
      })

      const loginBtn = screen.getByRole('button', { name: /Ir para o Login/i })
      fireEvent.click(loginBtn)
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    it('exibe mensagem de erro caso o Supabase falhe na atualização da senha', async () => {
      mockUpdateUserPassword.mockResolvedValueOnce({
        error: new Error('Token expirado ou inválido.'),
      })

      render(<ResetPasswordView onCancel={mockOnCancel} onSuccess={mockOnSuccess} />)

      fireEvent.change(screen.getByLabelText('Nova Senha'), {
        target: { value: 'NovaSenha#2026' },
      })
      fireEvent.change(screen.getByLabelText('Confirmar Nova Senha'), {
        target: { value: 'NovaSenha#2026' },
      })

      const submitBtn = screen.getByRole('button', { name: /Redefinir Senha/i })

      await act(async () => {
        fireEvent.click(submitBtn)
      })

      expect(mockUpdateUserPassword).toHaveBeenCalled()
      expect(mockSignOut).not.toHaveBeenCalled()
      expect(screen.getByText('Token expirado ou inválido.')).toBeInTheDocument()
      expect(screen.queryByText('Senha redefinida com sucesso!')).not.toBeInTheDocument()
    })
  })
})
