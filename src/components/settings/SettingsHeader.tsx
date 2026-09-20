import React, { useState } from 'react'
import { CheckCircle2, Save } from 'lucide-react'

export interface SettingsHeaderProps {
  onSaveClick?: () => void
  hasAcademicSection?: boolean
}

interface NavItem {
  id: string
  label: string
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  onSaveClick,
  hasAcademicSection = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>('pomodoro')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'just_saved'>('saved')

  const navItems: NavItem[] = [
    { id: 'pomodoro', label: 'Pomodoro' },
    { id: 'notificacoes', label: 'Notificações & Sons' },
    { id: 'aparencia', label: 'Aparência' },
    { id: 'dados', label: 'Dados & Backup' },
    { id: 'atalhos', label: 'Atalhos' },
    ...(hasAcademicSection ? [{ id: 'academico', label: 'Acadêmico' }] : []),
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setActiveTab(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSave = () => {
    setSaveStatus('saving')
    onSaveClick?.()
    setTimeout(() => {
      setSaveStatus('just_saved')
      setTimeout(() => {
        setSaveStatus('saved')
      }, 2000)
    }, 400)
  }

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 -mx-6 lg:-mx-8 -mt-6 mb-6 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
      {/* Quick Anchor Tabs / Sub-nav */}
      <nav
        aria-label="Sub-navegação de configurações"
        className="flex items-center gap-2 overflow-x-auto text-xs font-medium no-scrollbar"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-200 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
            >
              {item.label}
            </a>
          )
        })}
      </nav>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
        {/* Saved Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            {saveStatus === 'saving'
              ? 'Salvando...'
              : saveStatus === 'just_saved'
                ? 'Alterações salvas!'
                : 'Todas alterações salvas'}
          </span>
        </div>

        {/* Save Button CTA */}
        <button
          type="button"
          onClick={handleSave}
          aria-label="Salvar Alterações"
          className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>
    </header>
  )
}
