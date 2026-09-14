import React, { useState } from 'react'
import { Star, BarChart2, ArrowRight, X, Sun, Moon, Sunrise } from 'lucide-react'
import type { DailyFocusDay } from './metricsUtils'

interface FocusBarChartProps {
  days: DailyFocusDay[]
  bestDayLabel: string
  weeklyAvgFormatted: string
}

export const FocusBarChart: React.FC<FocusBarChartProps> = ({
  days,
  bestDayLabel,
  weeklyAvgFormatted,
}) => {
  const [showHourlyDetails, setShowHourlyDetails] = useState(false)

  return (
    <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header & Chart Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-headline text-base font-semibold text-slate-900 dark:text-slate-100">
            Tempo de Foco por Dia
          </h3>
          <p className="font-label text-xs text-slate-500 dark:text-slate-400">
            Comparativo diário em relação à meta de estudos
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-5 text-xs font-label flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-blue-600 shrink-0"></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Meta Atingida
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-blue-300 dark:bg-blue-800 shrink-0"></span>
            <span className="text-slate-500 dark:text-slate-400">Abaixo da Meta</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0 border-t-2 border-dashed border-amber-500/80 shrink-0"></span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              Meta (3h/dia)
            </span>
          </div>
        </div>
      </div>

      {/* Vertical Bar Chart Canvas */}
      <div className="relative pt-6 pb-2">
        {/* Dashed Meta Line (Meta 3h) - set at 40% from top (3h / 5h scale) */}
        <div className="absolute left-10 right-4 top-[38%] border-t-2 border-dashed border-amber-400/80 dark:border-amber-500/80 z-10 flex items-center justify-end pointer-events-none">
          <span className="bg-white dark:bg-slate-900 px-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400 -mt-2.5 font-label tracking-wide">
            Meta 3h
          </span>
        </div>

        {/* Y-Axis Ticks & Bars Container */}
        <div className="flex items-end gap-2 h-64">
          {/* Left Y-Axis Scale (5h down to 0h) */}
          <div className="flex flex-col justify-between h-full pr-2 text-[11px] text-slate-400 dark:text-slate-500 font-label pb-8 select-none">
            <span>5h</span>
            <span>4h</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">3h</span>
            <span>2h</span>
            <span>1h</span>
            <span>0h</span>
          </div>

          {/* Bar Columns Grid (7 Days: Seg - Dom) */}
          <div className="flex-1 grid grid-cols-7 gap-2 sm:gap-6 items-end h-full pb-8">
            {days.map((day) => {
              const isBest = day.isBestDay
              const isReached = day.reachedGoal

              let barColorClass =
                'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              if (isReached) {
                barColorClass = 'bg-blue-600 hover:bg-blue-700'
              } else if (day.minutes > 0) {
                barColorClass =
                  'bg-blue-300 dark:bg-blue-800/80 hover:bg-blue-400 dark:hover:bg-blue-700'
              }

              return (
                <div
                  key={day.dayShort}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                >
                  {/* Floating Best Day Badge */}
                  {isBest && (
                    <div className="absolute -top-7 bg-blue-50 dark:bg-blue-950/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-blue-600 dark:text-blue-400 font-label border border-blue-200 dark:border-blue-800 shadow-xs z-10">
                      Melhor
                    </div>
                  )}

                  {/* Hover Tooltip Value */}
                  <span
                    className={`text-[11px] font-semibold mb-1 transition-opacity duration-150 font-label whitespace-nowrap ${
                      isBest
                        ? 'text-blue-600 dark:text-blue-400 opacity-100 font-bold'
                        : 'text-slate-800 dark:text-slate-200 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {day.formattedTime}
                  </span>

                  {/* Vertical Bar */}
                  <div
                    className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 ${barColorClass} ${
                      isBest ? 'shadow-xs ring-2 ring-blue-500/20' : ''
                    }`}
                    style={{ height: `${day.heightPct}%` }}
                  ></div>

                  {/* Day Label & Date */}
                  <div className="text-center mt-2">
                    <span
                      className={`block text-xs font-label ${
                        isBest
                          ? 'font-bold text-blue-600 dark:text-blue-400'
                          : 'font-semibold text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {day.dayShort}
                    </span>
                    <span
                      className={`block text-[10px] font-label ${
                        isBest
                          ? 'text-blue-600/80 dark:text-blue-400/80 font-medium'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {day.dateShort}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Card Footer Summary */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs font-label text-slate-500 dark:text-slate-400 gap-3">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>
              Melhor dia:{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                {bestDayLabel}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>
              Média semanal:{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                {weeklyAvgFormatted} / dia
              </strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHourlyDetails(true)}
          className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>Ver análise detalhada de horários</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hourly Breakdown Modal */}
      {showHourlyDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-headline text-base font-bold text-slate-900 dark:text-slate-100">
                  Distribuição de Horários de Foco
                </h4>
                <p className="font-label text-xs text-slate-500 dark:text-slate-400">
                  Padrões de concentração por turnos ao longo do dia
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHourlyDetails(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-label">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Sunrise className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Manhã (08:00 - 12:00)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Período de maior foco para tarefas analíticas
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  45% do foco
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Tarde (13:00 - 18:00)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Execução contínua e revisões de código
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  40% do foco
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Noite (19:00 - 22:00)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Estudos complementares e planejamento
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  15% do foco
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHourlyDetails(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-label text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
