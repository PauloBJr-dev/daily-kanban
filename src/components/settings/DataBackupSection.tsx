import React from 'react'
import { Database, Download, Upload, RotateCcw, Info } from 'lucide-react'

export interface DataBackupSectionProps {
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
}

export const DataBackupSection: React.FC<DataBackupSectionProps> = ({
  onExport,
  onImport,
  onReset,
}) => {
  return (
    <section
      id="dados"
      aria-labelledby="settings-data-title"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-6 transition-colors"
    >
      {/* Section Header (Stitch Line 443) */}
      <div className="flex items-start gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h2
            id="settings-data-title"
            className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100"
          >
            Gerenciamento de Dados &amp; Backup
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Exporte seu histórico de produtividade, importe anotações ou redefina o app
          </p>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Exportar */}
        <button
          type="button"
          onClick={onExport}
          aria-label="Exportar Backup JSON"
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
        >
          <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Exportar Backup JSON</span>
        </button>

        {/* Importar */}
        <label
          aria-label="Importar Dados JSON"
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
        >
          <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Importar Dados JSON</span>
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            className="hidden"
            aria-label="Selecionar arquivo JSON para importação"
          />
        </label>

        <div className="flex-1 min-w-[20px]" />

        {/* Danger Zone Button: Restaurar Demonstração */}
        <button
          type="button"
          onClick={onReset}
          aria-label="Restaurar Dados de Demonstração"
          className="px-4 py-2.5 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Restaurar Dados Iniciais</span>
        </button>
      </div>

      {/* Subtle Info note for danger zone */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
        <span>
          A restauração redefine parâmetros de tempo, sons e atalhos sem apagar suas
          tarefas ou histórico acadêmico.
        </span>
      </div>
    </section>
  )
}
