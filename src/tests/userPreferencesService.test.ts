import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  fetchUserPreferences,
  syncUserPreferences,
  getLocalPreferences,
  saveLocalPreferences,
  userPreferencesService,
  type UserPreferences,
} from '../services/userPreferencesService'

describe('userPreferencesService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    document.documentElement.classList.remove('dark')
  })

  describe('fetchUserPreferences', () => {
    it('busca e retorna preferências do usuário do Supabase com sucesso', async () => {
      const mockPreferences: UserPreferences = {
        theme: 'dark',
        sidebarCollapsed: true,
        activeView: 'academic',
        academicLayoutMode: 'studio',
        academicViewMode: 'list',
        pomodoro: {
          workDurationMinutes: 50,
          breakDurationMinutes: 10,
          isSoundEnabled: false,
          catPurrType: 'deep',
          catPurrVolume: 0.8,
        },
      }

      const maybeSingleSpy = vi
        .fn()
        .mockResolvedValue({ data: { preferences: mockPreferences }, error: null })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              maybeSingle: maybeSingleSpy,
            }),
          } as any
        }
        return {} as any
      })

      const result = await fetchUserPreferences('user-123')

      expect(result).toEqual(mockPreferences)
      expect(maybeSingleSpy).toHaveBeenCalled()
    })

    it('retorna null se não houver preferências salvas para o perfil', async () => {
      const maybeSingleSpy = vi
        .fn()
        .mockResolvedValue({ data: { preferences: null }, error: null })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              maybeSingle: maybeSingleSpy,
            }),
          } as any
        }
        return {} as any
      })

      const result = await fetchUserPreferences('user-empty')
      expect(result).toBeNull()
    })

    it('retorna null se o perfil não for encontrado (data null)', async () => {
      const maybeSingleSpy = vi.fn().mockResolvedValue({ data: null, error: null })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              maybeSingle: maybeSingleSpy,
            }),
          } as any
        }
        return {} as any
      })

      const result = await fetchUserPreferences('user-not-found')
      expect(result).toBeNull()
    })

    it('lança erro quando a consulta ao Supabase falhar', async () => {
      const dbError = new Error('Falha de conexão')
      const maybeSingleSpy = vi.fn().mockResolvedValue({ data: null, error: dbError })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              maybeSingle: maybeSingleSpy,
            }),
          } as any
        }
        return {} as any
      })

      await expect(fetchUserPreferences('user-err')).rejects.toThrow('Falha de conexão')
    })
  })

  describe('syncUserPreferences', () => {
    it('mescla preferências existentes e atualiza o Supabase e localStorage', async () => {
      const existingPrefs: UserPreferences = {
        theme: 'light',
        sidebarCollapsed: false,
        pomodoro: {
          workDurationMinutes: 25,
          breakDurationMinutes: 5,
        },
      }

      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi
                .fn()
                .mockResolvedValue({ data: { preferences: existingPrefs }, error: null }),
            }),
            update: updateSpy,
          } as any
        }
        return {} as any
      })

      await syncUserPreferences('user-123', {
        theme: 'dark',
        pomodoro: {
          workDurationMinutes: 45,
        },
      })

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          preferences: {
            theme: 'dark',
            sidebarCollapsed: false,
            pomodoro: {
              workDurationMinutes: 45,
              breakDurationMinutes: 5,
            },
          },
        })
      )

      expect(localStorage.getItem('dailyflow_theme')).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('lança erro se a atualização do Supabase falhar', async () => {
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: new Error('Erro de RLS') }),
      })

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
            update: updateSpy,
          } as any
        }
        return {} as any
      })

      await expect(syncUserPreferences('user-123', { theme: 'dark' })).rejects.toThrow(
        'Erro de RLS'
      )
    })
  })

  describe('getLocalPreferences and saveLocalPreferences', () => {
    it('salva e recupera preferências completas do localStorage', () => {
      saveLocalPreferences({
        theme: 'dark',
        sidebarCollapsed: true,
        activeView: 'academic',
        academicLayoutMode: 'studio',
        academicViewMode: 'list',
        pomodoro: {
          workDurationMinutes: 30,
          breakDurationMinutes: 6,
          isSoundEnabled: false,
          catPurrType: 'rhythmic',
          catPurrVolume: 0.9,
        },
      })

      const loaded = getLocalPreferences()

      expect(loaded.theme).toBe('dark')
      expect(loaded.sidebarCollapsed).toBe(true)
      expect(loaded.activeView).toBe('academic')
      expect(loaded.academicLayoutMode).toBe('studio')
      expect(loaded.academicViewMode).toBe('list')
      expect(loaded.pomodoro).toEqual({
        workDurationMinutes: 30,
        breakDurationMinutes: 6,
        isSoundEnabled: false,
        catPurrType: 'rhythmic',
        catPurrVolume: 0.9,
      })
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('remove classe dark ao salvar tema light', () => {
      document.documentElement.classList.add('dark')
      saveLocalPreferences({ theme: 'light' })

      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(localStorage.getItem('dailyflow_theme')).toBe('light')
    })

    it('retorna objeto vazio quando localStorage estiver vazio', () => {
      const loaded = getLocalPreferences()
      expect(loaded).toEqual({})
    })

    it('exporta o objeto userPreferencesService com todos os métodos esperados', () => {
      expect(userPreferencesService.fetchUserPreferences).toBeDefined()
      expect(userPreferencesService.syncUserPreferences).toBeDefined()
      expect(userPreferencesService.getLocalPreferences).toBeDefined()
      expect(userPreferencesService.saveLocalPreferences).toBeDefined()
    })
  })
})
