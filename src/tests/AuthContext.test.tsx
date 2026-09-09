import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { AuthProvider } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

const mockUser: User = {
  id: 'user-123',
  app_metadata: {},
  user_metadata: {
    full_name: 'Ana Silva',
    name: 'Ana Silva',
    avatar_url: 'https://lh3.googleusercontent.com/a/avatar.jpg',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'ana.silva@example.com',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
}

const mockSession: Session = {
  access_token: 'fake-access-token',
  refresh_token: 'fake-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
}

describe('AuthContext & useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('helper isSupabaseConfigured retorna false quando variáveis não estão definidas', () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    expect(isSupabaseConfigured()).toBe(false)
  })

  it('helper isSupabaseConfigured retorna true quando URL e Anon Key são válidas', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-app.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'valid-anon-key-secret')
    expect(isSupabaseConfigured()).toBe(true)
  })

  it('lança erro ao utilizar useAuth fora de AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth deve ser utilizado dentro de um AuthProvider'
    )
    consoleError.mockRestore()
  })

  it('renderiza os filhos com estado inicial desautenticado quando não configurado', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.isConfigured).toBe(false)
    expect(result.current.isGuestAcknowledged).toBe(false)
    expect(result.current.isAuthModalOpen).toBe(false)
  })

  it('controla abertura e fechamento do AuthModal via openAuthModal e closeAuthModal', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    expect(result.current.isAuthModalOpen).toBe(false)

    act(() => {
      result.current.openAuthModal()
    })
    expect(result.current.isAuthModalOpen).toBe(true)

    act(() => {
      result.current.closeAuthModal()
    })
    expect(result.current.isAuthModalOpen).toBe(false)
  })

  it('continueAsGuest define flag no localStorage e atualiza estado', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    expect(result.current.isGuestAcknowledged).toBe(false)

    act(() => {
      result.current.continueAsGuest()
    })

    expect(result.current.isGuestAcknowledged).toBe(true)
    expect(localStorage.getItem('organocat_guest_acknowledged')).toBe('true')
  })

  it('executa signUpWithPassword no modo local simulado persistindo no localStorage', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    let res: { error: Error | null } = { error: null }
    await act(async () => {
      res = await result.current.signUpWithPassword(
        'Beatriz Costa',
        'beatriz@example.com',
        'minhasenha123'
      )
    })

    expect(res.error).toBeNull()
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.email).toBe('beatriz@example.com')
    expect(result.current.user?.user_metadata?.full_name).toBe('Beatriz Costa')
    expect(result.current.isGuestAcknowledged).toBe(true)
    expect(localStorage.getItem('organocat_local_user')).not.toBeNull()
    expect(localStorage.getItem('organocat_local_session')).not.toBeNull()
  })

  it('executa signInWithPassword no modo local simulado recuperando a conta criada', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    // Cadastra primeiro
    await act(async () => {
      await result.current.signUpWithPassword(
        'Diego Alves',
        'diego@example.com',
        'senhaSegura123'
      )
    })

    // Desloga
    await act(async () => {
      await result.current.signOut()
    })
    expect(result.current.user).toBeNull()

    // Faz login
    let res: { error: Error | null } = { error: null }
    await act(async () => {
      res = await result.current.signInWithPassword('diego@example.com', 'senhaSegura123')
    })

    expect(res.error).toBeNull()
    expect(result.current.user?.email).toBe('diego@example.com')
  })

  it('executa signUpWithPassword com Supabase configurado', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-app.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'valid-anon-key-secret')

    vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    vi.spyOn(supabase.auth, 'onAuthStateChange').mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    } as any)

    const signUpSpy = vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
      data: {
        user: mockUser,
        session: mockSession,
      },
      error: null,
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let res: { error: Error | null } = { error: null }
    await act(async () => {
      res = await result.current.signUpWithPassword(
        'Ana Silva',
        'ana.silva@example.com',
        'senha123456'
      )
    })

    expect(signUpSpy).toHaveBeenCalledWith({
      email: 'ana.silva@example.com',
      password: 'senha123456',
      options: {
        data: {
          full_name: 'Ana Silva',
          name: 'Ana Silva',
        },
      },
    })
    expect(res.error).toBeNull()
    expect(result.current.user).toEqual(mockUser)
  })

  it('executa signInWithPassword com Supabase configurado', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-app.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'valid-anon-key-secret')

    vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    vi.spyOn(supabase.auth, 'onAuthStateChange').mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    } as any)

    const signInSpy = vi
      .spyOn(supabase.auth, 'signInWithPassword')
      .mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      })

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let res: { error: Error | null } = { error: null }
    await act(async () => {
      res = await result.current.signInWithPassword(
        'ana.silva@example.com',
        'senha123456'
      )
    })

    expect(signInSpy).toHaveBeenCalledWith({
      email: 'ana.silva@example.com',
      password: 'senha123456',
    })
    expect(res.error).toBeNull()
    expect(result.current.user).toEqual(mockUser)
  })

  it('executa signOut e limpa sessão e usuário no estado', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-app.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'valid-anon-key-secret')

    vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    })

    vi.spyOn(supabase.auth, 'onAuthStateChange').mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    } as any)

    const signOutSpy = vi.spyOn(supabase.auth, 'signOut').mockResolvedValueOnce({
      error: null,
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    const res = await act(async () => {
      return await result.current.signOut()
    })

    expect(signOutSpy).toHaveBeenCalledTimes(1)
    expect(res.error).toBeNull()
    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })
})
