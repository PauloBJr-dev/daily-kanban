import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PasswordResetModal } from '../components/profile/PasswordResetModal'
import * as supabaseModule from '../lib/supabase'

describe('PasswordResetModal Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('não renderiza nada se isOpen for false', () => {
    const { container } = render(
      <PasswordResetModal
        isOpen={false}
        onClose={vi.fn()}
        userEmail="teste@exemplo.com"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renderiza corretamente e envia link de recuperação com sucesso', async () => {
    const onClose = vi.fn()
    vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(true)
    const resetSpy = vi
      .spyOn(supabaseModule.supabase.auth, 'resetPasswordForEmail')
      .mockResolvedValue({
        data: {},
        error: null,
      } as never)

    render(
      <PasswordResetModal isOpen={true} onClose={onClose} userEmail="teste@exemplo.com" />
    )

    expect(screen.getByText('Alterar Senha')).toBeInTheDocument()
    expect(screen.getByText('teste@exemplo.com')).toBeInTheDocument()

    const submitBtn = screen.getByRole('button', { name: /Enviar Link de Recuperação/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Link de redefinição enviado!/i)).toBeInTheDocument()
    })

    expect(resetSpy).toHaveBeenCalledWith('teste@exemplo.com', {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    const closeBtns = screen.getAllByRole('button', { name: /Fechar/i })
    fireEvent.click(closeBtns[0])
    expect(onClose).toHaveBeenCalled()
  })
})
