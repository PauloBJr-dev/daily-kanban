import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = (): boolean => {
  const url = (import.meta.env.VITE_SUPABASE_URL || supabaseUrl || '').trim()
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseAnonKey || '').trim()

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
