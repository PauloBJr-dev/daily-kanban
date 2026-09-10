import React, { useMemo } from 'react'
import { Search, X, Calendar, SlidersHorizontal } from 'lucide-react'
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
    { id: 'today', label: 'Hoje 🎯' },
    { id: 'overdue', label: 'Atrasadas' },
    { id: 'upcoming', label: 'Próximas' },
    { id: 'completed', label: 'Concluídas' },
  ]

  const priorities: { id: FilterPriority; label: string; dot: string }[] = [
    { id: 'all', label: 'Todas Prioridades', dot: 'bg-slate-400' },
    { id: 'urgent', label: 'Urgente', dot: 'bg-rose-500' },
    { id: 'high', label: 'Alta', dot: 'bg-orange-500' },
    { id: 'medium', label: 'Média', dot: 'bg-amber-500' },
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

  // Common button classes for strict visual consistency
  const pillBaseClass =
    'px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50'
  const pillInactiveClass =
    'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/90 dark:hover:bg-slate-800/90'
  const pillActiveClass =
    'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold ring-1 ring-indigo-200/80 dark:ring-indigo-800/80 shadow-2xs'

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-2.5 sm:p-3 shadow-2xs space-y-2.5 transition-all">
      {/* Top row: Search and Priority & Clear button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search input */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar tarefas..."
            aria-label="Buscar tarefas ou tags"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
          />
          {filters.searchQuery ? (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              aria-label="Limpar busca"
              title="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center justify-center w-5 h-5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md">
              /
            </kbd>
          )}
        </div>

        {/* Right side controls: Priority select and Clear button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Priority selector */}
          <div className="relative flex items-center">
            <select
              value={filters.priority}
              onChange={(e) =>
                onFilterChange({ priority: e.target.value as FilterPriority })
              }
              aria-label="Filtrar por prioridade"
              className="text-xs font-medium py-2 pl-3 pr-7 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer hover:bg-slate-100/90 dark:hover:bg-slate-800/90 transition-all appearance-none"
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
              onClick={clearAllFilters}
              aria-label="Limpar todos os filtros"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100/80 dark:hover:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/50 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>
                Limpar ({totalFiltered}/{allTasksCount})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Scope & Weekly Filters in cohesive pill groups */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        {/* Scope Pills Group */}
        <div className="flex items-center gap-1 bg-slate-50/70 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/50 overflow-x-auto no-scrollbar">
          {scopes.map((s) => {
            const isActive = filters.scope === s.id
            return (
              <button
                key={s.id}
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

        {/* Weekly Filter Group */}
        <div
          role="group"
          aria-label="Filtro semanal do Kanban"
          className="flex items-center gap-1 bg-slate-50/70 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/50 overflow-x-auto no-scrollbar"
        >
          <div className="flex items-center pl-2 pr-1 text-slate-400 dark:text-slate-500 select-none">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
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
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-slate-700/80'
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
