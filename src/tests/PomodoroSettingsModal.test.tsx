import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PomodoroSettingsModal } from '../components/PomodoroSettingsModal'
import { notificationService } from '../services/notificationService'
import { soundService } from '../services/soundService'

vi.mock('../services/soundService', () => ({
  soundService: {
    previewCatPurr: vi.fn(),
    stopCatPurr: vi.fn(),
  },
}))

describe('PomodoroSettingsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentWorkMinutes: 25,
    currentBreakMinutes: 5,
    isSoundEnabled: true,
    currentCatPurrType: 'none' as const,
    currentCatPurrVolume: 0.6,
    onSave: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não renderiza nada quando isOpen for false', () => {
    render(<PomodoroSettingsModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza o título, presets, inputs, opções de ronrom e botões quando isOpen for true', () => {
    render(<PomodoroSettingsModal {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Configurações do Pomodoro')).toBeInTheDocument()
    expect(screen.getByLabelText(/Duração de Foco/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Duração de Pausa/i)).toBeInTheDocument()
    expect(screen.getByText(/Som ambiente de descanso/i)).toBeInTheDocument()
    expect(screen.getByText('Ronrom Suave')).toBeInTheDocument()
    expect(screen.getByText('Ronrom Profundo')).toBeInTheDocument()
    expect(screen.getByText('Ronrom Rítmico')).toBeInTheDocument()
    expect(screen.getByText('Efeitos Sonoros')).toBeInTheDocument()
    expect(screen.getByText('Notificações do Navegador')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
    expect(screen.getByText('Salvar Configurações')).toBeInTheDocument()
  })

  it('permite selecionar preset de foco e salva os novos valores', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<PomodoroSettingsModal {...defaultProps} onSave={onSave} onClose={onClose} />)

    // Clica no preset de 50m de foco
    const preset50Btn = screen.getByRole('button', {
      name: 'Selecionar 50 minutos de foco',
    })
    fireEvent.click(preset50Btn)

    // Clica no preset de 15m de pausa
    const preset15Btn = screen.getByRole('button', {
      name: 'Selecionar 15 minutos de pausa',
    })
    fireEvent.click(preset15Btn)

    // Clica em Salvar Configurações
    const saveBtn = screen.getByText('Salvar Configurações')
    fireEvent.click(saveBtn)

    expect(onSave).toHaveBeenCalledWith(50, 15, true, 'none', 0.6)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('permite digitar durações customizadas nos inputs numéricos', () => {
    const onSave = vi.fn()

    render(<PomodoroSettingsModal {...defaultProps} onSave={onSave} />)

    const workInput = screen.getByLabelText('Minutos de foco personalizados')
    const breakInput = screen.getByLabelText('Minutos de pausa personalizados')

    fireEvent.change(workInput, { target: { value: '42' } })
    fireEvent.change(breakInput, { target: { value: '8' } })

    fireEvent.click(screen.getByText('Salvar Configurações'))

    expect(onSave).toHaveBeenCalledWith(42, 8, true, 'none', 0.6)
  })

  it('alterna o switch de efeitos sonoros', () => {
    const onSave = vi.fn()

    render(<PomodoroSettingsModal {...defaultProps} onSave={onSave} />)

    const switchBtn = screen.getByRole('switch', { name: /efeitos sonoros/i })
    expect(switchBtn).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(switchBtn)
    expect(switchBtn).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(screen.getByText('Salvar Configurações'))
    expect(onSave).toHaveBeenCalledWith(25, 5, false, 'none', 0.6)
  })

  it('permite selecionar variação de ronrom de gato, ajustar volume e ouvir prévia', () => {
    const onSave = vi.fn()

    render(<PomodoroSettingsModal {...defaultProps} onSave={onSave} />)

    // Clica na opção "Ronrom Profundo"
    const deepPurrBtn = screen.getByRole('radio', { name: /Ronrom Profundo/i })
    fireEvent.click(deepPurrBtn)

    // Slider de volume aparece
    const volumeSlider = screen.getByLabelText('Ajustar volume do ronrom')
    expect(volumeSlider).toBeInTheDocument()
    fireEvent.change(volumeSlider, { target: { value: '0.8' } })

    // Botão de ouvir prévia
    const previewBtn = screen.getByRole('button', { name: /ouvir prévia/i })
    fireEvent.click(previewBtn)
    expect(soundService.previewCatPurr).toHaveBeenCalledWith('deep', 3)

    // Salva configurações
    fireEvent.click(screen.getByText('Salvar Configurações'))
    expect(onSave).toHaveBeenCalledWith(25, 5, true, 'deep', 0.8)
  })

  it('solicita permissão de notificação ao clicar no botão correspondente', async () => {
    vi.spyOn(notificationService, 'getPermission').mockReturnValue('default')
    const requestSpy = vi
      .spyOn(notificationService, 'requestPermission')
      .mockResolvedValue('granted')

    render(<PomodoroSettingsModal {...defaultProps} />)

    const notifBtn = screen.getByRole('button', { name: /Ativar Notificações/i })
    fireEvent.click(notifBtn)

    expect(requestSpy).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.getByText('Ativadas')).toBeInTheDocument()
    })
  })

  it('fecha ao clicar em Cancelar ou pressionar a tecla Escape', () => {
    const onClose = vi.fn()
    render(<PomodoroSettingsModal {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
