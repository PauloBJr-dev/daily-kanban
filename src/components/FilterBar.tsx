import React, { useMemo } from 'react'
import { Search, X, Calendar, SlidersHorizontal, ListFilter } from 'lucide-react'
import type { FilterPriority, FilterScope, FilterState, WeekScope } from '../types/kanban'
import { getISOWeekRange } from '../hooks/useKanban'

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (updates: Partial<FilterState>) => void
  allTags?: string[]
  totalFiltered: number
  allTasksCount: number
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  totalFiltered,
  allTasksCount,
  searchInputRef,
}) => {
  const scopes: { id: FilterScope; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'today', label: 'Hoje' },
    { id: 'overdue', label: 'Atrasadas' },
    { id: 'upcoming', label: 'Próximas' },
    { id: 'completed', label: 'Concluídas' },
  ]

  const priorities: { id: FilterPriority; label: string; dot: string }[] = [
    { id: 'all', label: 'Todas Prioridades', dot: 'bg-slate-400' },
    { id: 'urgent', label: 'Urgente', dot: 'bg-red-500' },
    { id: 'high', label: 'Alta', dot: 'bg-orange-500' },
    { id: 'medium', label: 'Média', dot: 'bg-blue-500' },
    { id: 'low', label: 'Baixa', dot: 'bg-slate-400' },
  ]

  // Week ranges for display
  const { start: thisWeekStart, end: thisWeekEnd } = useMemo(
    () => getISOWeekRange('this_week'),
    []
  )
  const { start: lastWeekStart, end: lastWeekEnd } = useMemo(
    () => getISOWeekRange('last_week'),
    []
  )

  const formatShortRange = (start: Date, end: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(start.getDate())}/${pad(start.getMonth() + 1)} - ${pad(end.getDate())}/${pad(end.getMonth() + 1)}`
  }

  const thisWeekLabel = useMemo(
    () => formatShortRange(thisWeekStart, thisWeekEnd),
    [thisWeekStart, thisWeekEnd]
  )
  const lastWeekLabel = useMemo(
    () => formatShortRange(lastWeekStart, lastWeekEnd),
    [lastWeekStart, lastWeekEnd]
  )

  const weekScopes: { id: WeekScope; label: string; dateRange?: string }[] = [
    { id: 'this_week', label: 'Esta Semana', dateRange: thisWeekLabel },
    { id: 'last_week', label: 'Semana Passada', dateRange: lastWeekLabel },
    { id: 'all', label: 'Todas' },
  ]

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.priority !== 'all' ||
    filters.scope !== 'all' ||
    (filters.weekScope && filters.weekScope !== 'this_week')

  const clearAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      priority: 'all',
      tag: null,
      scope: 'all',
      weekScope: 'this_week',
    })
  }

  // Stitch pill classes: active pill is solid dark in light mode, solid white in dark mode
  const pillBaseClass =
    'px-3 py-1 rounded-full text-xs transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50'
  const pillInactiveClass =
    'font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
  const pillActiveClass =
    'font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs space-y-3.5 transition-all">
      {/* Top row: Filter Pills + Search & Priority Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Quick Filter Pills with "Filtros:" prefix */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <ListFilter className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Filtros:
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
                className={`${pillBaseClass} ${
                  isActive ? pillActiveClass : pillInactiveClass
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Secondary Controls: Search input, Priority dropdown, Clear button */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {/* Integrated Clean Search */}
          <div className="relative flex-1 sm:w-60 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar tarefas..."
              aria-label="Buscar tarefas ou tags"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
            />
            {filters.searchQuery ? (
              <button
                type="button"
                onClick={() => onFilterChange({ searchQuery: '' })}
                aria-label="Limpar busca"
                title="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center justify-center w-4 h-4 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
                /
              </kbd>
            )}
          </div>

          {/* Priority selector with Stitch style */}
          <div className="relative flex items-center">
            <select
              value={filters.priority}
              onChange={(e) =>
                onFilterChange({ priority: e.target.value as FilterPriority })
              }
              aria-label="Filtrar por prioridade"
              className="text-xs font-medium py-1.5 pl-3 pr-7 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer hover:bg-slate-100/90 dark:hover:bg-slate-800 transition-all appearance-none"
            >
              {priorities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id === 'all' ? 'Prioridade' : `Prioridade: ${p.label}`}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              aria-label="Limpar todos os filtros"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/50 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>
                Limpar ({totalFiltered}/{allTasksCount})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Weekly Smart Filter Group */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div
          role="group"
          aria-label="Filtro semanal do Kanban"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar"
        >
          <div className="flex items-center text-slate-400 dark:text-slate-500 select-none mr-1">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Semana:
            </span>
          </div>

          {weekScopes.map((w) => {
            const isActive = (filters.weekScope ?? 'this_week') === w.id
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => onFilterChange({ weekScope: w.id })}
                aria-pressed={isActive}
                aria-label={`Filtrar por ${w.label}`}
                className={`${pillBaseClass} ${
                  isActive ? pillActiveClass : pillInactiveClass
                }`}
              >
                <span>{w.label}</span>
                {w.dateRange && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900 font-semibold'
                        : 'text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700/80 border border-slate-200/40 dark:border-slate-600/40'
                    }`}
                  >
                    {w.dateRange}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
