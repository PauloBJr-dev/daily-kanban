import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, renderHook } from '@testing-library/react'
import { App } from '../App'
import { ShortcutsModal } from '../components/ShortcutsModal'
import { useGlobalShortcuts, isEditableElement } from '../hooks/useGlobalShortcuts'

describe('ShortcutsModal Component', () => {
  it('não renderiza nada quando isOpen é false', () => {
    render(<ShortcutsModal isOpen={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza o modal, título e todos os atalhos quando isOpen é true', () => {
    render(<ShortcutsModal isOpen={true} onClose={() => {}} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Atalhos de Teclado')).toBeInTheDocument()

    // Key badges
    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText('/')).toBeInTheDocument()
    expect(screen.getByText('P')).toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument()
    expect(screen.getByText('Esc')).toBeInTheDocument()

    // Descriptions
    expect(screen.getByText('Nova Tarefa')).toBeInTheDocument()
    expect(screen.getByText('Buscar Tarefas')).toBeInTheDocument()
    expect(screen.getByText('Timer Pomodoro')).toBeInTheDocument()
    expect(screen.getByText('Guia de Atalhos')).toBeInTheDocument()
    expect(screen.getByText('Fechar Painéis')).toBeInTheDocument()
  })

  it('chama onClose ao clicar no botão fechar (X)', () => {
    const handleClose = vi.fn()
    render(<ShortcutsModal isOpen={true} onClose={handleClose} />)

    const closeBtn = screen.getByLabelText('Fechar atalhos')
    fireEvent.click(closeBtn)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao clicar no botão Entendido no rodapé', () => {
    const handleClose = vi.fn()
    render(<ShortcutsModal isOpen={true} onClose={handleClose} />)

    const ackBtn = screen.getByText('Entendido')
    fireEvent.click(ackBtn)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao pressionar a tecla Escape', () => {
    const handleClose = vi.fn()
    render(<ShortcutsModal isOpen={true} onClose={handleClose} />)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})

describe('isEditableElement helper', () => {
  it('detecta corretamente elementos de input, textarea e select', () => {
    const input = document.createElement('input')
    const textarea = document.createElement('textarea')
    const select = document.createElement('select')
    const div = document.createElement('div')
    const editableDiv = document.createElement('div')
    editableDiv.contentEditable = 'true'

    expect(isEditableElement(input)).toBe(true)
    expect(isEditableElement(textarea)).toBe(true)
    expect(isEditableElement(select)).toBe(true)
    expect(isEditableElement(editableDiv)).toBe(true)
    expect(isEditableElement(div)).toBe(false)
    expect(isEditableElement(null)).toBe(false)
  })
})

describe('useGlobalShortcuts Hook', () => {
  it('executa onNewTask ao pressionar n ou N fora de inputs', () => {
    const onNewTask = vi.fn()
    const onFocusSearch = vi.fn()
    const onTogglePomodoro = vi.fn()
    const onOpenShortcuts = vi.fn()

    renderHook(() =>
      useGlobalShortcuts({
        onNewTask,
        onFocusSearch,
        onTogglePomodoro,
        onOpenShortcuts,
      })
    )

    fireEvent.keyDown(window, { key: 'n' })
    expect(onNewTask).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'N' })
    expect(onNewTask).toHaveBeenCalledTimes(2)
  })

  it('executa onFocusSearch ao pressionar / e previne evento padrão', () => {
    const onNewTask = vi.fn()
    const onFocusSearch = vi.fn()
    const onTogglePomodoro = vi.fn()
    const onOpenShortcuts = vi.fn()

    renderHook(() =>
      useGlobalShortcuts({
        onNewTask,
        onFocusSearch,
        onTogglePomodoro,
        onOpenShortcuts,
      })
    )

    const event = new KeyboardEvent('keydown', { key: '/', cancelable: true })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    window.dispatchEvent(event)

    expect(onFocusSearch).toHaveBeenCalledTimes(1)
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('executa onTogglePomodoro ao pressionar p ou P', () => {
    const onNewTask = vi.fn()
    const onFocusSearch = vi.fn()
    const onTogglePomodoro = vi.fn()
    const onOpenShortcuts = vi.fn()

    renderHook(() =>
      useGlobalShortcuts({
        onNewTask,
        onFocusSearch,
        onTogglePomodoro,
        onOpenShortcuts,
      })
    )

    fireEvent.keyDown(window, { key: 'p' })
    expect(onTogglePomodoro).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'P' })
    expect(onTogglePomodoro).toHaveBeenCalledTimes(2)
  })

  it('executa onOpenShortcuts ao pressionar ?', () => {
    const onNewTask = vi.fn()
    const onFocusSearch = vi.fn()
    const onTogglePomodoro = vi.fn()
    const onOpenShortcuts = vi.fn()

    renderHook(() =>
      useGlobalShortcuts({
        onNewTask,
        onFocusSearch,
        onTogglePomodoro,
        onOpenShortcuts,
      })
    )

    fireEvent.keyDown(window, { key: '?' })
    expect(onOpenShortcuts).toHaveBeenCalledTimes(1)
  })

  it('ignora atalhos se o alvo for um elemento de texto (input)', () => {
    const onNewTask = vi.fn()
    const onFocusSearch = vi.fn()
    const onTogglePomodoro = vi.fn()
    const onOpenShortcuts = vi.fn()

    renderHook(() =>
      useGlobalShortcuts({
        onNewTask,
        onFocusSearch,
        onTogglePomodoro,
        onOpenShortcuts,
      })
    )

    const input = document.createElement('input')
    document.body.appendChild(input)

    fireEvent.keyDown(input, { key: 'n' })
    fireEvent.keyDown(input, { key: '/' })
    fireEvent.keyDown(input, { key: 'p' })
    fireEvent.keyDown(input, { key: '?' })

    expect(onNewTask).not.toHaveBeenCalled()
    expect(onFocusSearch).not.toHaveBeenCalled()
    expect(onTogglePomodoro).not.toHaveBeenCalled()
    expect(onOpenShortcuts).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('ignora atalhos com teclas modificadoras (ctrlKey, metaKey, altKey)', () => {
    const onNewTask = vi.fn()
    const onFocusSearch = vi.fn()
    const onTogglePomodoro = vi.fn()
    const onOpenShortcuts = vi.fn()

    renderHook(() =>
      useGlobalShortcuts({
        onNewTask,
        onFocusSearch,
        onTogglePomodoro,
        onOpenShortcuts,
      })
    )

    fireEvent.keyDown(window, { key: 'n', ctrlKey: true })
    fireEvent.keyDown(window, { key: 'n', metaKey: true })
    fireEvent.keyDown(window, { key: 'n', altKey: true })

    expect(onNewTask).not.toHaveBeenCalled()
  })

  it('não dispara eventos quando enabled é false', () => {
    const onNewTask = vi.fn()
    const onFocusSearch = vi.fn()
    const onTogglePomodoro = vi.fn()
    const onOpenShortcuts = vi.fn()

    renderHook(() =>
      useGlobalShortcuts({
        onNewTask,
        onFocusSearch,
        onTogglePomodoro,
        onOpenShortcuts,
        enabled: false,
      })
    )

    fireEvent.keyDown(window, { key: 'n' })
    fireEvent.keyDown(window, { key: '/' })
    fireEvent.keyDown(window, { key: 'p' })
    fireEvent.keyDown(window, { key: '?' })

    expect(onNewTask).not.toHaveBeenCalled()
    expect(onFocusSearch).not.toHaveBeenCalled()
    expect(onTogglePomodoro).not.toHaveBeenCalled()
    expect(onOpenShortcuts).not.toHaveBeenCalled()
  })
})

describe('App Global Shortcuts Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('abre o modal de Nova Tarefa ao pressionar "n" na tela', () => {
    render(<App />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'n' })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nova Tarefa' })).toBeInTheDocument()
  })

  it('não abre o modal de Nova Tarefa ao pressionar "n" dentro de um input', () => {
    render(<App />)

    const searchInput = screen.getByLabelText('Buscar tarefas ou tags')
    searchInput.focus()

    fireEvent.keyDown(searchInput, { key: 'n' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('foca na barra de pesquisa ao pressionar "/"', () => {
    render(<App />)

    const searchInput = screen.getByLabelText('Buscar tarefas ou tags')
    expect(document.activeElement).not.toBe(searchInput)

    fireEvent.keyDown(window, { key: '/' })

    expect(document.activeElement).toBe(searchInput)
  })

  it('inicia e pausa o timer Pomodoro ao pressionar "p"', () => {
    render(<App />)

    // Initially, play button is available
    const playBtn = screen.getByLabelText(/Iniciar foco/i)
    expect(playBtn).toBeInTheDocument()

    // Press P to start
    fireEvent.keyDown(window, { key: 'p' })

    // Now pause button should be available
    const pauseBtn = screen.getByLabelText(/Pausar cronômetro/i)
    expect(pauseBtn).toBeInTheDocument()

    // Press P to pause
    fireEvent.keyDown(window, { key: 'p' })

    expect(screen.getByLabelText(/Iniciar foco/i)).toBeInTheDocument()
  })

  it('abre e fecha o ShortcutsModal ao pressionar "?" e "Escape"', () => {
    render(<App />)

    expect(screen.queryByText('Atalhos de Teclado')).not.toBeInTheDocument()

    // Press ?
    fireEvent.keyDown(window, { key: '?' })

    expect(screen.getByText('Atalhos de Teclado')).toBeInTheDocument()

    // Press Escape to close
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByText('Atalhos de Teclado')).not.toBeInTheDocument()
  })

  it('abre o ShortcutsModal ao clicar no botão de atalhos no cabeçalho', () => {
    render(<App />)

    const shortcutsHeaderBtn = screen.getByRole('button', {
      name: /Atalhos de teclado/i,
    })
    expect(shortcutsHeaderBtn).toBeInTheDocument()

    fireEvent.click(shortcutsHeaderBtn)

    expect(screen.getByText('Atalhos de Teclado')).toBeInTheDocument()
  })
})
