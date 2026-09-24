import React from 'react'
import { Search, X, Pin, LayoutGrid, List, Plus, ArrowUpDown } from 'lucide-react'
import type {
  AcademicFilterState,
  AcademicNote,
  StudyStatus,
  Subject,
} from '../../types/academic'
import { getSubjectColor } from './academicColors'

interface AcademicFilterBarProps {
  filters: AcademicFilterState
  onFilterChange: (updates: Partial<AcademicFilterState>) => void
  subjects: Subject[]
  allNotes: AcademicNote[]
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onOpenSubjectManager: () => void
  searchInputRef?: React.RefObject<HTMLInputElement | null>
  totalFiltered: number
  allNotesCount: number
}

export const AcademicFilterBar: React.FC<AcademicFilterBarProps> = ({
  filters,
  onFilterChange,
  subjects,
  allNotes,
  viewMode,
  onViewModeChange,
  onOpenSubjectManager,
  searchInputRef,
  totalFiltered,
  allNotesCount,
}) => {
  const statusOptions: { id: 'all' | StudyStatus; label: string }[] = [
    { id: 'all', label: 'Todos Status' },
    { id: 'to_review', label: 'Para Revisar' },
    { id: 'in_progress', label: 'Em Andamento' },
    { id: 'mastered', label: 'Dominado' },
  ]

  // Compute note counts per subject
  const subjectNoteCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const note of allNotes) {
      counts[note.subjectId] = (counts[note.subjectId] || 0) + 1
    }
    return counts
  }, [allNotes])

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.subjectId !== 'all' ||
    filters.status !== 'all' ||
    filters.tag !== null ||
    filters.onlyPinned

  const clearAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      subjectId: 'all',
      status: 'all',
      tag: null,
      onlyPinned: false,
    })
  }

  return (
    <div className="space-y-3.5 pt-1">
      {/* Top row: Search input, status select, pinned toggle, sort indicator, view mode & subject manager */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input with / shortcut and clear button */}
        <div className="relative w-full md:w-auto md:min-w-[240px] md:flex-1 md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar notas, tags ou conteúdo..."
            aria-label="Buscar anotações acadêmicas"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-9 py-2 min-h-[40px] md:min-h-0 text-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all shadow-xs font-sans"
          />
          {filters.searchQuery ? (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              aria-label="Limpar busca"
              title="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
              /
            </kbd>
          )}
        </div>

        {/* Action Controls Cluster */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector chips */}
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain touch-pan-x shadow-xs">
            {statusOptions.map((opt) => {
              const isActive = filters.status === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => onFilterChange({ status: opt.id })}
                  aria-pressed={isActive}
                  aria-label={`Filtrar por status: ${opt.label}`}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Only Pinned Toggle Button */}
          <button
            type="button"
            onClick={() => onFilterChange({ onlyPinned: !filters.onlyPinned })}
            aria-pressed={filters.onlyPinned}
            title={
              filters.onlyPinned ? 'Ver todas as anotações' : 'Filtrar apenas fixadas'
            }
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer shadow-xs ${
              filters.onlyPinned
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 font-semibold ring-1 ring-rose-400/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Pin
              className={`w-3.5 h-3.5 ${
                filters.onlyPinned
                  ? 'fill-rose-600 dark:fill-rose-400 text-rose-600 dark:text-rose-400'
                  : ''
              }`}
            />
            <span>Fixadas</span>
          </button>

          {/* Sort Control Stitch */}
          <div className="hidden lg:flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Ordenar por:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Mais Recentes
            </span>
          </div>

          {/* View mode toggle: Grid / List (Stitch style) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-label="Visualização em grade"
              title="Modo Grade"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-label="Visualização em lista"
              title="Modo Lista"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Discipline Pill Filter Group (Stitch design) */}
      <div className="flex items-center gap-2 pt-1 overflow-x-auto md:flex-wrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain touch-pan-x pb-1">
        {/* "Todas as Disciplinas" pill */}
        <button
          type="button"
          onClick={() => onFilterChange({ subjectId: 'all' })}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1.5 border ${
            filters.subjectId === 'all'
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <span>Todas Disciplinas</span>
          <span
            className={`text-[11px] font-mono ${
              filters.subjectId === 'all'
                ? 'text-blue-100'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            [{allNotesCount}]
          </span>
        </button>

        {/* Individual subject pills with color dot, name, and [X] counter */}
        {subjects.map((sub) => {
          const isSelected = filters.subjectId === sub.id
          const colorConfig = getSubjectColor(sub.color)
          const noteCount = subjectNoteCounts[sub.id] || 0

          return (
            <button
              key={sub.id}
              type="button"
              onClick={() =>
                onFilterChange({
                  subjectId: isSelected ? 'all' : sub.id,
                })
              }
              aria-pressed={isSelected}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                isSelected
                  ? `${colorConfig.bgSubtle} ${colorConfig.text} ${colorConfig.border} font-semibold ring-2 ring-blue-500/20 shadow-xs`
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {/* Color dot */}
              <span className={`w-2 h-2 rounded-full ${colorConfig.dot} shrink-0`} />
              <span className="truncate max-w-[180px]">{sub.name}</span>
              {/* Stitch count format [X] */}
              <span
                className={`text-[11px] font-mono ${
                  isSelected ? 'opacity-90' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                [{noteCount}]
              </span>
            </button>
          )
        })}

        {/* Discrete Plus button to manage subjects */}
        <button
          type="button"
          onClick={onOpenSubjectManager}
          aria-label="Gerenciar disciplinas"
          title="Gerenciar disciplinas"
          className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Active Tag indicator with clear */}
        {filters.tag && (
          <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 text-xs">
            <span>#{filters.tag}</span>
            <button
              type="button"
              onClick={() => onFilterChange({ tag: null })}
              className="hover:text-blue-950 dark:hover:text-white cursor-pointer ml-1"
              aria-label="Remover filtro de tag"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Clear all filters button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            aria-label="Limpar todos os filtros"
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 cursor-pointer ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>
              Limpar ({totalFiltered}/{allNotesCount})
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
