import React, { useState } from 'react'
import { userPreferencesService } from '../../services/userPreferencesService'
import { useAuth } from '../../hooks/useAuth'
import { SettingsHeader } from './SettingsHeader'
import { PomodoroSection } from './PomodoroSection'
import { NotificationsSection } from './NotificationsSection'
import { AppearanceSection } from './AppearanceSection'
import { DataBackupSection } from './DataBackupSection'
import { ShortcutsSection } from './ShortcutsSection'

export interface SettingsViewProps {
  userId?: string
  isDark: boolean
  onToggleTheme: () => void
  workMinutes: number
  breakMinutes: number
  longBreakMinutes?: number
  longBreakCycles?: number
  autoStartBreaks?: boolean
  autoStartFocus?: boolean
  strictFocusMode?: boolean
  isSoundEnabled: boolean
  onUpdateDurations: (
    workMinutes: number,
    breakMinutes: number,
    longBreakMinutes?: number
  ) => void
  onToggleSound: () => void
  onUpdateSettings?: (settings: {
    workDurationMinutes?: number
    breakDurationMinutes?: number
    longBreakDurationMinutes?: number
    longBreakCycles?: number
    autoStartBreaks?: boolean
    autoStartFocus?: boolean
    strictFocusMode?: boolean
    isSoundEnabled?: boolean
  }) => void
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
  onOpenShortcuts?: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userId: propUserId,
  isDark,
  onToggleTheme,
  workMinutes: propWorkMinutes,
  breakMinutes: propBreakMinutes,
  longBreakMinutes: propLongBreakMinutes = 15,
  longBreakCycles: propLongBreakCycles = 4,
  autoStartBreaks: propAutoStartBreaks = true,
  autoStartFocus: propAutoStartFocus = false,
  strictFocusMode: propStrictFocusMode = true,
  isSoundEnabled,
  onUpdateDurations,
  onToggleSound,
  onUpdateSettings,
  onExport,
  onImport,
  onReset,
  onOpenShortcuts,
}) => {
  const [workMinutes, setWorkMinutes] = useState<number>(propWorkMinutes)
  const [breakMinutes, setBreakMinutes] = useState<number>(propBreakMinutes)
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(propLongBreakMinutes)
  const [longBreakCycles, setLongBreakCycles] = useState<number>(propLongBreakCycles)
  const [autoStartBreaks, setAutoStartBreaks] = useState<boolean>(propAutoStartBreaks)
  const [autoStartFocus, setAutoStartFocus] = useState<boolean>(propAutoStartFocus)
  const [strictFocusMode, setStrictFocusMode] = useState<boolean>(propStrictFocusMode)

  const [prevProps, setPrevProps] = useState({
    workMinutes: propWorkMinutes,
    breakMinutes: propBreakMinutes,
    longBreakMinutes: propLongBreakMinutes,
    longBreakCycles: propLongBreakCycles,
    autoStartBreaks: propAutoStartBreaks,
    autoStartFocus: propAutoStartFocus,
    strictFocusMode: propStrictFocusMode,
  })

  if (
    prevProps.workMinutes !== propWorkMinutes ||
    prevProps.breakMinutes !== propBreakMinutes ||
    prevProps.longBreakMinutes !== propLongBreakMinutes ||
    prevProps.longBreakCycles !== propLongBreakCycles ||
    prevProps.autoStartBreaks !== propAutoStartBreaks ||
    prevProps.autoStartFocus !== propAutoStartFocus ||
    prevProps.strictFocusMode !== propStrictFocusMode
  ) {
    setPrevProps({
      workMinutes: propWorkMinutes,
      breakMinutes: propBreakMinutes,
      longBreakMinutes: propLongBreakMinutes,
      longBreakCycles: propLongBreakCycles,
      autoStartBreaks: propAutoStartBreaks,
      autoStartFocus: propAutoStartFocus,
      strictFocusMode: propStrictFocusMode,
    })
    setWorkMinutes(propWorkMinutes)
    setBreakMinutes(propBreakMinutes)
    setLongBreakMinutes(propLongBreakMinutes)
    setLongBreakCycles(propLongBreakCycles)
    setAutoStartBreaks(propAutoStartBreaks)
    setAutoStartFocus(propAutoStartFocus)
    setStrictFocusMode(propStrictFocusMode)
  }

  const auth = useAuth(false)
  const currentUserId = propUserId || auth?.user?.id

  const handleWorkMinutesChange = (mins: number) => {
    const valid = Math.max(1, Math.min(180, mins))
    setWorkMinutes(valid)
    onUpdateDurations(valid, breakMinutes, longBreakMinutes)
    onUpdateSettings?.({ workDurationMinutes: valid })
    userPreferencesService.saveLocalPreferences({
      pomodoro: { workDurationMinutes: valid },
    })
    if (currentUserId) {
      userPreferencesService
        .syncUserPreferences(currentUserId, {
          pomodoro: { workDurationMinutes: valid },
        })
        .catch((err) => console.error('Erro ao sincronizar preferências:', err))
    }
  }

  const handleBreakMinutesChange = (mins: number) => {
    const valid = Math.max(1, Math.min(60, mins))
    setBreakMinutes(valid)
    onUpdateDurations(workMinutes, valid, longBreakMinutes)
    onUpdateSettings?.({ breakDurationMinutes: valid })
    userPreferencesService.saveLocalPreferences({
      pomodoro: { breakDurationMinutes: valid },
    })
    if (currentUserId) {
      userPreferencesService
        .syncUserPreferences(currentUserId, {
          pomodoro: { breakDurationMinutes: valid },
        })
        .catch((err) => console.error('Erro ao sincronizar preferências:', err))
    }
  }

  const handleLongBreakMinutesChange = (mins: number) => {
    const valid = Math.max(1, Math.min(120, mins))
    setLongBreakMinutes(valid)
    onUpdateDurations(workMinutes, breakMinutes, valid)
    onUpdateSettings?.({ longBreakDurationMinutes: valid })
    userPreferencesService.saveLocalPreferences({
      pomodoro: { longBreakDurationMinutes: valid },
    })
    if (currentUserId) {
      userPreferencesService
        .syncUserPreferences(currentUserId, {
          pomodoro: { longBreakDurationMinutes: valid },
        })
        .catch((err) => console.error('Erro ao sincronizar preferências:', err))
    }
  }

  const handleLongBreakCyclesChange = (cycles: number) => {
    const valid = Math.max(1, Math.min(12, cycles))
    setLongBreakCycles(valid)
    onUpdateSettings?.({ longBreakCycles: valid })
    userPreferencesService.saveLocalPreferences({
      pomodoro: { longBreakCycles: valid },
    })
    if (currentUserId) {
      userPreferencesService
        .syncUserPreferences(currentUserId, {
          pomodoro: { longBreakCycles: valid },
        })
        .catch((err) => console.error('Erro ao sincronizar preferências:', err))
    }
  }

  const handleAutoStartBreaksChange = (enabled: boolean) => {
    setAutoStartBreaks(enabled)
    onUpdateSettings?.({ autoStartBreaks: enabled })
    userPreferencesService.saveLocalPreferences({
      pomodoro: { autoStartBreaks: enabled },
    })
    if (currentUserId) {
      userPreferencesService
        .syncUserPreferences(currentUserId, {
          pomodoro: { autoStartBreaks: enabled },
        })
        .catch((err) => console.error('Erro ao sincronizar preferências:', err))
    }
  }

  const handleAutoStartFocusChange = (enabled: boolean) => {
    setAutoStartFocus(enabled)
    onUpdateSettings?.({ autoStartFocus: enabled })
    userPreferencesService.saveLocalPreferences({
      pomodoro: { autoStartFocus: enabled },
    })
    if (currentUserId) {
      userPreferencesService
        .syncUserPreferences(currentUserId, {
          pomodoro: { autoStartFocus: enabled },
        })
        .catch((err) => console.error('Erro ao sincronizar preferências:', err))
    }
  }

  const handleStrictFocusModeChange = (enabled: boolean) => {
    setStrictFocusMode(enabled)
    onUpdateSettings?.({ strictFocusMode: enabled })
    userPreferencesService.saveLocalPreferences({
      pomodoro: { strictFocusMode: enabled },
    })
    if (currentUserId) {
      userPreferencesService
        .syncUserPreferences(currentUserId, {
          pomodoro: { strictFocusMode: enabled },
        })
        .catch((err) => console.error('Erro ao sincronizar preferências:', err))
    }
  }

  const handleManualSave = () => {
    onUpdateDurations(workMinutes, breakMinutes, longBreakMinutes)
    const settings = {
      workDurationMinutes: workMinutes,
      breakDurationMinutes: breakMinutes,
      longBreakDurationMinutes: longBreakMinutes,
      longBreakCycles,
      autoStartBreaks,
      autoStartFocus,
      strictFocusMode,
      isSoundEnabled,
    }
    onUpdateSettings?.(settings)
    userPreferencesService.saveLocalPreferences({
      pomodoro: settings,
    })
    if (currentUserId) {
      userPreferencesService
        .syncUserPreferences(currentUserId, {
          pomodoro: settings,
        })
        .catch((err) => console.error('Erro ao sincronizar preferências:', err))
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in duration-200">
      {/* 1. Header Fiel ao Stitch com Sticky Blur & Sub-navegação */}
      <SettingsHeader onSaveClick={handleManualSave} />

      {/* 2. Temporizador Pomodoro (com 4 cards e automações) */}
      <PomodoroSection
        workMinutes={workMinutes}
        breakMinutes={breakMinutes}
        longBreakMinutes={longBreakMinutes}
        longBreakCycles={longBreakCycles}
        autoStartBreaks={autoStartBreaks}
        autoStartFocus={autoStartFocus}
        strictFocusMode={strictFocusMode}
        onUpdateWorkMinutes={handleWorkMinutesChange}
        onUpdateBreakMinutes={handleBreakMinutesChange}
        onUpdateLongBreakMinutes={handleLongBreakMinutesChange}
        onUpdateLongBreakCycles={handleLongBreakCyclesChange}
        onToggleAutoStartBreaks={handleAutoStartBreaksChange}
        onToggleAutoStartFocus={handleAutoStartFocusChange}
        onToggleStrictFocusMode={handleStrictFocusModeChange}
        onUpdateSettings={onUpdateSettings}
      />

      {/* 3. Notificações */}
      <NotificationsSection
        isSoundEnabled={isSoundEnabled}
        onToggleSound={onToggleSound}
      />

      {/* 4. Aparência da Interface */}
      <AppearanceSection isDark={isDark} onToggleTheme={onToggleTheme} />

      {/* 5. Gerenciamento de Dados & Backup */}
      <DataBackupSection onExport={onExport} onImport={onImport} onReset={onReset} />

      {/* 6. Atalhos de Teclado */}
      <ShortcutsSection onOpenShortcuts={onOpenShortcuts} />
    </div>
  )
}
