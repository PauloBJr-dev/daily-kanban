import type { Column, Task } from '../../types/kanban'

export interface ExportMetricsOptions {
  tasks: Task[]
  columns: Column[]
  pomodoroMinutes: number
  completionRate: number
  periodLabel: string
}

export function exportMetricsCSV({
  tasks,
  columns,
  pomodoroMinutes,
  completionRate,
  periodLabel,
}: ExportMetricsOptions): void {
  const colMap = new Map(columns.map((c) => [c.id, c.title]))

  const headers = [
    'ID',
    'Título',
    'Coluna',
    'Prioridade',
    'Vencimento',
    'Tags',
    'Foco Pomodoro (min)',
    'Status',
  ]

  const rows = tasks.map((t) => {
    const isDone =
      t.columnId === 'col-done' || t.columnId?.includes('done') || Boolean(t.completedAt)
    return [
      `"${t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${colMap.get(t.columnId || '') || t.columnId || 'A Fazer'}"`,
      `"${t.priority}"`,
      `"${t.dueDate || ''}"`,
      `"${t.tags.join(', ')}"`,
      `"${t.pomodoroMinutesSpent || 0}"`,
      `"${isDone ? 'Concluída' : 'Pendente'}"`,
    ]
  })

  const summary = [
    [],
    ['--- Resumo do Relatório de Produtividade ---'],
    ['Período:', `"${periodLabel}"`],
    ['Total de Tarefas:', `"${tasks.length}"`],
    ['Taxa de Conclusão:', `"${completionRate}%"`],
    ['Tempo Total em Foco:', `"${pomodoroMinutes} min"`],
    ['Gerado em:', `"${new Date().toLocaleString('pt-BR')}"`],
  ]

  const csvContent =
    '\uFEFF' +
    [
      headers.join(';'),
      ...rows.map((r) => r.join(';')),
      ...summary.map((s) => s.join(';')),
    ].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    `dailyflow-produtividade-${new Date().toISOString().split('T')[0]}.csv`
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportMetricsJSON({
  tasks,
  columns,
  pomodoroMinutes,
  completionRate,
  periodLabel,
}: ExportMetricsOptions): void {
  const colMap = new Map(columns.map((c) => [c.id, c.title]))

  const report = {
    generatedAt: new Date().toISOString(),
    period: periodLabel,
    summary: {
      totalTasks: tasks.length,
      completionRate: `${completionRate}%`,
      totalFocusMinutes: pomodoroMinutes,
      completedTasksCount: tasks.filter(
        (t) =>
          t.columnId === 'col-done' ||
          t.columnId?.includes('done') ||
          Boolean(t.completedAt)
      ).length,
    },
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      column: colMap.get(t.columnId || '') || t.columnId || 'A Fazer',
      priority: t.priority,
      dueDate: t.dueDate || null,
      tags: t.tags,
      pomodoroMinutes: t.pomodoroMinutesSpent || 0,
      isCompleted:
        t.columnId === 'col-done' ||
        t.columnId?.includes('done') ||
        Boolean(t.completedAt),
    })),
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    `dailyflow-produtividade-${new Date().toISOString().split('T')[0]}.json`
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
