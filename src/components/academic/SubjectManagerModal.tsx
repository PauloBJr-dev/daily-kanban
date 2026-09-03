import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Layers, Check, AlertTriangle } from 'lucide-react'
import type { Subject } from '../../types/academic'
import { SUBJECT_COLORS, getSubjectColor } from './academicColors'

interface SubjectManagerModalProps {
  isOpen: boolean
  onClose: () => void
  subjects: Subject[]
  notesCountBySubject?: Record<string, number>
  onAddSubject: (subject: Omit<Subject, 'id'>) => Subject | void
  onDeleteSubject: (subjectId: string) => void
}

const AVAILABLE_PALETTES = [
  'indigo',
  'emerald',
  'violet',
  'amber',
  'rose',
  'sky',
  'fuchsia',
  'teal',
  'purple',
  'blue',
]

export const SubjectManagerModal: React.FC<SubjectManagerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  notesCountBySubject = {},
  onAddSubject,
  onDeleteSubject,
}) => {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [selectedColor, setSelectedColor] = useState('indigo')
  const [nameError, setNameError] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (subjectToDelete) {
          setSubjectToDelete(null)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, subjectToDelete])

  if (!isOpen) return null

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setNameError(true)
      return
    }

    onAddSubject({
      name: name.trim(),
      code: code.trim() || undefined,
      color: selectedColor,
    })

    setName('')
    setCode('')
    setSelectedColor('indigo')
    setNameError(false)
  }

  const confirmDelete = () => {
    if (subjectToDelete) {
      onDeleteSubject(subjectToDelete.id)
      setSubjectToDelete(null)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="subject-manager-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg my-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="subject-manager-title"
                className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
              >
                Gerenciar Disciplinas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize suas matérias e atribua cores temáticas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Form to Add New Subject */}
          <form
            onSubmit={handleAddSubmit}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Nova Disciplina
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Name */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="subject-name-input"
                  className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
                >
                  Nome da Matéria <span className="text-rose-500">*</span>
                </label>
                <input
                  id="subject-name-input"
                  type="text"
                  placeholder="Ex: Teoria da Computação"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (nameError) setNameError(false)
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all ${
                    nameError
                      ? 'border-rose-400 ring-2 ring-rose-400/20'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Code */}
              <div>
                <label
                  htmlFor="subject-code-input"
                  className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
                >
                  Código (opcional)
                </label>
                <input
                  id="subject-code-input"
                  type="text"
                  placeholder="Ex: CC-301"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Color Palette Selector */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Paleta de Cores
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {AVAILABLE_PALETTES.map((colorKey) => {
                  const isSelected = selectedColor === colorKey
                  const colorConfig = SUBJECT_COLORS[colorKey] || SUBJECT_COLORS.indigo
                  return (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => setSelectedColor(colorKey)}
                      aria-label={`Cor ${colorConfig.name}`}
                      title={colorConfig.name}
                      className={`w-7 h-7 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                        colorConfig.bg
                      } ${
                        isSelected
                          ? 'ring-3 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-110'
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Add Button */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Disciplina</span>
              </button>
            </div>
          </form>

          {/* List of Existing Subjects */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Disciplinas Cadastradas ({subjects.length})
              </h3>
            </div>

            {subjects.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Nenhuma disciplina cadastrada ainda.
              </div>
            ) : (
              <div className="space-y-2">
                {subjects.map((sub) => {
                  const colorConfig = getSubjectColor(sub.color)
                  const notesCount = notesCountBySubject[sub.id] || 0

                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Dot badge */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${colorConfig.bgSubtle} ${colorConfig.border}`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${colorConfig.dot}`}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {sub.name}
                            </span>
                            {sub.code && (
                              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                {sub.code}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {notesCount} anotação(ões) vinculada(s)
                          </span>
                        </div>
                      </div>

                      {/* Delete action */}
                      <button
                        type="button"
                        onClick={() => setSubjectToDelete(sub)}
                        aria-label={`Excluir disciplina ${sub.name}`}
                        title="Excluir disciplina"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Concluído
          </button>
        </div>

        {/* Nested Delete Confirmation Dialog */}
        {subjectToDelete && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-100"
            onClick={() => setSubjectToDelete(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Excluir Disciplina?
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tem certeza que deseja excluir <strong>{subjectToDelete.name}</strong>
                    ? Todas as anotações associadas a esta disciplina também serão
                    removidas permanentemente.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubjectToDelete(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Excluir Disciplina
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
