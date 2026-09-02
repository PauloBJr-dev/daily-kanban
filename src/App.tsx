import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Header } from './components/Header'
import { QuickStats } from './components/QuickStats'
import { PomodoroWidget } from './components/PomodoroWidget'
import { FilterBar } from './components/FilterBar'
import { Board } from './components/Board'
import { TaskModal } from './components/TaskModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ShortcutsModal } from './components/ShortcutsModal'
import { useKanban } from './hooks/useKanban'
import { usePomodoro } from './hooks/usePomodoro'
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts'
import type { Task } from './types/kanban'

export const App: React.FC = () => {
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
  } = usePomodoro(handleTaskMinuteLogged)

  const handlePomodoroPlayPause = useCallback(() => {
    if (session.isRunning) {
      pauseFocus()
    } else {
      resumeFocus()
    }
  }, [session.isRunning, pauseFocus, resumeFocus])

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newTaskColumnId, setNewTaskColumnId] = useState<string | undefined>(undefined)

  // Ref for global quick search focus
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    isDanger?: boolean
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

  const handleFocusSearch = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
      searchInputRef.current.select()
    }
  }, [])

  const handleOpenShortcuts = useCallback(() => {
    setIsShortcutsModalOpen((prev) => !prev)
  }, [])

  // Register Global Keyboard Navigation Shortcuts
  useGlobalShortcuts({
    onNewTask: () => handleOpenNewTask(),
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
      } else {
        addTask(taskData)
      }
    },
    [addTask, updateTask]
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
        },
      })
    },
    [tasks, session.taskId, clearFocusedTask, deleteTask]
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
        onConfirm: () => deleteColumn(columnId),
      })
    },
    [columns, tasks, deleteColumn]
  )

  const requestResetData = useCallback(() => {
    setConfirmState({
      isOpen: true,
      title: 'Restaurar Dados Padrão',
      message:
        'Todas as tarefas e colunas atuais serão substituídas pelo conjunto de demonstração inicial.',
      confirmText: 'Restaurar',
      isDanger: false,
      onConfirm: () => {
        resetToSeed()
        clearFocusedTask()
      },
    })
  }, [resetToSeed, clearFocusedTask])

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
          if (!success) {
            alert('Arquivo JSON inválido ou incompatível.')
          }
        } catch {
          alert('Erro ao ler arquivo JSON.')
        }
      }
      reader.readAsText(file)
      e.target.value = ''
    },
    [importData]
  )

  const handleFilterChange = useCallback(
    (updates: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...updates }))
    },
    [setFilters]
  )

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <Header
        onNewTask={() => handleOpenNewTask()}
        onExport={exportData}
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

      {/* Main Content with generous visual breathing room */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
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
            onMoveTask={moveTask}
            onToggleSubtask={toggleSubtask}
            onStartFocus={startFocus}
            onAddColumn={addColumn}
            onDeleteColumn={requestDeleteColumn}
            focusedTaskId={session.taskId}
          />
        </section>
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
        onConfirm={confirmState.onConfirm}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default App
