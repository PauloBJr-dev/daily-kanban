import React, { useState, useEffect } from 'react'
import type { CatPurrType } from '../../types/kanban'
import { soundService } from '../../services/soundService'
import { SettingsHeader } from './SettingsHeader'
import { PomodoroSection } from './PomodoroSection'
import { NotificationsSection } from './NotificationsSection'
import { AppearanceSection } from './AppearanceSection'
import { DataBackupSection } from './DataBackupSection'
import { ShortcutsSection } from './ShortcutsSection'
import { AcademicSection } from './AcademicSection'

export interface SettingsViewProps {
  isDark: boolean
  onToggleTheme: () => void
  workMinutes: number
  breakMinutes: number
  isSoundEnabled: boolean
  catPurrType?: CatPurrType
  catPurrVolume?: number
  onUpdateDurations: (workMinutes: number, breakMinutes: number) => void
  onToggleSound: () => void
  onUpdateSettings?: (settings: {
    workDurationMinutes?: number
    breakDurationMinutes?: number
    isSoundEnabled?: boolean
    catPurrType?: CatPurrType
    catPurrVolume?: number
  }) => void
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
  onOpenShortcuts?: () => void
  onOpenAcademicSubjects?: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDark,
  onToggleTheme,
  workMinutes: propWorkMinutes,
  breakMinutes: propBreakMinutes,
  isSoundEnabled,
  catPurrType: propCatPurrType = 'none',
  catPurrVolume: propCatPurrVolume = 0.6,
  onUpdateDurations,
  onToggleSound,
  onUpdateSettings,
  onExport,
  onImport,
  onReset,
  onOpenShortcuts,
  onOpenAcademicSubjects,
}) => {
  const [workMinutes, setWorkMinutes] = useState<number>(propWorkMinutes)
  const [breakMinutes, setBreakMinutes] = useState<number>(propBreakMinutes)
  const [catPurrType, setCatPurrType] = useState<CatPurrType>(propCatPurrType)
  const [catPurrVolume, setCatPurrVolume] = useState<number>(propCatPurrVolume)

  const [prevProps, setPrevProps] = useState({
    workMinutes: propWorkMinutes,
    breakMinutes: propBreakMinutes,
    catPurrType: propCatPurrType,
    catPurrVolume: propCatPurrVolume,
  })

  // Sincroniza estado com novas props quando alteradas externamente (Padrão oficial React 19)
  if (
    prevProps.workMinutes !== propWorkMinutes ||
    prevProps.breakMinutes !== propBreakMinutes ||
    prevProps.catPurrType !== propCatPurrType ||
    prevProps.catPurrVolume !== propCatPurrVolume
  ) {
    setPrevProps({
      workMinutes: propWorkMinutes,
      breakMinutes: propBreakMinutes,
      catPurrType: propCatPurrType,
      catPurrVolume: propCatPurrVolume,
    })
    setWorkMinutes(propWorkMinutes)
    setBreakMinutes(propBreakMinutes)
    setCatPurrType(propCatPurrType)
    setCatPurrVolume(propCatPurrVolume)
  }

  // Desativa áudio contínuo ao desmontar tela
  useEffect(() => {
    return () => {
      soundService.stopCatPurr()
    }
  }, [])

  const handleWorkMinutesChange = (mins: number) => {
    const valid = Math.max(1, Math.min(180, mins))
    setWorkMinutes(valid)
    onUpdateDurations(valid, breakMinutes)
    onUpdateSettings?.({ workDurationMinutes: valid })
  }

  const handleBreakMinutesChange = (mins: number) => {
    const valid = Math.max(1, Math.min(60, mins))
    setBreakMinutes(valid)
    onUpdateDurations(workMinutes, valid)
    onUpdateSettings?.({ breakDurationMinutes: valid })
  }

  const handleSelectPurr = (type: CatPurrType) => {
    soundService.stopCatPurr()
    setCatPurrType(type)
    onUpdateSettings?.({ catPurrType: type })
  }

  const handleVolumeChange = (vol: number) => {
    const valid = Math.max(0.05, Math.min(1, vol))
    setCatPurrVolume(valid)
    onUpdateSettings?.({ catPurrVolume: valid })
  }

  const handleManualSave = () => {
    onUpdateDurations(workMinutes, breakMinutes)
    onUpdateSettings?.({
      workDurationMinutes: workMinutes,
      breakDurationMinutes: breakMinutes,
      isSoundEnabled,
      catPurrType,
      catPurrVolume,
    })
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in duration-200">
      {/* 1. Header Fiel ao Stitch com Sticky Blur & Sub-navegação */}
      <SettingsHeader
        onSaveClick={handleManualSave}
        hasAcademicSection={Boolean(onOpenAcademicSubjects)}
      />

      {/* 2. Temporizador Pomodoro */}
      <PomodoroSection
        workMinutes={workMinutes}
        breakMinutes={breakMinutes}
        onUpdateWorkMinutes={handleWorkMinutesChange}
        onUpdateBreakMinutes={handleBreakMinutesChange}
      />

      {/* 3. Notificações e Sons */}
      <NotificationsSection
        isSoundEnabled={isSoundEnabled}
        onToggleSound={onToggleSound}
        catPurrType={catPurrType}
        catPurrVolume={catPurrVolume}
        onSelectPurr={handleSelectPurr}
        onVolumeChange={handleVolumeChange}
      />

      {/* 4. Aparência da Interface */}
      <AppearanceSection isDark={isDark} onToggleTheme={onToggleTheme} />

      {/* 5. Gerenciamento de Dados & Backup */}
      <DataBackupSection onExport={onExport} onImport={onImport} onReset={onReset} />

      {/* 6. Disciplinas & Matérias Acadêmicas (se habilitado) */}
      {onOpenAcademicSubjects && (
        <AcademicSection onOpenAcademicSubjects={onOpenAcademicSubjects} />
      )}

      {/* 7. Atalhos de Teclado */}
      <ShortcutsSection onOpenShortcuts={onOpenShortcuts} />
    </div>
  )
}
