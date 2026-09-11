import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Header } from './components/Header'
import { Sidebar, type AppView } from './components/Sidebar'
import { MetricsView } from './components/metrics'
import { SettingsView } from './components/settings'
import { ProfileView } from './components/profile'
import { PomodoroWidget } from './components/PomodoroWidget'
import { PomodoroFullscreen } from './components/PomodoroFullscreen'
import { FilterBar } from './components/FilterBar'
import { Board } from './components/Board'
import { TaskModal } from './components/TaskModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ShortcutsModal } from './components/ShortcutsModal'
import { AuthModal } from './components/AuthModal'
import { ToastContainer } from './components/ToastContainer'
import { AcademicView, type AcademicViewHandle } from './components/academic'
import { useKanban } from './hooks/useKanban'
import { usePomodoro } from './hooks/usePomodoro'
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts'
import { ToastProvider, useToast } from './hooks/useToast'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import type { Task, Column } from './types/kanban'

export const AppContent: React.FC = () => {
  const toast = useToast()
  const {
    user,
    loading: authLoading,
    isGuestAcknowledged,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  } = useAuth()

  const {
    columns,
    tasks,
    allTasksCount,
    filters,
    setFilters,
    allTags,
    stats,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    moveTask,
    toggleSubtask,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    moveColumn,
    exportData,
    importData,
    resetToSeed,
  } = useKanban()

  // Theme Management (Dark / Light)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dailyflow_theme')
      if (saved) return saved === 'dark'
      if (typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
    }
    return false
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('dailyflow_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('dailyflow_theme', 'light')
    }
  }, [isDark])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
  }, [])

  // Abertura automática do AuthModal na primeira visita
  useEffect(() => {
    if (!authLoading && !user && !isGuestAcknowledged) {
      openAuthModal()
    }
  }, [authLoading, user, isGuestAcknowledged, openAuthModal])

  // Pomodoro Integration
  const handleTaskMinuteLogged = useCallback(
    (taskId: string, minutes: number) => {
      const task = tasks.find((t) => t.id === taskId)
      const currentMins = task?.pomodoroMinutesSpent || 0
      updateTask(taskId, { pomodoroMinutesSpent: currentMins + minutes })
    },
    [tasks, updateTask]
  )

  const {
    session,
    startFocus,
    pauseFocus,
    resumeFocus,
    resetTimer,
    switchMode,
    clearFocusedTask,
    formatTime,
    updateDurations,
    toggleSound,
    updateSettings,
  } = usePomodoro(handleTaskMinuteLogged)

  const [isPomodoroFullscreen, setIsPomodoroFullscreen] = useState(false)

  const handlePomodoroPlayPause = useCallback(() => {
    if (session.isRunning) {
      pauseFocus()
    } else {
      resumeFocus()
      setIsPomodoroFullscreen(true)
    }
  }, [session.isRunning, pauseFocus, resumeFocus])

  const handleStartFocus = useCallback(
    (taskId: string, taskTitle: string) => {
      startFocus(taskId, taskTitle)
      setIsPomodoroFullscreen(true)
    },
    [startFocus]
  )

  // Active view navigation ('kanban' | 'academic' | 'metrics' | 'settings' | 'profile')
  const [activeView, setActiveView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dailyflow_active_view')
      if (
        saved === 'kanban' ||
        saved === 'academic' ||
        saved === 'metrics' ||
        saved === 'settings' ||
        saved === 'profile'
      ) {
        return saved
      }
    }
    return 'kanban'
  })

  // Sidebar Collapse & Mobile Drawer State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('organocat_sidebar_collapsed')
      return saved === 'true'
    }
    return false
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('organocat_sidebar_collapsed', String(isSidebarCollapsed))
    }
  }, [isSidebarCollapsed])

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev)
  }, [])

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false)
  const handleToggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileSidebarOpen((prev) => !prev)
    } else {
      setIsSidebarCollapsed((prev) => !prev)
    }
  }, [])

  // Zen Mode
  const [isZenMode, setIsZenMode] = useState(false)

  const handleViewChange = useCallback((view: AppView) => {
    setActiveView(view)
    setIsZenMode(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dailyflow_active_view', view)
    }
  }, [])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPomodoroFullscreen) {
          setIsPomodoroFullscreen(false)
        } else if (isZenMode) {
          setIsZenMode(false)
        } else if (isMobileSidebarOpen) {
          setIsMobileSidebarOpen(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPomodoroFullscreen, isZenMode, isMobileSidebarOpen])

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newTaskColumnId, setNewTaskColumnId] = useState<string | undefined>(undefined)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const academicViewRef = useRef<AcademicViewHandle>(null)

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    isDanger?: boolean
    requireConfirmationWord?: string
    isDoubleConfirm?: boolean
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  // Task creation and editing handlers
  const handleOpenNewTask = useCallback(
    (columnId?: string) => {
      setSelectedTask(null)
      setNewTaskColumnId(columnId || columns[0]?.id)
      setIsTaskModalOpen(true)
    },
    [columns]
  )

  const handleOpenNewNote = useCallback(() => {
    if (activeView !== 'academic') {
      handleViewChange('academic')
      setTimeout(() => {
        academicViewRef.current?.openNewNote()
      }, 50)
    } else {
      academicViewRef.current?.openNewNote()
    }
  }, [activeView, handleViewChange])

  const handleFocusSearch = useCallback(() => {
    if (activeView === 'kanban') {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
        searchInputRef.current.select()
      }
    } else if (activeView === 'academic') {
      academicViewRef.current?.focusSearch()
    }
  }, [activeView])

  const handleOpenShortcuts = useCallback(() => {
    setIsShortcutsModalOpen((prev) => !prev)
  }, [])

  // Register Global Keyboard Navigation Shortcuts
  useGlobalShortcuts({
    onNewTask: () => {
      if (activeView === 'academic') {
        handleOpenNewNote()
      } else {
        handleOpenNewTask()
      }
    },
    onFocusSearch: handleFocusSearch,
    onTogglePomodoro: handlePomodoroPlayPause,
    onOpenShortcuts: handleOpenShortcuts,
    enabled: !isTaskModalOpen && !confirmState.isOpen && !isAuthModalOpen,
  })

  const handleOpenEditTask = useCallback((task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }, [])

  const handleSaveTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, taskId?: string) => {
      if (taskId) {
        updateTask(taskId, taskData)
        toast.info('Tarefa atualizada')
      } else {
        addTask(taskData)
        toast.success('Tarefa criada com sucesso')
      }
    },
    [addTask, updateTask, toast]
  )

  // Confirmation handlers
  const requestDeleteTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId)
      setConfirmState({
        isOpen: true,
        title: 'Excluir Tarefa',
        message: `Tem certeza que deseja excluir a tarefa "${task?.title || 'selecionada'}"? Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir Tarefa',
        isDanger: true,
        onConfirm: () => {
          if (session.taskId === taskId) {
            clearFocusedTask()
          }
          deleteTask(taskId)
          toast.info('Tarefa excluída', {
            action: {
              label: 'Desfazer',
              onClick: () => {
                if (task) restoreTask(task)
              },
            },
          })
        },
      })
    },
    [tasks, session.taskId, clearFocusedTask, deleteTask, restoreTask, toast]
  )

  const handleMoveTask = useCallback(
    (taskId: string, targetColumnId: string, targetIndex?: number) => {
      const task = tasks.find((t) => t.id === taskId)
      const targetCol = columns.find((c) => c.id === targetColumnId)
      moveTask(taskId, targetColumnId, targetIndex)
      if (task && task.columnId !== targetColumnId) {
        toast.info(`Tarefa movida para ${targetCol?.title || 'nova coluna'}`)
      }
    },
    [tasks, columns, moveTask, toast]
  )

  const handleAddColumn = useCallback(
    (title: string, colorTheme: Column['colorTheme']) => {
      addColumn(title, colorTheme)
      toast.success('Coluna criada com sucesso')
    },
    [addColumn, toast]
  )

  const handleUpdateColumn = useCallback(
    (
      columnId: string,
      updates: { title?: string; colorTheme?: Column['colorTheme'] }
    ) => {
      updateColumn(columnId, updates)
      toast.success('Coluna atualizada com sucesso')
    },
    [updateColumn, toast]
  )

  const requestDeleteColumn = useCallback(
    (columnId: string) => {
      const col = columns.find((c) => c.id === columnId)
      if (col?.isPermanent) {
        toast.error('Colunas padrão não podem ser excluídas')
        return
      }
      const tasksInCol = tasks.filter((t) => t.columnId === columnId).length
      setConfirmState({
        isOpen: true,
        title: 'Excluir Coluna',
        message: `Tem certeza que deseja excluir a coluna "${col?.title || ''}" e suas ${tasksInCol} tarefa(s)?`,
        confirmText: 'Excluir Coluna',
        isDanger: true,
        requireConfirmationWord: tasksInCol > 0 ? 'EXCLUIR' : undefined,
        onConfirm: () => {
          deleteColumn(columnId)
          toast.info('Coluna excluída')
        },
      })
    },
    [columns, tasks, deleteColumn, toast]
  )

  const handleFilterChange = useCallback(
    (updates: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...updates }))
    },
    [setFilters]
  )

  const handleExport = useCallback(() => {
    exportData()
    toast.success('Backup JSON exportado com sucesso')
  }, [exportData, toast])

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          const success = importData(content)
          if (success) {
            toast.success('Dados importados com sucesso!')
          } else {
            toast.error('Formato de arquivo inválido')
          }
        } catch {
          toast.error('Erro ao ler arquivo')
        }
      }
      reader.readAsText(file)
      e.target.value = ''
    },
    [importData, toast]
  )

  const handleResetData = useCallback(() => {
    setConfirmState({
      isOpen: true,
      title: 'Restaurar Dados Padrão',
      message:
        'Deseja restaurar o OrganoCat para os dados de demonstração iniciais? Suas alterações locais serão substituídas.',
      confirmText: 'Restaurar',
      isDanger: true,
      requireConfirmationWord: 'RESTAURAR',
      onConfirm: () => {
        resetToSeed()
        toast.info('Dados de demonstração restaurados')
      },
    })
  }, [resetToSeed, toast])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-row transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none"
      >
        Pular para o conteúdo
      </a>

      {/* Sidebar (Hidden in Academic Zen Mode) */}
      {!isZenMode && (
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* App Header (Hidden in Academic Zen Mode) */}
        {!isZenMode && (
          <Header
            activeView={activeView}
            onViewChange={handleViewChange}
            onToggleSidebar={handleToggleSidebar}
            onNewTask={() => handleOpenNewTask()}
            onNewNote={handleOpenNewNote}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            stats={{
              completedCount: stats.completedCount,
              total: stats.total,
              completionRate: stats.completionRate,
            }}
          />
        )}

        {/* Main Viewport Container */}
        <main
          id="main-content"
          className={
            isZenMode
              ? 'flex-1 w-full p-0 overflow-hidden'
              : 'flex-1 w-full px-6 lg:px-8 py-6 space-y-6'
          }
        >
          {/* TAB 1: KANBAN */}
          {activeView === 'kanban' && (
            <>
              {/* 1- Cronômetro (PomodoroWidget) */}
              <PomodoroWidget
                session={session}
                onPlayPause={handlePomodoroPlayPause}
                onReset={resetTimer}
                onSwitchMode={switchMode}
                onClearTask={clearFocusedTask}
                formatTime={formatTime}
                onUpdateDurations={updateDurations}
                onToggleSound={toggleSound}
                onUpdateSettings={updateSettings}
                onOpenFullscreen={() => setIsPomodoroFullscreen(true)}
              />

              {/* 2- Filtros (FilterBar) */}
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                allTags={allTags}
                totalFiltered={tasks.length}
                allTasksCount={allTasksCount}
                searchInputRef={searchInputRef}
              />

              {/* 3- Kanban (Board) */}
              <section aria-label="Quadro Kanban" className="pt-2">
                <Board
                  columns={columns}
                  tasks={tasks}
                  onNewTaskInColumn={handleOpenNewTask}
                  onEditTask={handleOpenEditTask}
                  onDeleteTask={requestDeleteTask}
                  onMoveTask={handleMoveTask}
                  onToggleSubtask={toggleSubtask}
                  onStartFocus={handleStartFocus}
                  onAddColumn={handleAddColumn}
                  onDeleteColumn={requestDeleteColumn}
                  onMoveColumn={moveColumn}
                  onReorderColumns={reorderColumns}
                  onUpdateColumn={handleUpdateColumn}
                  focusedTaskId={session.taskId}
                />
              </section>
            </>
          )}

          {/* TAB 2: ESPAÇO ACADÊMICO */}
          {activeView === 'academic' && (
            <AcademicView
              ref={academicViewRef}
              isZenMode={isZenMode}
              onZenModeChange={setIsZenMode}
            />
          )}

          {/* TAB 3: MÉTRICAS */}
          {activeView === 'metrics' && (
            <MetricsView tasks={tasks} columns={columns} allTags={allTags} />
          )}

          {/* TAB 4: CONFIGURAÇÕES */}
          {activeView === 'settings' && (
            <SettingsView
              isDark={isDark}
              onToggleTheme={toggleTheme}
              workMinutes={Math.round(session.workDuration / 60)}
              breakMinutes={Math.round(session.breakDuration / 60)}
              isSoundEnabled={session.isSoundEnabled ?? true}
              catPurrType={session.catPurrType ?? 'none'}
              catPurrVolume={session.catPurrVolume ?? 0.6}
              onUpdateDurations={updateDurations}
              onToggleSound={toggleSound}
              onUpdateSettings={(settings) => {
                updateSettings(
                  settings.workDurationMinutes ?? Math.round(session.workDuration / 60),
                  settings.breakDurationMinutes ?? Math.round(session.breakDuration / 60),
                  settings.isSoundEnabled ?? session.isSoundEnabled ?? true,
                  settings.catPurrType ?? session.catPurrType ?? 'none',
                  settings.catPurrVolume ?? session.catPurrVolume ?? 0.6
                )
              }}
              onExport={handleExport}
              onImport={handleImport}
              onReset={handleResetData}
              onOpenShortcuts={handleOpenShortcuts}
              onOpenAcademicSubjects={() => handleViewChange('academic')}
            />
          )}

          {/* TAB 5: PERFIL */}
          {activeView === 'profile' && (
            <ProfileView tasks={tasks} onOpenAuthModal={() => openAuthModal()} />
          )}
        </main>
      </div>

      {/* Fullscreen Pomodoro Timer */}
      {isPomodoroFullscreen && (
        <PomodoroFullscreen
          session={session}
          onPlayPause={handlePomodoroPlayPause}
          onReset={resetTimer}
          onSwitchMode={switchMode}
          onClose={() => setIsPomodoroFullscreen(false)}
          formatTime={formatTime}
        />
      )}

      {/* Task Creation / Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={requestDeleteTask}
        task={selectedTask}
        columns={columns}
        initialColumnId={newTaskColumnId}
        availableTags={allTags}
      />

      {/* Shortcuts Guide Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Minimalist Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        isDanger={confirmState.isDanger}
        requireConfirmationWord={confirmState.requireConfirmationWord}
        isDoubleConfirm={confirmState.isDoubleConfirm}
        onConfirm={confirmState.onConfirm}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Authentication & Guest Notice Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  )
}

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
