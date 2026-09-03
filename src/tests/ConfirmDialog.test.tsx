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

  it('exige digitação de palavra de segurança quando requireConfirmationWord for informada', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Excluir Coluna Crítica"
        message="Esta coluna contém tarefas ativas."
        confirmText="Excluir Definitivamente"
        requireConfirmationWord="EXCLUIR"
        isDanger
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )

    const confirmButton = screen.getByRole('button', { name: 'Excluir Definitivamente' })
    expect(confirmButton).toBeDisabled()

    const input = screen.getByPlaceholderText('Digite "EXCLUIR"')
    expect(input).toBeInTheDocument()

    // Typing wrong text leaves button disabled
    fireEvent.change(input, { target: { value: 'errado' } })
    expect(confirmButton).toBeDisabled()
    fireEvent.click(confirmButton)
    expect(onConfirm).not.toHaveBeenCalled()

    // Typing exact confirmation word enables button
    fireEvent.change(input, { target: { value: 'EXCLUIR' } })
    expect(confirmButton).not.toBeDisabled()

    fireEvent.click(confirmButton)
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('permite submissão via tecla Enter quando palavra de segurança está correta', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Restaurar Banco"
        message="Confirmação de restauração."
        confirmText="Restaurar"
        requireConfirmationWord="RESTAURAR"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )

    const input = screen.getByPlaceholderText('Digite "RESTAURAR"')
    fireEvent.change(input, { target: { value: 'RESTAURAR' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('gerencia fluxo em duas etapas quando isDoubleConfirm for true', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title="Remover Projeto"
        message="Aviso inicial de segurança."
        confirmText="Excluir Tudo"
        isDoubleConfirm={true}
        isDanger={true}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )

    // Step 1 check
    expect(screen.getByText('Etapa 1 de 2: Verificação')).toBeInTheDocument()
    const continueBtn = screen.getByRole('button', { name: 'Continuar para Confirmação' })
    expect(continueBtn).toBeInTheDocument()

    // Advance to Step 2
    fireEvent.click(continueBtn)
    expect(onConfirm).not.toHaveBeenCalled()

    // Step 2 check
    expect(screen.getByText('Etapa 2 de 2: Definitivo')).toBeInTheDocument()
    expect(screen.getByText('Confirmação Definitiva e Irreversível')).toBeInTheDocument()

    // Final confirm in Step 2
    const finalConfirmBtn = screen.getByRole('button', { name: 'Excluir Tudo' })
    fireEvent.click(finalConfirmBtn)

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
