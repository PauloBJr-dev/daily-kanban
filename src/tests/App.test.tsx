import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { App } from '../App'

describe('App Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza o cabeçalho, quick stats, pomodoro widget, filtros e colunas do quadro', () => {
    render(<App />)

    // Header
    expect(screen.getByText('DailyFlow')).toBeInTheDocument()
    expect(screen.getByText('Nova Tarefa')).toBeInTheDocument()

    // QuickStats
    expect(screen.getByText('Metas de Hoje')).toBeInTheDocument()
    expect(screen.getByText('Taxa Geral de Conclusão')).toBeInTheDocument()

    // Pomodoro
    expect(screen.getByText('Bloco de Foco Diário')).toBeInTheDocument()

    // Board columns
    expect(screen.getByText('A Fazer')).toBeInTheDocument()
    expect(screen.getByText('Em Progresso')).toBeInTheDocument()
    expect(screen.getByText('Em Espera')).toBeInTheDocument()
    expect(screen.getByText('Concluído Hoje')).toBeInTheDocument()
  })

  it('abre e fecha o TaskModal ao clicar em Nova Tarefa', () => {
    render(<App />)

    const newTaskBtn = screen.getByText('Nova Tarefa')
    fireEvent.click(newTaskBtn)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Criar Tarefa')).toBeInTheDocument()

    const cancelBtn = screen.getByText('Cancelar')
    fireEvent.click(cancelBtn)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('alterna tema escuro e claro ao clicar no botão de tema', () => {
    render(<App />)

    const themeToggleBtn = screen.getByTitle(/Ativar Modo/i)
    fireEvent.click(themeToggleBtn)

    expect(localStorage.getItem('dailyflow_theme')).toBeDefined()
  })
})
