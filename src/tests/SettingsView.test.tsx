import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsView } from '../components/settings/SettingsView'

describe('SettingsView Component', () => {
  const defaultProps = {
    isDark: false,
    onToggleTheme: vi.fn(),
    workMinutes: 25,
    breakMinutes: 5,
    isSoundEnabled: true,
    catPurrType: 'soft' as const,
    catPurrVolume: 0.6,
    onUpdateDurations: vi.fn(),
    onToggleSound: vi.fn(),
    onUpdateSettings: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    onReset: vi.fn(),
    onOpenShortcuts: vi.fn(),
    onOpenAcademicSubjects: vi.fn(),
  }

  it('renderiza o cabeçalho e todas as seções de configurações', () => {
    render(<SettingsView {...defaultProps} />)

    expect(screen.getByText('Configurações do Sistema')).toBeInTheDocument()
    expect(screen.getByText('Aparência & Tema')).toBeInTheDocument()
    expect(screen.getByText('Temporizador Pomodoro & Sons')).toBeInTheDocument()
    expect(screen.getByText('Dados & Backup')).toBeInTheDocument()
    expect(screen.getByText('Atalhos do Teclado')).toBeInTheDocument()
  })

  it('chama onToggleTheme ao clicar no seletor de tema claro/escuro', () => {
    const onToggleTheme = vi.fn()
    render(<SettingsView {...defaultProps} onToggleTheme={onToggleTheme} />)

    const darkThemeBtn = screen.getByRole('button', { name: /Selecionar Tema Escuro/i })
    fireEvent.click(darkThemeBtn)

    expect(onToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('permite selecionar presets de duração do Pomodoro e atualiza imediatamente', () => {
    const onUpdateDurations = vi.fn()
    render(<SettingsView {...defaultProps} onUpdateDurations={onUpdateDurations} />)

    const preset50Btn = screen.getByRole('button', {
      name: /Selecionar 50 minutos de foco/i,
    })
    fireEvent.click(preset50Btn)

    expect(onUpdateDurations).toHaveBeenCalledWith(50, 5)
  })

  it('chama onToggleSound ao alternar o som de notificação', () => {
    const onToggleSound = vi.fn()
    render(<SettingsView {...defaultProps} onToggleSound={onToggleSound} />)

    const soundToggle = screen.getByRole('switch', {
      name: /Ativar ou desativar som de alarme/i,
    })
    fireEvent.click(soundToggle)

    expect(onToggleSound).toHaveBeenCalledTimes(1)
  })

  it('aciona exportação, importação e restauração de dados', () => {
    const onExport = vi.fn()
    const onReset = vi.fn()
    render(<SettingsView {...defaultProps} onExport={onExport} onReset={onReset} />)

    const exportBtn = screen.getByRole('button', { name: 'Exportar Backup JSON' })
    fireEvent.click(exportBtn)
    expect(onExport).toHaveBeenCalledTimes(1)

    const resetBtn = screen.getByRole('button', {
      name: 'Restaurar Dados de Demonstração',
    })
    fireEvent.click(resetBtn)
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('abre o modal de atalhos ao clicar no botão correspondente', () => {
    const onOpenShortcuts = vi.fn()
    render(<SettingsView {...defaultProps} onOpenShortcuts={onOpenShortcuts} />)

    const shortcutsBtn = screen.getByRole('button', { name: /Abrir Modal de Ajuda/i })
    fireEvent.click(shortcutsBtn)

    expect(onOpenShortcuts).toHaveBeenCalledTimes(1)
  })
})
