import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from '../components/ConfirmDialog'

describe('ConfirmDialog', () => {
  it('não renderiza quando isOpen for false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Confirmar exclusão"
        message="Tem certeza?"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza título, mensagem e botões quando isOpen for true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirmar exclusão"
        message="Tem certeza que deseja apagar?"
        confirmText="Excluir Agora"
        cancelText="Voltar"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument()
    expect(screen.getByText('Tem certeza que deseja apagar?')).toBeInTheDocument()
    expect(screen.getByText('Excluir Agora')).toBeInTheDocument()
    expect(screen.getByText('Voltar')).toBeInTheDocument()
  })

  it('chama onConfirm e fecha ao clicar no botão de confirmação', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Excluir"
        message="Confirmação"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )

    fireEvent.click(screen.getByText('Confirmar'))
    expect(onConfirm).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('chama onClose ao clicar em Cancelar ou no botão de fechar', () => {
    const onClose = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Excluir"
        message="Confirmação"
        onConfirm={vi.fn()}
        onClose={onClose}
      />
    )

    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalled()
  })
})
