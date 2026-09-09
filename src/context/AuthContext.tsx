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
  signUpWithPassword: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>
  continueAsGuest: () => void
  isGuestAcknowledged: boolean
  isAuthModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const isConfigured = isSupabaseConfigured()
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined' && !isConfigured) {
      try {
        const savedUser = localStorage.getItem('organocat_local_user')
        if (savedUser) return JSON.parse(savedUser)
      } catch {
        // ignore
      }
    }
    return null
  })

  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window !== 'undefined' && !isConfigured) {
      try {
        const savedSession = localStorage.getItem('organocat_local_session')
        if (savedSession) return JSON.parse(savedSession)
      } catch {
        // ignore
      }
    }
    return null
  })

  const [loading, setLoading] = useState<boolean>(() => isConfigured)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)

  const [isGuestAcknowledged, setIsGuestAcknowledged] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('organocat_guest_acknowledged') === 'true'
  })

  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
  }, [])

  const continueAsGuest = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('organocat_guest_acknowledged', 'true')
    }
    setIsGuestAcknowledged(true)
    setIsAuthModalOpen(false)
  }, [])

  useEffect(() => {
    let isMounted = true

    if (!isConfigured) {
      return
    }

    // Obter sessão inicial do Supabase
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!isMounted) return
        if (error) {
          console.error('Erro ao recuperar sessão inicial:', error.message)
        }
        if (session) {
          setSession(session)
          setUser(session.user ?? null)
        } else if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('organocat_local_user')
          const savedSession = localStorage.getItem('organocat_local_session')
          if (savedUser && savedSession) {
            try {
              setUser(JSON.parse(savedUser))
              setSession(JSON.parse(savedSession))
            } catch {
              // ignore
            }
          }
        }
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

  const signUpWithPassword = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ error: Error | null }> => {
      if (isConfigured) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                name,
              },
            },
          })

          if (error) {
            return { error: new Error(error.message) }
          }

          if (data.session && data.user) {
            setSession(data.session)
            setUser(data.user)
            setIsGuestAcknowledged(true)
            if (typeof window !== 'undefined') {
              localStorage.setItem('organocat_guest_acknowledged', 'true')
            }
            setIsAuthModalOpen(false)
            return { error: null }
          }

          // Se retornou usuário sem sessão imediata (ou confirmação de e-mail pendente),
          // salva sessão/usuário simulado com o Nome para personalização visual imediata
          if (data.user) {
            const immediateUser: User = {
              ...data.user,
              user_metadata: {
                ...data.user.user_metadata,
                full_name: name,
                name,
              },
            }
            const immediateSession: Session = {
              access_token: 'organocat-token-' + Date.now(),
              refresh_token: 'organocat-refresh-' + Date.now(),
              expires_in: 3600 * 24 * 30,
              token_type: 'bearer',
              user: immediateUser,
            }
            setUser(immediateUser)
            setSession(immediateSession)
            if (typeof window !== 'undefined') {
              localStorage.setItem('organocat_local_user', JSON.stringify(immediateUser))
              localStorage.setItem(
                'organocat_local_session',
                JSON.stringify(immediateSession)
              )
              localStorage.setItem('organocat_guest_acknowledged', 'true')
            }
            setIsGuestAcknowledged(true)
            setIsAuthModalOpen(false)
            return { error: null }
          }

          return { error: null }
        } catch (err) {
          return { error: err instanceof Error ? err : new Error(String(err)) }
        }
      }

      // Autenticação local simulada para qualquer ambiente (offline / sem Supabase)
      try {
        const localUser: User = {
          id: 'local-user-' + Date.now(),
          app_metadata: { provider: 'local' },
          user_metadata: {
            full_name: name,
            name,
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email,
          phone: '',
          role: 'authenticated',
          updated_at: new Date().toISOString(),
        }
        const localSession: Session = {
          access_token: 'organocat-local-session-' + Date.now(),
          refresh_token: 'organocat-local-refresh-' + Date.now(),
          expires_in: 3600 * 24 * 365,
          token_type: 'bearer',
          user: localUser,
        }

        setUser(localUser)
        setSession(localSession)
        setIsGuestAcknowledged(true)

        if (typeof window !== 'undefined') {
          localStorage.setItem('organocat_local_user', JSON.stringify(localUser))
          localStorage.setItem('organocat_local_session', JSON.stringify(localSession))
          localStorage.setItem('organocat_guest_acknowledged', 'true')
        }

        setIsAuthModalOpen(false)
        return { error: null }
      } catch (err) {
        return { error: err instanceof Error ? err : new Error(String(err)) }
      }
    },
    [isConfigured]
  )

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<{ error: Error | null }> => {
      if (isConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            return { error: new Error(error.message) }
          }

          if (data.session && data.user) {
            setSession(data.session)
            setUser(data.user)
            setIsGuestAcknowledged(true)
            if (typeof window !== 'undefined') {
              localStorage.setItem('organocat_guest_acknowledged', 'true')
            }
            setIsAuthModalOpen(false)
          }
          return { error: null }
        } catch (err) {
          return { error: err instanceof Error ? err : new Error(String(err)) }
        }
      }

      // Autenticação local simulada
      try {
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('organocat_local_user')
          if (savedUser) {
            const parsed = JSON.parse(savedUser) as User
            if (parsed.email?.toLowerCase() === email.toLowerCase()) {
              const localSession: Session = {
                access_token: 'organocat-local-session-' + Date.now(),
                refresh_token: 'organocat-local-refresh-' + Date.now(),
                expires_in: 3600 * 24 * 365,
                token_type: 'bearer',
                user: parsed,
              }
              setUser(parsed)
              setSession(localSession)
              localStorage.setItem(
                'organocat_local_session',
                JSON.stringify(localSession)
              )
              localStorage.setItem('organocat_guest_acknowledged', 'true')
              setIsGuestAcknowledged(true)
              setIsAuthModalOpen(false)
              return { error: null }
            }
          }
        }

        const localName = email.split('@')[0]
        const fallbackUser: User = {
          id: 'local-user-' + Date.now(),
          app_metadata: { provider: 'local' },
          user_metadata: {
            full_name: localName,
            name: localName,
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email,
          phone: '',
          role: 'authenticated',
          updated_at: new Date().toISOString(),
        }
        const fallbackSession: Session = {
          access_token: 'organocat-local-session-' + Date.now(),
          refresh_token: 'organocat-local-refresh-' + Date.now(),
          expires_in: 3600 * 24 * 365,
          token_type: 'bearer',
          user: fallbackUser,
        }

        setUser(fallbackUser)
        setSession(fallbackSession)
        setIsGuestAcknowledged(true)
        if (typeof window !== 'undefined') {
          localStorage.setItem('organocat_local_user', JSON.stringify(fallbackUser))
          localStorage.setItem('organocat_local_session', JSON.stringify(fallbackSession))
          localStorage.setItem('organocat_guest_acknowledged', 'true')
        }
        setIsAuthModalOpen(false)
        return { error: null }
      } catch (err) {
        return { error: err instanceof Error ? err : new Error(String(err)) }
      }
    },
    [isConfigured]
  )

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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('organocat_local_user')
      localStorage.removeItem('organocat_local_session')
    }

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
      signUpWithPassword,
      signInWithPassword,
      continueAsGuest,
      isGuestAcknowledged,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
    }),
    [
      user,
      session,
      loading,
      isConfigured,
      signInWithGoogle,
      signOut,
      signUpWithPassword,
      signInWithPassword,
      continueAsGuest,
      isGuestAcknowledged,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
