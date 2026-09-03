import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Toast } from '../components/Toast'
import { ToastContainer } from '../components/ToastContainer'
import { ToastProvider, useToast } from '../hooks/useToast'
import type { ToastItem } from '../types/toast'

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renderiza o toast com mensagem, acessibilidade e ícone apropriado', () => {
    const onDismiss = vi.fn()
    const toastItem: ToastItem = {
      id: 'toast-1',
      message: 'Tarefa criada com sucesso',
      type: 'success',
      duration: 3500,
    }

    render(<Toast toast={toastItem} onDismiss={onDismiss} />)

    const statusElement = screen.getByRole('status')
    expect(statusElement).toBeInTheDocument()
    expect(statusElement).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('Tarefa criada com sucesso')).toBeInTheDocument()
  })

  it('renderiza diferentes tipos de toast (error, warning, info)', () => {
    const onDismiss = vi.fn()
    const { rerender } = render(
      <Toast
        toast={{ id: 'err', message: 'Erro crítico', type: 'error' }}
        onDismiss={onDismiss}
      />
    )
    expect(screen.getByText('Erro crítico')).toBeInTheDocument()

    rerender(
      <Toast
        toast={{ id: 'warn', message: 'Aviso importante', type: 'warning' }}
        onDismiss={onDismiss}
      />
    )
    expect(screen.getByText('Aviso importante')).toBeInTheDocument()

    rerender(
      <Toast
        toast={{ id: 'inf', message: 'Info geral', type: 'info' }}
        onDismiss={onDismiss}
      />
    )
    expect(screen.getByText('Info geral')).toBeInTheDocument()
  })

  it('executa auto-dismiss após o tempo de duration configurado', () => {
    const onDismiss = vi.fn()
    const toastItem: ToastItem = {
      id: 'toast-auto',
      message: 'Mensagem com auto-dismiss',
      type: 'info',
      duration: 3000,
    }

    render(<Toast toast={toastItem} onDismiss={onDismiss} />)

    expect(onDismiss).not.toHaveBeenCalled()

    // Fast-forward 2999ms
    act(() => {
      vi.advanceTimersByTime(2999)
    })
    expect(onDismiss).not.toHaveBeenCalled()

    // Fast-forward remaining 1ms
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onDismiss).toHaveBeenCalledWith('toast-auto')
  })

  it('chama onDismiss ao clicar no botão de fechar', () => {
    const onDismiss = vi.fn()
    const toastItem: ToastItem = {
      id: 'toast-close',
      message: 'Toast para fechar',
      type: 'info',
    }

    render(<Toast toast={toastItem} onDismiss={onDismiss} />)

    const closeButton = screen.getByRole('button', { name: 'Fechar notificação' })
    fireEvent.click(closeButton)

    expect(onDismiss).toHaveBeenCalledWith('toast-close')
  })

  it('executa ação customizada (ex: Desfazer) e fecha o toast ao clicar no botão de ação', () => {
    const onDismiss = vi.fn()
    const handleUndo = vi.fn()
    const toastItem: ToastItem = {
      id: 'toast-undo',
      message: 'Tarefa excluída',
      type: 'info',
      action: {
        label: 'Desfazer',
        onClick: handleUndo,
      },
    }

    render(<Toast toast={toastItem} onDismiss={onDismiss} />)

    const actionButton = screen.getByRole('button', { name: 'Desfazer' })
    expect(actionButton).toBeInTheDocument()

    fireEvent.click(actionButton)

    expect(handleUndo).toHaveBeenCalledTimes(1)
    expect(onDismiss).toHaveBeenCalledWith('toast-undo')
  })
})

describe('ToastContainer & useToast integration', () => {
  it('renderiza toasts disparados via hook useToast dentro do Provider', () => {
    const TestComponent = () => {
      const { success, error, info, warning } = useToast()
      return (
        <div>
          <button onClick={() => success('Sucesso disparado')}>Disparar Sucesso</button>
          <button onClick={() => error('Erro disparado')}>Disparar Erro</button>
          <button onClick={() => info('Info disparada')}>Disparar Info</button>
          <button onClick={() => warning('Aviso disparado')}>Disparar Aviso</button>
          <ToastContainer />
        </div>
      )
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Disparar Sucesso'))
    expect(screen.getByText('Sucesso disparado')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Disparar Erro'))
    expect(screen.getByText('Erro disparado')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Disparar Info'))
    expect(screen.getByText('Info disparada')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Disparar Aviso'))
    expect(screen.getByText('Aviso disparado')).toBeInTheDocument()
  })
})
