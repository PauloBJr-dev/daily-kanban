import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar, type AppView } from '../components/Sidebar'

describe('Sidebar Component', () => {
  const defaultProps = {
    activeView: 'kanban' as AppView,
    onViewChange: vi.fn(),
    isMobileOpen: false,
    onCloseMobile: vi.fn(),
    isCollapsed: false,
    onToggleCollapse: vi.fn(),
  }

  it('renderiza as 5 abas de navegação principais', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getAllByRole('button', { name: 'Kanban' })[0]).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'Espaço Acadêmico' })[0]
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Métricas' })[0]).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'Configurações' })[0]
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Perfil' })[0]).toBeInTheDocument()
  })

  it('marca a aba ativa com aria-current="page"', () => {
    render(<Sidebar {...defaultProps} activeView="metrics" />)

    const metricsBtns = screen.getAllByRole('button', { name: 'Métricas' })
    expect(metricsBtns[0]).toHaveAttribute('aria-current', 'page')
  })

  it('chama onViewChange ao clicar em uma aba de navegação', () => {
    const onViewChange = vi.fn()
    render(<Sidebar {...defaultProps} onViewChange={onViewChange} />)

    const academicBtns = screen.getAllByRole('button', { name: 'Espaço Acadêmico' })
    fireEvent.click(academicBtns[0])

    expect(onViewChange).toHaveBeenCalledWith('academic')
  })

  it('chama onToggleCollapse ao clicar no botão de recolher/expandir', () => {
    const onToggleCollapse = vi.fn()
    render(<Sidebar {...defaultProps} onToggleCollapse={onToggleCollapse} />)

    const toggleBtn = screen.getByRole('button', { name: 'Recolher barra lateral' })
    fireEvent.click(toggleBtn)

    expect(onToggleCollapse).toHaveBeenCalledTimes(1)
  })

  it('renderiza ícone de expandir quando a barra está recolhida', () => {
    render(<Sidebar {...defaultProps} isCollapsed={true} />)

    const toggleBtn = screen.getByRole('button', { name: 'Expandir barra lateral' })
    expect(toggleBtn).toBeInTheDocument()
  })

  it('abre o menu drawer mobile quando isMobileOpen é true e fecha ao clicar no botão fechar', () => {
    const onCloseMobile = vi.fn()
    render(
      <Sidebar {...defaultProps} isMobileOpen={true} onCloseMobile={onCloseMobile} />
    )

    const closeBtn = screen.getByRole('button', { name: 'Fechar menu lateral' })
    expect(closeBtn).toBeInTheDocument()

    fireEvent.click(closeBtn)
    expect(onCloseMobile).toHaveBeenCalledTimes(1)
  })
})
