import React, { useState, useRef, useEffect } from 'react'
import {
  Download,
  Calendar,
  Bell,
  ChevronDown,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react'
import type { WeekScope } from '../../types/kanban'
import { getISOWeekNumber, getAcademicSemester } from './metricsUtils'

interface MetricsHeaderProps {
  weekScope: WeekScope
  onWeekScopeChange: (scope: WeekScope) => void
  onExportCSV: () => void
  onExportJSON: () => void
}

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({
  weekScope,
  onWeekScopeChange,
  onExportCSV,
  onExportJSON,
}) => {
  const currentWeek = getISOWeekNumber()
  const currentSemester = getAcademicSemester()
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3.5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full max-w-7xl mx-auto">
        {/* Left: Context Badge */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200/60 dark:border-slate-700 whitespace-nowrap inline-flex items-center font-label">
            Semana {currentWeek} • Semestre {currentSemester}
          </span>
        </div>

        {/* Right Controls: Period Selector & Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-between md:justify-end">
          {/* Period Selector Pills */}
          <div
            role="group"
            aria-label="Seletor de período"
            className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-full gap-1 border border-slate-200/50 dark:border-slate-700/60"
          >
            <button
              type="button"
              onClick={() => onWeekScopeChange('this_week')}
              className={`px-3 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer font-label ${
                weekScope === 'this_week'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
              }`}
            >
              Esta Semana
            </button>
            <button
              type="button"
              onClick={() => onWeekScopeChange('last_week')}
              className={`px-3 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer font-label ${
                weekScope === 'last_week'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
              }`}
            >
              Semana Passada
            </button>
            <button
              type="button"
              onClick={() => onWeekScopeChange('all')}
              className={`px-3 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer font-label ${
                weekScope === 'all'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
              }`}
            >
              Últimos 30 Dias
            </button>
          </div>

          {/* Secondary Action: Exportar Relatório com Dropdown */}
          <div className="relative" ref={exportRef}>
            <div className="inline-flex rounded-lg shadow-xs border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={onExportCSV}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-l-lg text-slate-700 dark:text-slate-200 text-xs font-semibold font-label hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Exportar Relatório</span>
              </button>
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-2 py-1.5 rounded-r-lg border-l border-slate-200/80 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Opções de exportação"
                aria-label="Opções de exportação"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-1.5 z-30 font-label">
                <button
                  type="button"
                  onClick={() => {
                    onExportCSV()
                    setShowExportMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Baixar Planilha (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportJSON()
                    setShowExportMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors text-left"
                >
                  <FileJson className="w-4 h-4 text-amber-600" />
                  <span>Baixar Dados (JSON)</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

          {/* Quick Icon Cluster */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Filtrar por data"
              aria-label="Filtrar por data"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors relative"
              title="Notificações de métricas"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
