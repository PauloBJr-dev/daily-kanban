import { supabase } from '../lib/supabase'

export interface ActivePomodoroSession {
  taskId: string | null
  taskTitle?: string | null
  mode: 'work' | 'short_break' | 'long_break' | 'break'
  startedAt: string | null // ISO date string
  durationSeconds: number
  isRunning: boolean
  pausedTimeLeft?: number | null
}

export interface PomodoroSessionRecord {
  id: string
  userId?: string
  taskId?: string | null
  mode: 'work' | 'short_break' | 'long_break' | 'break'
  durationMinutes: number
  completedAt: string
  createdAt?: string
}

export async function saveActiveSession(
  userId: string,
  session: ActivePomodoroSession | null
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      active_pomodoro_session: session,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Erro ao salvar sessão pomodoro ativa no Supabase:', error)
    throw error
  }
}

export async function fetchActiveSession(
  userId: string
): Promise<ActivePomodoroSession | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('active_pomodoro_session')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Erro ao buscar sessão pomodoro ativa no Supabase:', error)
    throw error
  }

  if (!data || !data.active_pomodoro_session) {
    return null
  }

  return data.active_pomodoro_session as ActivePomodoroSession
}

export async function clearActiveSession(userId: string): Promise<void> {
  await saveActiveSession(userId, null)
}

export async function logCompletedSession(
  userId: string,
  record: Omit<PomodoroSessionRecord, 'id' | 'createdAt'>
): Promise<PomodoroSessionRecord> {
  const id = `pomo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const now = new Date().toISOString()
  const row = {
    id,
    user_id: userId,
    task_id: record.taskId ?? null,
    mode: record.mode,
    duration_minutes: record.durationMinutes,
    completed_at: record.completedAt || now,
    created_at: now,
  }

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert(row)
    .select()
    .single()

  if (error) {
    console.error('Erro ao registrar sessão pomodoro concluída no Supabase:', error)
    throw error
  }

  return {
    id: data?.id || id,
    userId: data?.user_id || userId,
    taskId: data?.task_id ?? null,
    mode: data?.mode || record.mode,
    durationMinutes: data?.duration_minutes ?? record.durationMinutes,
    completedAt: data?.completed_at || row.completed_at,
    createdAt: data?.created_at || now,
  }
}

export async function fetchCompletedSessions(
  userId: string
): Promise<PomodoroSessionRecord[]> {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar histórico de sessões pomodoro no Supabase:', error)
    throw error
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    taskId: row.task_id ?? null,
    mode: row.mode as 'work' | 'break',
    durationMinutes: row.duration_minutes,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  }))
}

export const pomodoroSessionService = {
  saveActiveSession,
  fetchActiveSession,
  clearActiveSession,
  logCompletedSession,
  fetchCompletedSessions,
}
