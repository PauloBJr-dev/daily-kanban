import React from 'react'
import { Search, X, Tag } from 'lucide-react'
import type { FilterPriority, FilterScope, FilterState } from '../types/kanban'

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (updates: Partial<FilterState>) => void
  allTags: string[]
  totalFiltered: number
  allTasksCount: number
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  allTags,
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
    { id: 'all', label: 'Prioridade', dot: 'bg-slate-400' },
    { id: 'urgent', label: 'Urgente', dot: 'bg-rose-500' },
    { id: 'high', label: 'Alta', dot: 'bg-orange-500' },
    { id: 'medium', label: 'Média', dot: 'bg-amber-500' },
    { id: 'low', label: 'Baixa', dot: 'bg-slate-400' },
  ]

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.priority !== 'all' ||
    filters.tag !== null ||
    filters.scope !== 'all'

  const clearAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      priority: 'all',
      tag: null,
      scope: 'all',
    })
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
      {/* Search Input & Scopes */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Search input */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar tarefas ou tags..."
            aria-label="Buscar tarefas ou tags"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-9 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
          />
          {filters.searchQuery ? (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              aria-label="Limpar busca"
              title="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center justify-center w-5 h-5 text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
              /
            </kbd>
          )}
        </div>

        {/* Scope pills */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          {scopes.map((s) => {
            const isActive = filters.scope === s.id
            return (
              <button
                key={s.id}
                onClick={() => onFilterChange({ scope: s.id })}
                aria-pressed={isActive}
                aria-label={`Filtrar tarefas: ${s.label}`}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Priority & Tag Filters */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Priority select */}
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange({ priority: e.target.value as FilterPriority })}
          aria-label="Filtrar por prioridade"
          className="text-xs font-medium py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
        >
          {priorities.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id === 'all' ? 'Todas Prioridades' : `Prioridade: ${p.label}`}
            </option>
          ))}
        </select>

        {/* Tag select */}
        {allTags.length > 0 && (
          <div className="relative">
            <select
              value={filters.tag || ''}
              onChange={(e) =>
                onFilterChange({ tag: e.target.value ? e.target.value : null })
              }
              aria-label="Filtrar por etiqueta"
              className="text-xs font-medium py-2 pl-7 pr-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
            >
              <option value="">Todas Etiquetas</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
            <Tag className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Clear filter */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            aria-label="Limpar todos os filtros"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Limpar ({totalFiltered}/{allTasksCount})
          </button>
        )}
      </div>
    </div>
  )
}
