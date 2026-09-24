import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ColumnDeleteModal } from '../components/ColumnDeleteModal'
import { generateSecurityCode, type Column } from '../types/kanban'

describe('ColumnDeleteModal Component', () => {
  const mockColumn: Column = {
    id: 'col-custom-1',
    title: 'Coluna de Teste',
    order: 4,
    colorTheme: 'purple',
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('generateSecurityCode gera código de 8 caracteres alfanuméricos em maiúsculas (A-Z e 0-9)', () => {
    const code = generateSecurityCode()
    expect(code).toHaveLength(8)
    expect(code).toMatch(/^[A-Z0-9]{8}$/)
  })

  it('não renderiza nada quando isOpen é false', () => {
    render(
      <ColumnDeleteModal
        isOpen={false}
        column={mockColumn}
        taskCount={3}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza título, contador de tarefas e opções A e B quando há tarefas', () => {
    render(
      <ColumnDeleteModal
        isOpen={true}
        column={mockColumn}
        taskCount={5}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByText('Excluir Coluna Customizada')).toBeInTheDocument()
    expect(screen.getByText('Coluna de Teste')).toBeInTheDocument()
    expect(screen.getByText('5 tarefas')).toBeInTheDocument()
    expect(
      screen.getByText(/Excluir a coluna E todas as tarefas que estão nela/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/mover automaticamente as tarefas para a coluna "A Fazer"/i)
    ).toBeInTheDocument()
  })

  it('exibe aviso de coluna vazia quando taskCount for 0', () => {
    render(
      <ColumnDeleteModal
        isOpen={true}
        column={mockColumn}
        taskCount={0}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByText('0 tarefas')).toBeInTheDocument()
    expect(
      screen.getByText('Esta coluna está vazia e pronta para exclusão.')
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Excluir a coluna E todas as tarefas que estão nela/i)
    ).not.toBeInTheDocument()
  })

  it('permite alternar para a opção B (mover para "A Fazer")', () => {
    render(
      <ColumnDeleteModal
        isOpen={true}
        column={mockColumn}
        taskCount={2}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    const moveOption = screen.getByText(
      /mover automaticamente as tarefas para a coluna "A Fazer"/i
    )
    fireEvent.click(moveOption)

    const radioB = screen.getByRole('radio', {
      name: /mover automaticamente as tarefas para a coluna "A Fazer"/i,
    })
    expect(radioB).toHaveAttribute('aria-checked', 'true')
  })

  it('controla countdown de 3 segundos após digitar o código correto e habilita exclusão', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <ColumnDeleteModal
        isOpen={true}
        column={mockColumn}
        taskCount={3}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    // Identifica o código gerado no badge
    const badge = screen.getByTestId('security-code-badge')
    const code = badge.textContent || ''
    expect(code).toHaveLength(8)

    const submitBtn = screen.getByTestId('confirm-delete-column-btn')
    expect(submitBtn).toBeDisabled()

    const input = screen.getByPlaceholderText('Digite o código de 8 dígitos...')

    // Digita código errado
    fireEvent.change(input, { target: { value: 'ERRADO01' } })
    expect(submitBtn).toBeDisabled()

    // Digita o código exato
    fireEvent.change(input, { target: { value: code } })

    // Botão deve mostrar contagem regressiva de 3s e continuar desabilitado
    expect(submitBtn).toBeDisabled()
    expect(submitBtn).toHaveTextContent('Excluir Coluna (3s)')

    // Avança 1 segundo
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(submitBtn).toHaveTextContent('Excluir Coluna (2s)')
    expect(submitBtn).toBeDisabled()

    // Avança mais 1 segundo
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(submitBtn).toHaveTextContent('Excluir Coluna (1s)')
    expect(submitBtn).toBeDisabled()

    // Avança para o fim do countdown
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(submitBtn).toHaveTextContent('Excluir Coluna')
    expect(submitBtn).not.toBeDisabled()

    // Clica para confirmar
    fireEvent.click(submitBtn)
    expect(onConfirm).toHaveBeenCalledWith('col-custom-1', 'delete_tasks')
    expect(onClose).toHaveBeenCalled()
  })

  it('reseta a contagem se o usuário apagar ou alterar o código antes do término', () => {
    render(
      <ColumnDeleteModal
        isOpen={true}
        column={mockColumn}
        taskCount={1}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    const badge = screen.getByTestId('security-code-badge')
    const code = badge.textContent || ''
    const input = screen.getByPlaceholderText('Digite o código de 8 dígitos...')
    const submitBtn = screen.getByTestId('confirm-delete-column-btn')

    fireEvent.change(input, { target: { value: code } })
    expect(submitBtn).toHaveTextContent('Excluir Coluna (3s)')

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(submitBtn).toHaveTextContent('Excluir Coluna (2s)')

    // Modifica o input para código incompleto
    fireEvent.change(input, { target: { value: code.substring(0, 5) } })

    // Volta a ser 'Excluir Coluna' desabilitado sem contagem
    expect(submitBtn).toBeDisabled()
    expect(submitBtn).toHaveTextContent('Excluir Coluna')
  })

  it('fecha o modal ao clicar em Cancelar ou pressionar Escape', () => {
    const onClose = vi.fn()
    render(
      <ColumnDeleteModal
        isOpen={true}
        column={mockColumn}
        taskCount={0}
        onClose={onClose}
        onConfirm={vi.fn()}
      />
    )

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(cancelBtn)
    expect(onClose).toHaveBeenCalledTimes(1)

    const dialog = screen.getByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
