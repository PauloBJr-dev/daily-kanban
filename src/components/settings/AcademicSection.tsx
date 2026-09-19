import React, { useState, useRef, useCallback } from 'react'
import {
  GraduationCap,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  BookOpen,
} from 'lucide-react'
import { useAcademicNotes } from '../../hooks/useAcademicNotes'
import { useToast } from '../../hooks/useToast'
import { ConfirmDialog } from '../ConfirmDialog'

export interface AcademicSectionProps {
  onOpenAcademicSubjects: () => void
}

export const AcademicSection: React.FC<AcademicSectionProps> = ({
  onOpenAcademicSubjects,
}) => {
  const { subjects, allNotes, exportAcademicData, importAcademicData, resetToSeed } =
    useAcademicNotes()

  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  const handleExport = useCallback(() => {
    exportAcademicData()
    toast.success('Backup acadêmico (JSON) exportado com sucesso')
  }, [exportAcademicData, toast])

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string)
          const success = importAcademicData(parsed)
          if (success) {
            toast.success('Dados acadêmicos importados com sucesso')
          } else {
            toast.error('Arquivo JSON acadêmico inválido ou incompatível.')
          }
        } catch {
          toast.error('Erro ao processar o arquivo JSON.')
        }
      }
      reader.readAsText(file)
      e.target.value = ''
    },
    [importAcademicData, toast]
  )

  const handleConfirmReset = useCallback(() => {
    resetToSeed()
    setIsResetConfirmOpen(false)
    toast.info('Dados acadêmicos de demonstração restaurados')
  }, [resetToSeed, toast])

  return (
    <section
      id="academico"
      aria-labelledby="settings-academic-title"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col gap-6 transition-colors"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="settings-academic-title"
              className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Espaço Acadêmico &amp; Caderno
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Organize matérias, exporte backups e restaure anotações de estudo
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAcademicSubjects}
          className="px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-xl transition-all cursor-pointer self-start sm:self-auto shrink-0 active:scale-[0.98] flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Acessar Espaço Acadêmico</span>
          <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
        </button>
      </div>

      {/* Overview stats pill */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
        <span className="font-semibold text-slate-900 dark:text-slate-200">
          Caderno atual:
        </span>
        <span className="inline-flex items-center gap-1 font-medium">
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            {subjects.length}
          </span>{' '}
          disciplinas
        </span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span className="inline-flex items-center gap-1 font-medium">
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            {allNotes.length}
          </span>{' '}
          anotações
        </span>
      </div>

      {/* Backup and Data Actions Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Exportar JSON */}
        <button
          type="button"
          onClick={handleExport}
          aria-label="Exportar anotações e disciplinas em JSON"
          title="Exportar anotações acadêmicas (JSON)"
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
        >
          <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Exportar Anotações (JSON)</span>
        </button>

        {/* Importar JSON */}
        <label
          aria-label="Importar anotações e disciplinas via JSON"
          title="Importar anotações acadêmicas (JSON)"
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
        >
          <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Importar Anotações (JSON)</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            aria-label="Selecionar arquivo JSON acadêmico para importação"
          />
        </label>

        <div className="flex-1 min-w-[10px]" />

        {/* Restaurar Demonstração */}
        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          aria-label="Restaurar dados acadêmicos de demonstração"
          title="Restaurar anotações e disciplinas padrão"
          className="px-4 py-2.5 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Restaurar Demonstração</span>
        </button>
      </div>

      {/* Confirmation Dialog for Reset */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Restaurar Dados Padrão Acadêmicos"
        message="Todas as anotações e disciplinas atuais serão substituídas pelo conjunto de demonstração acadêmico inicial."
        confirmText="Restaurar Dados"
        isDanger={false}
        requireConfirmationWord="RESTAURAR"
        onConfirm={handleConfirmReset}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </section>
  )
}
