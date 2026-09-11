import React from 'react'
import {
  Kanban,
  GraduationCap,
  BarChart3,
  Settings,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Sparkles,
} from 'lucide-react'

export type AppView = 'kanban' | 'academic' | 'metrics' | 'settings' | 'profile'

export interface SidebarProps {
  activeView: AppView
  onViewChange: (view: AppView) => void
  isMobileOpen: boolean
  onCloseMobile: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

interface NavItem {
  id: AppView
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'academic', label: 'Espaço Acadêmico', icon: GraduationCap },
  { id: 'metrics', label: 'Métricas', icon: BarChart3 },
  { id: 'settings', label: 'Configurações', icon: Settings },
  { id: 'profile', label: 'Perfil', icon: User },
]

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const handleItemClick = (id: AppView) => {
    onViewChange(id)
    onCloseMobile()
  }

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Responsive Drawer */}
      <aside
        aria-label="Menu de Navegação Mobile"
        aria-hidden={!isMobileOpen}
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 z-50 shadow-2xl border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between p-4 md:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  OrganoCat
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Foco & Organização
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Fechar menu lateral"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav aria-label="Abas Mobile" className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold ring-1 ring-indigo-200/80 dark:ring-indigo-800/80 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Mobile Footer note */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          OrganoCat • Produtividade Elegante
        </div>
      </aside>

      {/* Desktop Collapsible Sidebar */}
      <aside
        aria-label="Navegação Principal"
        className={`hidden md:flex flex-col justify-between sticky top-0 h-screen shrink-0 border-r border-slate-200/80 dark:border-slate-800 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 transition-[width] duration-300 ease-in-out z-20 ${
          isCollapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        {/* Top Header & Branding */}
        <div>
          <div
            className={`h-20 flex items-center border-b border-slate-200/80 dark:border-slate-800 transition-all ${
              isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
            }`}
          >
            <div
              className={`flex items-center gap-3 overflow-hidden ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-200 dark:shadow-none shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                  <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    OrganoCat
                  </h2>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                    DailyFlow Workspace
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label="Abas do Sistema" className="p-3 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onViewChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isCollapsed
                      ? 'justify-center p-2.5 min-h-[42px]'
                      : 'gap-3 px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold ring-1 ring-indigo-200/80 dark:ring-indigo-800/80 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap animate-in fade-in duration-150">
                      {item.label}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer with Collapse/Expand button */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            className={`w-full flex items-center rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
            }`}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 shrink-0" />
                <span className="truncate whitespace-nowrap">Recolher barra</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
