import React from 'react'
import { ListFilter, ArrowUpDown } from 'lucide-react'
import type { FilterScope, FilterState } from '../types/kanban'

export interface FilterBarProps {
  filters: FilterState
  onFilterChange: (updates: Partial<FilterState>) => void
  allTags?: string[]
  totalFiltered?: number
  allTasksCount?: number
  searchInputRef?: React.RefObject<HTMLInputElement | null>
  isSortedByDueDate?: boolean
  onToggleSortByDueDate?: () => void
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  isSortedByDueDate = false,
  onToggleSortByDueDate,
}) => {
  const scopes: { id: FilterScope; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'today', label: 'Hoje' },
    { id: 'overdue', label: 'Atrasadas' },
    { id: 'upcoming', label: 'Próximas' },
    { id: 'completed', label: 'Concluídas' },
  ]

  return (
    <div className="w-full flex items-center justify-between py-2 text-xs transition-all">
      {/* Left side: "Filtros:" prefix + 5 Stitch minimal pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1 shrink-0 select-none">
          <ListFilter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>Filtros:</span>
        </span>

        {scopes.map((s) => {
          const isActive = filters.scope === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onFilterChange({ scope: s.id })}
              aria-pressed={isActive}
              aria-label={`Filtrar tarefas: ${s.label}`}
              className={`px-3 py-1 rounded-full text-xs transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium'
              }`}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Right side: Minimalist "Ordenar por Prazo" button */}
      <div className="flex items-center shrink-0 ml-2">
        <button
          type="button"
          onClick={onToggleSortByDueDate}
          aria-label="Ordenar por Prazo"
          aria-pressed={isSortedByDueDate}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
            isSortedByDueDate
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
          <span>Ordenar por Prazo</span>
        </button>
      </div>
    </div>
  )
}
