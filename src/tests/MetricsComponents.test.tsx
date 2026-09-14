import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MetricsHeader } from '../components/metrics/MetricsHeader'
import { MetricsKpiGrid } from '../components/metrics/MetricsKpiGrid'
import { FocusBarChart } from '../components/metrics/FocusBarChart'
import { PriorityDistributionPanel } from '../components/metrics/PriorityDistributionPanel'
import { RecentSessionsPanel } from '../components/metrics/RecentSessionsPanel'
import {
  getISOWeekNumber,
  getAcademicSemester,
  formatMinutesToHours,
  formatShortDuration,
  calculateStreak,
  calculateDailyFocus,
} from '../components/metrics/metricsUtils'
import {
  exportMetricsCSV,
  exportMetricsJSON,
} from '../components/metrics/exportMetricsReport'
import type { Task, Column } from '../types/kanban'

const mockTasks: Task[] = [
  {
    id: 't-1',
    title: 'Refatorar API de autenticação OAuth2',
    columnId: 'col-done',
    priority: 'urgent',
    tags: ['backend', 'segurança'],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    pomodoroMinutesSpent: 50,
  },
  {
    id: 't-2',
    title: 'Pesquisa de benchmark checkout',
    columnId: 'col-progress',
    priority: 'high',
    tags: ['ux-research'],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pomodoroMinutesSpent: 25,
  },
  {
    id: 't-3',
    title: 'Teorema Fundamental do Cálculo',
    columnId: 'col-todo',
    priority: 'medium',
    tags: ['calculo'],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pomodoroMinutesSpent: 25,
  },
  {
    id: 't-4',
    title: 'Implementação de Árvores AVL',
    columnId: 'col-review',
    priority: 'low',
    tags: ['algoritmos'],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pomodoroMinutesSpent: 25,
  },
]

const mockColumns: Column[] = [
  { id: 'col-todo', title: 'A Fazer', order: 0, colorTheme: 'slate' },
  { id: 'col-progress', title: 'Em Progresso', order: 1, colorTheme: 'amber' },
  { id: 'col-review', title: 'Em Espera', order: 2, colorTheme: 'blue' },
  { id: 'col-done', title: 'Concluído Hoje', order: 3, colorTheme: 'emerald' },
]

describe('Metrics Header Component', () => {
  it('dispara alteração de escopo de semana e cliques de exportação', () => {
    const onWeekScopeChange = vi.fn()
    const onExportCSV = vi.fn()
    const onExportJSON = vi.fn()

    render(
      <MetricsHeader
        weekScope="this_week"
        onWeekScopeChange={onWeekScopeChange}
        onExportCSV={onExportCSV}
        onExportJSON={onExportJSON}
      />
    )

    expect(screen.getByText('Painel de Métricas & Produtividade')).toBeInTheDocument()
    expect(screen.getByText(/Semana \d+ • Semestre \d/)).toBeInTheDocument()

    // Week selector buttons
    const lastWeekBtn = screen.getByText('Semana Passada')
    fireEvent.click(lastWeekBtn)
    expect(onWeekScopeChange).toHaveBeenCalledWith('last_week')

    const last30Btn = screen.getByText('Últimos 30 Dias')
    fireEvent.click(last30Btn)
    expect(onWeekScopeChange).toHaveBeenCalledWith('all')

    // Export button
    const exportBtn = screen.getByText('Exportar Relatório')
    fireEvent.click(exportBtn)
    expect(onExportCSV).toHaveBeenCalledTimes(1)

    // Open options dropdown
    const optionsBtn = screen.getByLabelText('Opções de exportação')
    fireEvent.click(optionsBtn)
    const jsonBtn = screen.getByText('Baixar Dados (JSON)')
    fireEvent.click(jsonBtn)
    expect(onExportJSON).toHaveBeenCalledTimes(1)
  })
})

describe('MetricsKpiGrid Component', () => {
  it('renderiza os 4 cartões de KPIs com dados e formatação corretos', () => {
    render(
      <MetricsKpiGrid
        stats={{
          total: 10,
          completedCount: 6,
          todayTotal: 4,
          todayCompleted: 3,
          overdueCount: 1,
          urgentCount: 2,
          completionRate: 60,
        }}
        pomodoroMinutes={125}
        pomodoroFormatted="2h 5m"
        streak={{ currentStreak: 5, recordStreak: 12 }}
      />
    )

    expect(screen.getByText('Tempo Total em Foco')).toBeInTheDocument()
    expect(screen.getByText('2h 5m')).toBeInTheDocument()
    expect(screen.getByText('+14%')).toBeInTheDocument()

    expect(screen.getByText('Ciclos Pomodoro')).toBeInTheDocument()
    expect(screen.getByText(/concluídos/)).toBeInTheDocument()

    expect(screen.getByText('Tarefas Entregues')).toBeInTheDocument()
    expect(screen.getByText('60% de conclusão')).toBeInTheDocument()

    expect(screen.getByText('Sequência Ativa')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText(/Recorde: 12 dias/)).toBeInTheDocument()
  })
})

describe('FocusBarChart Component', () => {
  it('renderiza as 7 barras diárias e modal de análise de horários', () => {
    const days = [
      {
        dayShort: 'Seg',
        dayFull: 'Segunda-feira',
        dateShort: '14 Out',
        dateIso: '2026-10-14',
        minutes: 195,
        formattedTime: '3h 15m',
        heightPct: 65,
        reachedGoal: true,
        isBestDay: false,
      },
      {
        dayShort: 'Ter',
        dayFull: 'Terça-feira',
        dateShort: '15 Out',
        dateIso: '2026-10-15',
        minutes: 165,
        formattedTime: '2h 45m',
        heightPct: 55,
        reachedGoal: false,
        isBestDay: false,
      },
      {
        dayShort: 'Qua',
        dayFull: 'Quarta-feira',
        dateShort: '16 Out',
        dateIso: '2026-10-16',
        minutes: 250,
        formattedTime: '4h 10m',
        heightPct: 83,
        reachedGoal: true,
        isBestDay: true,
      },
      {
        dayShort: 'Qui',
        dayFull: 'Quinta-feira',
        dateShort: '17 Out',
        dateIso: '2026-10-17',
        minutes: 210,
        formattedTime: '3h 30m',
        heightPct: 70,
        reachedGoal: true,
        isBestDay: false,
      },
      {
        dayShort: 'Sex',
        dayFull: 'Sexta-feira',
        dateShort: '18 Out',
        dateIso: '2026-10-18',
        minutes: 170,
        formattedTime: '2h 50m',
        heightPct: 57,
        reachedGoal: false,
        isBestDay: false,
      },
      {
        dayShort: 'Sáb',
        dayFull: 'Sábado',
        dateShort: '19 Out',
        dateIso: '2026-10-19',
        minutes: 90,
        formattedTime: '1h 30m',
        heightPct: 30,
        reachedGoal: false,
        isBestDay: false,
      },
      {
        dayShort: 'Dom',
        dayFull: 'Domingo',
        dateShort: '20 Out',
        dateIso: '2026-10-20',
        minutes: 45,
        formattedTime: '45m',
        heightPct: 15,
        reachedGoal: false,
        isBestDay: false,
      },
    ]

    render(
      <FocusBarChart
        days={days}
        bestDayLabel="Quarta-feira (4h 10m)"
        weeklyAvgFormatted="2h 41m"
      />
    )

    expect(screen.getByText('Tempo de Foco por Dia')).toBeInTheDocument()
    expect(screen.getByText('Meta Atingida')).toBeInTheDocument()
    expect(screen.getByText('Abaixo da Meta')).toBeInTheDocument()
    expect(screen.getByText('Meta 3h')).toBeInTheDocument()
    expect(screen.getByText('Melhor')).toBeInTheDocument()
    expect(screen.getByText(/Melhor dia:/)).toBeInTheDocument()
    expect(screen.getByText(/Média semanal:/)).toBeInTheDocument()

    // Open hourly details modal
    const hourlyBtn = screen.getByText('Ver análise detalhada de horários')
    fireEvent.click(hourlyBtn)
    expect(screen.getByText('Distribuição de Horários de Foco')).toBeInTheDocument()
    expect(screen.getByText('Manhã (08:00 - 12:00)')).toBeInTheDocument()

    // Close modal
    const closeBtn = screen.getByText('Concluído')
    fireEvent.click(closeBtn)
    expect(screen.queryByText('Distribuição de Horários de Foco')).not.toBeInTheDocument()
  })
})

describe('PriorityDistributionPanel Component', () => {
  it('alterna entre visualização por prioridade e por coluna', () => {
    const priorityItems = [
      {
        id: 'urgent',
        label: 'Urgente',
        count: 4,
        pct: 14,
        color: 'bg-rose-500',
        textColor: 'text-rose-600',
        bgColor: 'bg-rose-50',
      },
      {
        id: 'high',
        label: 'Alta',
        count: 9,
        pct: 32,
        color: 'bg-amber-500',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
      },
      {
        id: 'medium',
        label: 'Média',
        count: 11,
        pct: 40,
        color: 'bg-blue-600',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        id: 'low',
        label: 'Baixa',
        count: 4,
        pct: 14,
        color: 'bg-slate-400',
        textColor: 'text-slate-600',
        bgColor: 'bg-slate-100',
      },
    ]

    const columnItems = [
      { id: 'col-todo', title: 'A Fazer', count: 5, pct: 20 },
      { id: 'col-progress', title: 'Em Progresso', count: 8, pct: 30 },
      { id: 'col-review', title: 'Em Espera', count: 4, pct: 15 },
      { id: 'col-done', title: 'Concluído Hoje', count: 9, pct: 35 },
    ]

    render(
      <PriorityDistributionPanel
        completedCount={28}
        totalCount={28}
        priorityItems={priorityItems}
        columnItems={columnItems}
      />
    )

    expect(screen.getByText('Distribuição por Prioridade')).toBeInTheDocument()
    expect(screen.getByText('Total de 28 tarefas finalizadas')).toBeInTheDocument()
    expect(
      screen.getByText(/das tarefas concluídas eram de prioridade Média ou Alta/)
    ).toBeInTheDocument()

    // Switch to column tab
    const colTab = screen.getByText('Por Coluna')
    fireEvent.click(colTab)
    expect(screen.getByText('A Fazer')).toBeInTheDocument()
    expect(screen.getByText('5 (20%)')).toBeInTheDocument()

    // Switch back
    const prioTab = screen.getByText('Por Prioridade')
    fireEvent.click(prioTab)
    expect(screen.getByText('Urgente')).toBeInTheDocument()
  })
})

describe('RecentSessionsPanel Component', () => {
  it('alterna entre modo lista e tabela e exibe sessões de foco', () => {
    render(<RecentSessionsPanel tasks={mockTasks} columns={mockColumns} />)

    expect(screen.getByText('Sessões Recentes de Foco')).toBeInTheDocument()
    expect(screen.getByText('Tarefas Analisadas')).toBeInTheDocument()
    expect(screen.getByText('Refatorar API de autenticação OAuth2')).toBeInTheDocument()
    expect(screen.getByText('#backend')).toBeInTheDocument()
    expect(screen.getByText('50m')).toBeInTheDocument()

    // Toggle table view
    const tableToggle = screen.getByLabelText('Visualização em Tabela')
    fireEvent.click(tableToggle)

    expect(screen.getByText('Vencimento')).toBeInTheDocument()
    expect(screen.getByText('Foco Pomodoro')).toBeInTheDocument()

    // Toggle list view
    const listToggle = screen.getByLabelText('Visualização em Lista')
    fireEvent.click(listToggle)
    expect(screen.getByText('Refatorar API de autenticação OAuth2')).toBeInTheDocument()
  })
})

describe('Metrics Utilities', () => {
  it('calcula semana ISO, semestre e durações corretamente', () => {
    const weekNum = getISOWeekNumber(new Date(2026, 9, 14))
    expect(weekNum).toBeGreaterThan(0)
    expect(weekNum).toBeLessThanOrEqual(53)

    expect(getAcademicSemester(new Date(2026, 2, 10))).toBe(1)
    expect(getAcademicSemester(new Date(2026, 9, 10))).toBe(2)

    expect(formatMinutesToHours(45)).toBe('45 min')
    expect(formatMinutesToHours(125)).toBe('2h 5m')

    expect(formatShortDuration(45)).toBe('45m')
    expect(formatShortDuration(120)).toBe('2h')
    expect(formatShortDuration(125)).toBe('2h 5m')
  })

  it('calcula sequência de dias ativos (streak)', () => {
    const streakResult = calculateStreak(mockTasks)
    expect(streakResult.currentStreak).toBeGreaterThanOrEqual(1)
    expect(streakResult.recordStreak).toBeGreaterThanOrEqual(streakResult.currentStreak)
  })

  it('calcula distribuição de foco diário', () => {
    const weekStart = new Date(2026, 9, 12)
    const result = calculateDailyFocus(mockTasks, weekStart, 125)
    expect(result.days).toHaveLength(7)
    expect(result.bestDayLabel).toBeTruthy()
    expect(result.weeklyAvgFormatted).toBeTruthy()
  })
})

describe('Export Metrics Reports', () => {
  it('executa exportMetricsCSV e exportMetricsJSON sem erros', () => {
    // Mock Blob and document.createElement
    const createObjectURLMock = vi.fn(() => 'blob:mock-url')
    const revokeObjectURLMock = vi.fn()
    window.URL.createObjectURL = createObjectURLMock
    window.URL.revokeObjectURL = revokeObjectURLMock

    exportMetricsCSV({
      tasks: mockTasks,
      columns: mockColumns,
      pomodoroMinutes: 125,
      completionRate: 25,
      periodLabel: 'Esta Semana',
    })

    expect(createObjectURLMock).toHaveBeenCalled()
    expect(revokeObjectURLMock).toHaveBeenCalled()

    exportMetricsJSON({
      tasks: mockTasks,
      columns: mockColumns,
      pomodoroMinutes: 125,
      completionRate: 25,
      periodLabel: 'Esta Semana',
    })

    expect(createObjectURLMock).toHaveBeenCalledTimes(2)
  })
})
