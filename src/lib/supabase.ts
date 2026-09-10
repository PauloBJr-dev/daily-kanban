import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const getEnvVar = (key: string): string => {
  const env = import.meta.env as Record<string, string | undefined>
  const val = env[key] ?? env[`\uFEFF${key}`]
  return (val || '').trim()
}

export const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
export const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')

export const isSupabaseConfigured = (): boolean => {
  const url = getEnvVar('VITE_SUPABASE_URL')
  const key = getEnvVar('VITE_SUPABASE_ANON_KEY')

  if (!url || !key) return false
  if (
    url === 'https://placeholder.supabase.co' ||
    key === 'placeholder-anon-key' ||
    url === 'your-supabase-url' ||
    key === 'your-supabase-anon-key'
  ) {
    return false
  }

  return url.startsWith('https://') || url.startsWith('http://')
}

export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-anon-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )
