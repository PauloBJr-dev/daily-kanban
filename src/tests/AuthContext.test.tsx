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
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
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
  })

  it('retorna erro em signInWithGoogle quando supabase não está configurado', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    const res = await act(async () => {
      return await result.current.signInWithGoogle()
    })

    expect(res.error).toBeInstanceOf(Error)
    expect(res.error?.message).toContain('Supabase não configurado')
  })

  it('limpa o estado do usuário ao fazer signOut quando não configurado', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    const res = await act(async () => {
      return await result.current.signOut()
    })

    expect(res.error).toBeNull()
    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })

  it('carrega sessão inicial e escuta mudanças de autenticação quando configurado', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-app.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'valid-anon-key-secret')

    let authChangeCallback: ((event: string, session: Session | null) => void) | null =
      null

    vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    })

    vi.spyOn(supabase.auth, 'onAuthStateChange').mockImplementation(((callback: any) => {
      authChangeCallback = callback
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      }
    }) as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.session).toEqual(mockSession)
    expect(result.current.isConfigured).toBe(true)

    // Simula logout disparado pelo listener onAuthStateChange
    act(() => {
      if (authChangeCallback) {
        authChangeCallback('SIGNED_OUT', null)
      }
    })

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })

  it('executa signInWithGoogle com redirecionamento correto e trata sucesso', async () => {
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

    const signInSpy = vi.spyOn(supabase.auth, 'signInWithOAuth').mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://oauth.google.com' },
      error: null,
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const res = await act(async () => {
      return await result.current.signInWithGoogle()
    })

    expect(signInSpy).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    expect(res.error).toBeNull()
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
