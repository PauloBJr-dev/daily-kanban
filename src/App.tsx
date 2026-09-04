import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Header } from './components/Header'
import { QuickStats } from './components/QuickStats'
import { PomodoroWidget } from './components/PomodoroWidget'
import { FilterBar } from './components/FilterBar'
import { Board } from './components/Board'
import { TaskModal } from './components/TaskModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ShortcutsModal } from './components/ShortcutsModal'
import { ToastContainer } from './components/ToastContainer'
import { AcademicView, type AcademicViewHandle } from './components/academic'
import { useKanban } from './hooks/useKanban'
import { usePomodoro } from './hooks/usePomodoro'
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts'
import { ToastProvider, useToast } from './hooks/useToast'
import type { Task, Column } from './types/kanban'

export const AppContent: React.FC = () => {
  const toast = useToast()
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
    deleteColumn,
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
  } = usePomodoro(handleTaskMinuteLogged)

  const handlePomodoroPlayPause = useCallback(() => {
    if (session.isRunning) {
      pauseFocus()
    } else {
      resumeFocus()
    }
  }, [session.isRunning, pauseFocus, resumeFocus])

  // Active view navigation ('kanban' | 'academic')
  const [activeView, setActiveView] = useState<'kanban' | 'academic'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dailyflow_active_view')
      if (saved === 'kanban' || saved === 'academic') {
        return saved
      }
    }
    return 'kanban'
  })

  // Zen Mode (Immersive full-screen focus in academic studio)
  const [isZenMode, setIsZenMode] = useState(false)

  const handleViewChange = useCallback((view: 'kanban' | 'academic') => {
    setActiveView(view)
    setIsZenMode(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dailyflow_active_view', view)
    }
  }, [])

  // Restore header on Escape key when in Zen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isZenMode])

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newTaskColumnId, setNewTaskColumnId] = useState<string | undefined>(undefined)

  // Ref for global quick search focus
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
    academicViewRef.current?.openNewNote()
  }, [])

  const handleFocusSearch = useCallback(() => {
    if (activeView === 'kanban') {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
        searchInputRef.current.select()
      }
    } else {
      academicViewRef.current?.focusSearch()
    }
  }, [activeView])

  const handleOpenShortcuts = useCallback(() => {
    setIsShortcutsModalOpen((prev) => !prev)
  }, [])

  // Register Global Keyboard Navigation Shortcuts
  useGlobalShortcuts({
    onNewTask: () => {
      if (activeView === 'kanban') {
        handleOpenNewTask()
      } else {
        handleOpenNewNote()
      }
    },
    onFocusSearch: handleFocusSearch,
    onTogglePomodoro: handlePomodoroPlayPause,
    onOpenShortcuts: handleOpenShortcuts,
    enabled: !isTaskModalOpen && !confirmState.isOpen,
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

  const requestDeleteColumn = useCallback(
    (columnId: string) => {
      const col = columns.find((c) => c.id === columnId)
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

  const requestResetData = useCallback(() => {
    setConfirmState({
      isOpen: true,
      title: 'Restaurar Dados Padrão',
      message:
        'Todas as tarefas e colunas atuais serão substituídas pelo conjunto de demonstração inicial.',
      confirmText: 'Restaurar',
      isDanger: false,
      requireConfirmationWord: 'RESTAURAR',
      onConfirm: () => {
        resetToSeed()
        clearFocusedTask()
        toast.info('Dados de demonstração restaurados')
      },
    })
  }, [resetToSeed, clearFocusedTask, toast])

  // JSON Export handler
  const handleExport = useCallback(() => {
    exportData()
    toast.success('Backup JSON exportado com sucesso')
  }, [exportData, toast])

  // JSON Import handler
  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string)
          const success = importData(parsed)
          if (success) {
            toast.success('Dados importados com sucesso')
          } else {
            toast.error('Arquivo JSON inválido ou incompatível.')
          }
        } catch {
          toast.error('Erro ao ler arquivo JSON.')
        }
      }
      reader.readAsText(file)
      e.target.value = ''
    },
    [importData, toast]
  )

  const handleFilterChange = useCallback(
    (updates: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...updates }))
    },
    [setFilters]
  )

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Skip to Main Content Link for A11y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:font-medium focus:text-sm focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
      >
        Pular para o conteúdo
      </a>

      {/* Header (Hidden in Zen Mode) */}
      {!isZenMode && (
        <Header
          activeView={activeView}
          onViewChange={handleViewChange}
          onNewTask={() => handleOpenNewTask()}
          onNewNote={handleOpenNewNote}
          onExport={handleExport}
          onImport={handleImport}
          onReset={requestResetData}
          onOpenShortcuts={handleOpenShortcuts}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          stats={{
            completedCount: stats.completedCount,
            total: stats.total,
            completionRate: stats.completionRate,
          }}
        />
      )}

      {/* Main Content with generous visual breathing room */}
      <main
        id="main-content"
        className={
          isZenMode
            ? 'flex-1 w-full p-0 overflow-hidden'
            : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6'
        }
      >
        {activeView === 'kanban' ? (
          <>
            {/* Quick Stats Grid */}
            <QuickStats stats={stats} />

            {/* Pomodoro Focus Banner */}
            <PomodoroWidget
              session={session}
              onPlayPause={handlePomodoroPlayPause}
              onReset={resetTimer}
              onSwitchMode={switchMode}
              onClearTask={clearFocusedTask}
              formatTime={formatTime}
              onUpdateDurations={updateDurations}
              onToggleSound={toggleSound}
            />

            {/* Filter and Search Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              allTags={allTags}
              totalFiltered={tasks.length}
              allTasksCount={allTasksCount}
              searchInputRef={searchInputRef}
            />

            {/* Kanban Board */}
            <section aria-label="Quadro Kanban" className="pt-2">
              <Board
                columns={columns}
                tasks={tasks}
                onNewTaskInColumn={handleOpenNewTask}
                onEditTask={handleOpenEditTask}
                onDeleteTask={requestDeleteTask}
                onMoveTask={handleMoveTask}
                onToggleSubtask={toggleSubtask}
                onStartFocus={startFocus}
                onAddColumn={handleAddColumn}
                onDeleteColumn={requestDeleteColumn}
                focusedTaskId={session.taskId}
              />
            </section>
          </>
        ) : (
          /* Academic Workspace */
          <AcademicView
            ref={academicViewRef}
            isZenMode={isZenMode}
            onZenModeChange={setIsZenMode}
          />
        )}
      </main>

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

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  )
}

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App
