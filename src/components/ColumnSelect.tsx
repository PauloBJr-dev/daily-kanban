import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import type { Column } from '../types/kanban'

const COLUMN_THEME_DOTS: Record<Column['colorTheme'], string> = {
  blue: 'bg-blue-600',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-400 dark:bg-slate-500',
}

export interface ColumnSelectProps {
  columns: Column[]
  value: string
  onChange: (columnId: string) => void
  disabled?: boolean
  id?: string
  'aria-label'?: string
}

export const ColumnSelect: React.FC<ColumnSelectProps> = ({
  columns,
  value,
  onChange,
  disabled = false,
  id = 'task-column-select',
  'aria-label': ariaLabel = 'Selecionar coluna',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedColumn = columns.find((c) => c.id === value) || columns[0]
  const currentDotColor = selectedColumn
    ? COLUMN_THEME_DOTS[selectedColumn.colorTheme] || 'bg-blue-600'
    : 'bg-blue-600'

  // Fechar ao clicar fora do menu suspenso
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Fechar ao pressionar Escape (fechando apenas o select e interrompendo propagação)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen])

  const handleSelect = (colId: string) => {
    onChange(colId)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Botão Disparador */}
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer flex items-center justify-between gap-2 text-left disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${currentDotColor}`}
            aria-hidden="true"
          />
          <span className="truncate font-medium text-slate-800 dark:text-slate-200">
            {selectedColumn ? selectedColumn.title : 'Selecione uma coluna'}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menu Flutuante Suspenso */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Opções de colunas"
          className="absolute z-50 mt-1.5 w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
        >
          {columns.map((col) => {
            const isSelected = col.id === value
            const dotColor = COLUMN_THEME_DOTS[col.colorTheme] || 'bg-blue-600'
            return (
              <button
                key={col.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(col.id)}
                className={`w-full px-3.5 py-2.5 text-sm flex items-center justify-between gap-2 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/60 font-normal'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{col.title}</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
