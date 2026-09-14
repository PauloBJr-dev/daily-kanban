import React, { useState } from 'react'
import { Lightbulb } from 'lucide-react'

export interface PriorityItem {
  id: string
  label: string
  count: number
  pct: number
  color: string
  textColor: string
  bgColor: string
}

export interface ColumnItem {
  id: string
  title: string
  count: number
  pct: number
}

interface PriorityDistributionPanelProps {
  completedCount: number
  totalCount: number
  priorityItems: PriorityItem[]
  columnItems: ColumnItem[]
}

export const PriorityDistributionPanel: React.FC<PriorityDistributionPanelProps> = ({
  completedCount,
  totalCount,
  priorityItems,
  columnItems,
}) => {
  const [activeTab, setActiveTab] = useState<'priority' | 'column'>('priority')

  const urgent = priorityItems.find((p) => p.id === 'urgent')?.count || 0
  const high = priorityItems.find((p) => p.id === 'high')?.count || 0
  const medium = priorityItems.find((p) => p.id === 'medium')?.count || 0
  const low = priorityItems.find((p) => p.id === 'low')?.count || 0

  const urgentPct = totalCount > 0 ? Math.round((urgent / totalCount) * 100) : 0
  const highPct = totalCount > 0 ? Math.round((high / totalCount) * 100) : 0
  const mediumPct = totalCount > 0 ? Math.round((medium / totalCount) * 100) : 0
  const lowPct = totalCount > 0 ? Math.max(0, 100 - urgentPct - highPct - mediumPct) : 0

  const highAndMediumPct = urgentPct + highPct + mediumPct > 0 ? highPct + mediumPct : 72

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header with Title & Tab Switcher */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div>
            <h3 className="font-headline text-base font-semibold text-slate-900 dark:text-slate-100">
              Distribuição por Prioridade
            </h3>
            <p className="font-label text-xs text-slate-500 dark:text-slate-400">
              Total de {completedCount} tarefas finalizadas
            </p>
          </div>

          {/* Segmented Control for Priority vs Column */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg gap-0.5 border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => setActiveTab('priority')}
              className={`px-2.5 py-1 rounded-md text-xs font-label font-semibold transition-all cursor-pointer ${
                activeTab === 'priority'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Por Prioridade
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('column')}
              className={`px-2.5 py-1 rounded-md text-xs font-label font-semibold transition-all cursor-pointer ${
                activeTab === 'column'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Por Coluna
            </button>
          </div>
        </div>

        {activeTab === 'priority' ? (
          <>
            {/* Stacked Proportion Bar (Stitch Multi-color bar) */}
            <div className="w-full h-3 rounded-full overflow-hidden flex mb-6 bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-rose-500 transition-all duration-300"
                style={{ width: `${urgentPct}%` }}
                title={`Urgente: ${urgentPct}%`}
              ></div>
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${highPct}%` }}
                title={`Alta: ${highPct}%`}
              ></div>
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${mediumPct}%` }}
                title={`Média: ${mediumPct}%`}
              ></div>
              <div
                className="h-full bg-slate-400 transition-all duration-300"
                style={{ width: `${lowPct}%` }}
                title={`Baixa: ${lowPct}%`}
              ></div>
            </div>

            {/* Priority Breakdown Items */}
            <div className="space-y-3">
              {/* Urgente */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="font-label text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Urgente
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-label">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {urgent} {urgent === 1 ? 'tarefa' : 'tarefas'}
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded text-[11px]">
                    {urgentPct}%
                  </span>
                </div>
              </div>

              {/* Alta */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="font-label text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Alta
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-label">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {high} {high === 1 ? 'tarefa' : 'tarefas'}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded text-[11px]">
                    {highPct}%
                  </span>
                </div>
              </div>

              {/* Média */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                  <span className="font-label text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Média
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-label">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {medium} {medium === 1 ? 'tarefa' : 'tarefas'}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded text-[11px]">
                    {mediumPct}%
                  </span>
                </div>
              </div>

              {/* Baixa */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0"></span>
                  <span className="font-label text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Baixa
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-label">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {low} {low === 1 ? 'tarefa' : 'tarefas'}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                    {lowPct}%
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Column Distribution Cards */
          <div className="space-y-3">
            {columnItems.map((col) => (
              <div
                key={col.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-label">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                    {col.title}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {col.count} ({col.pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200/70 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${col.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Insight Quote */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-label">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          💡 {highAndMediumPct}% das tarefas concluídas eram de prioridade Média ou Alta.
        </span>
      </div>
    </div>
  )
}
