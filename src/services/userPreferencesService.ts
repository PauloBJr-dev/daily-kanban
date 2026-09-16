import { supabase } from '../lib/supabase'

export interface UserPreferences {
  theme?: 'light' | 'dark'
  sidebarCollapsed?: boolean
  activeView?: 'kanban' | 'academic' | 'metrics' | 'settings' | 'profile'
  academicLayoutMode?: 'grid' | 'studio'
  academicViewMode?: 'grid' | 'list'
  pomodoro?: {
    workDurationMinutes?: number
    breakDurationMinutes?: number
    isSoundEnabled?: boolean
    catPurrType?: 'none' | 'soft' | 'deep' | 'rhythmic'
    catPurrVolume?: number
  }
}

export async function fetchUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Erro ao buscar preferências do usuário no Supabase:', error)
    throw error
  }

  if (!data || !data.preferences) {
    return null
  }

  return data.preferences as UserPreferences
}

export async function syncUserPreferences(
  userId: string,
  prefs: Partial<UserPreferences>
): Promise<void> {
  let current: UserPreferences = {}
  try {
    const existing = await fetchUserPreferences(userId)
    if (existing) {
      current = existing
    }
  } catch {
    current = getLocalPreferences()
  }

  const merged: UserPreferences = {
    ...current,
    ...prefs,
    pomodoro:
      current.pomodoro || prefs.pomodoro
        ? {
            ...(current.pomodoro || {}),
            ...(prefs.pomodoro || {}),
          }
        : undefined,
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      preferences: merged,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Erro ao sincronizar preferências no Supabase:', error)
    throw error
  }

  saveLocalPreferences(merged)
}

export function getLocalPreferences(): UserPreferences {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return {}
  }

  try {
    const theme = (localStorage.getItem('dailyflow_theme') ??
      localStorage.getItem('organy_theme')) as 'light' | 'dark' | null

    const sidebarRaw =
      localStorage.getItem('organy_sidebar_collapsed') ??
      localStorage.getItem('dailyflow_sidebar_collapsed') ??
      localStorage.getItem('organocat_sidebar_collapsed')
    const sidebarCollapsed = sidebarRaw !== null ? sidebarRaw === 'true' : undefined

    const activeView = localStorage.getItem('dailyflow_active_view') as
      UserPreferences['activeView'] | null

    const academicLayoutMode = localStorage.getItem('dailyflow_academic_layout_mode') as
      'grid' | 'studio' | null

    const academicViewMode = localStorage.getItem('dailyflow_academic_view_mode') as
      'grid' | 'list' | null

    let pomodoro: UserPreferences['pomodoro'] = undefined
    const pomodoroRaw = localStorage.getItem('dailyflow_pomodoro_settings')
    if (pomodoroRaw) {
      try {
        const parsed = JSON.parse(pomodoroRaw)
        pomodoro = {
          workDurationMinutes:
            typeof parsed.workDuration === 'number'
              ? Math.round(parsed.workDuration / 60)
              : typeof parsed.workDurationMinutes === 'number'
                ? parsed.workDurationMinutes
                : undefined,
          breakDurationMinutes:
            typeof parsed.breakDuration === 'number'
              ? Math.round(parsed.breakDuration / 60)
              : typeof parsed.breakDurationMinutes === 'number'
                ? parsed.breakDurationMinutes
                : undefined,
          isSoundEnabled:
            typeof parsed.isSoundEnabled === 'boolean'
              ? parsed.isSoundEnabled
              : undefined,
          catPurrType: parsed.catPurrType,
          catPurrVolume:
            typeof parsed.catPurrVolume === 'number' ? parsed.catPurrVolume : undefined,
        }
      } catch {
        // Ignora erro de JSON corrompido
      }
    }

    return {
      ...(theme ? { theme } : {}),
      ...(sidebarCollapsed !== undefined ? { sidebarCollapsed } : {}),
      ...(activeView ? { activeView } : {}),
      ...(academicLayoutMode ? { academicLayoutMode } : {}),
      ...(academicViewMode ? { academicViewMode } : {}),
      ...(pomodoro ? { pomodoro } : {}),
    }
  } catch {
    return {}
  }
}

export function saveLocalPreferences(prefs: Partial<UserPreferences>): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  try {
    if (prefs.theme) {
      localStorage.setItem('dailyflow_theme', prefs.theme)
      localStorage.setItem('organy_theme', prefs.theme)
      if (prefs.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    if (prefs.sidebarCollapsed !== undefined) {
      localStorage.setItem('organy_sidebar_collapsed', String(prefs.sidebarCollapsed))
      localStorage.setItem('dailyflow_sidebar_collapsed', String(prefs.sidebarCollapsed))
    }

    if (prefs.activeView) {
      localStorage.setItem('dailyflow_active_view', prefs.activeView)
    }

    if (prefs.academicLayoutMode) {
      localStorage.setItem('dailyflow_academic_layout_mode', prefs.academicLayoutMode)
    }

    if (prefs.academicViewMode) {
      localStorage.setItem('dailyflow_academic_view_mode', prefs.academicViewMode)
    }

    if (prefs.pomodoro) {
      const currentRaw = localStorage.getItem('dailyflow_pomodoro_settings')
      let currentParsed: any = {}
      if (currentRaw) {
        try {
          currentParsed = JSON.parse(currentRaw)
        } catch {
          // ignore
        }
      }

      const updatedPomodoro = {
        ...currentParsed,
        workDuration:
          prefs.pomodoro.workDurationMinutes !== undefined
            ? prefs.pomodoro.workDurationMinutes * 60
            : (currentParsed.workDuration ?? 25 * 60),
        breakDuration:
          prefs.pomodoro.breakDurationMinutes !== undefined
            ? prefs.pomodoro.breakDurationMinutes * 60
            : (currentParsed.breakDuration ?? 5 * 60),
        isSoundEnabled:
          prefs.pomodoro.isSoundEnabled !== undefined
            ? prefs.pomodoro.isSoundEnabled
            : (currentParsed.isSoundEnabled ?? true),
        catPurrType: prefs.pomodoro.catPurrType ?? currentParsed.catPurrType ?? 'none',
        catPurrVolume: prefs.pomodoro.catPurrVolume ?? currentParsed.catPurrVolume ?? 0.6,
      }

      localStorage.setItem('dailyflow_pomodoro_settings', JSON.stringify(updatedPomodoro))
    }
  } catch (err) {
    console.error('Erro ao salvar preferências no localStorage:', err)
  }
}

export const userPreferencesService = {
  fetchUserPreferences,
  syncUserPreferences,
  getLocalPreferences,
  saveLocalPreferences,
}
