/* eslint-disable react/only-export-components */
import React, { createContext, useEffect, useState, useMemo, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const isConfigured = isSupabaseConfigured()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(() => isConfigured)

  useEffect(() => {
    let isMounted = true

    if (!isConfigured) {
      return
    }

    // Obter sessão inicial
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!isMounted) return
        if (error) {
          console.error('Erro ao recuperar sessão inicial:', error.message)
        }
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('Erro ao recuperar sessão Supabase:', err)
        setLoading(false)
      })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [isConfigured])

  const signInWithGoogle = useCallback(async (): Promise<{ error: Error | null }> => {
    if (!isConfigured) {
      const err = new Error(
        'Supabase não configurado. Defina as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
      )
      return { error: err }
    }

    try {
      const redirectTo =
        typeof window !== 'undefined' ? window.location.origin : undefined
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      })
      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  }, [isConfigured])

  const signOut = useCallback(async (): Promise<{ error: Error | null }> => {
    if (!isConfigured) {
      setUser(null)
      setSession(null)
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        setUser(null)
        setSession(null)
      }
      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  }, [isConfigured])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      loading,
      isConfigured,
      signInWithGoogle,
      signOut,
    }),
    [user, session, loading, isConfigured, signInWithGoogle, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
