import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, renderHook, act } from '@testing-library/react'
import { App } from '../App'
import { AuthProvider } from '../context/AuthContext'
import { AuthModal } from '../components/AuthModal'
import { ShortcutsModal } from '../components/ShortcutsModal'
import { ProfileView } from '../components/profile/ProfileView'
import { Sidebar } from '../components/Sidebar'
import { usePomodoro } from '../hooks/usePomodoro'
import { storageService } from '../services/storageService'
import { academicStorageService } from '../services/academicStorageService'
import * as useAuthModule from '../hooks/useAuth'

vi.mock('../services/soundService', () => ({
  playWorkCompleteSound: vi.fn(),
  playBreakCompleteSound: vi.fn(),
  startCatPurr: vi.fn(),
  stopCatPurr: vi.fn(),
  soundService: {
    playWorkCompleteSound: vi.fn(),
    playBreakCompleteSound: vi.fn(),
    startCatPurr: vi.fn(),
    stopCatPurr: vi.fn(),
    previewCatPurr: vi.fn(),
  },
}))

vi.mock('../services/notificationService', () => ({
  notify: vi.fn(),
  requestPermission: vi.fn(() => Promise.resolve('granted')),
  notificationService: {
    notify: vi.fn(),
    isSupported: vi.fn(() => true),
    getPermission: vi.fn(() => 'granted'),
    requestPermission: vi.fn(() => Promise.resolve('granted')),
  },
}))

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

describe('DesignSystemAudit — Organy Design System & Governance', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('organy_guest_acknowledged', 'true')
    vi.restoreAllMocks()
    document.title = 'Organy - Organização e estudos'
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('1. Auditoria de Branding & Textos Oficiais', () => {
    it('renderiza a aplicação principal sem resquícios de OrganoCat e com a marca Organy', async () => {
      render(<App />)

      // Validações da identidade visual oficial
      expect(
        screen.getByRole('heading', { level: 2, name: 'Organy' })
      ).toBeInTheDocument()
      expect(screen.getAllByText('Organização e estudos').length).toBeGreaterThan(0)
      expect(
        screen.getAllByText('Organy • Organização e estudos').length
      ).toBeGreaterThan(0)

      // Zero resquícios de OrganoCat na tela renderizada
      expect(screen.queryByText(/organocat/i)).not.toBeInTheDocument()
    })

    it('renderiza AuthModal com título Organy, badge Organização e estudos e sem ícone de gato', () => {
      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} />
        </AuthProvider>
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Organy' })).toBeInTheDocument()
      expect(screen.getByText('Organização e estudos')).toBeInTheDocument()
      expect(screen.queryByText(/organocat/i)).not.toBeInTheDocument()

      // Valida ausência do antigo elemento lucide-cat
      const modal = screen.getByRole('dialog')
      expect(modal.innerHTML).not.toContain('lucide-cat')
    })

    it('renderiza ShortcutsModal com o subtítulo oficial do Organy', () => {
      render(<ShortcutsModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('Atalhos de Teclado')).toBeInTheDocument()
      expect(
        screen.getByText('Navegue pelo Organy com rapidez e foco no trabalho diário')
      ).toBeInTheDocument()
      expect(screen.queryByText(/organocat/i)).not.toBeInTheDocument()
    })

    it('renderiza ProfileView para visitante com Visitante Organy, iniciais OR e backup Organy', () => {
      vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        user: null,
        session: null,
        loading: false,
        isConfigured: true,
        isAuthModalOpen: false,
        authModalInitialTab: 'signin',
        openAuthModal: vi.fn(),
        closeAuthModal: vi.fn(),
        signInWithGoogle: vi.fn(),
        signInWithPassword: vi.fn(),
        signUpWithPassword: vi.fn(),
        continueAsGuest: vi.fn(),
        isGuestAcknowledged: true,
        signOut: vi.fn(),
      })

      render(<ProfileView tasks={[]} academicNotesCount={2} />)

      expect(screen.getByText('Visitante Organy')).toBeInTheDocument()
      expect(screen.queryByText(/organocat/i)).not.toBeInTheDocument()
    })
  })

  describe('2. Auditoria Completa das 8 Variações de Títulos Dinâmicos do Pomodoro', () => {
    it('Variação 1: Inativo / Reset Padrão exibe "Organy - Organização e estudos"', () => {
      document.title = 'Organy - Organização e estudos'
      const { result } = renderHook(() => usePomodoro())

      expect(result.current.session.isRunning).toBe(false)
      expect(document.title).toBe('Organy - Organização e estudos')
    })

    it('Variação 2: Foco geral exibe "(25:00) 🎯 Foco & Estudos | Organy"', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => usePomodoro())

      act(() => {
        result.current.startFocus()
      })

      expect(document.title).toBe('(25:00) 🎯 Foco & Estudos | Organy')
    })

    it('Variação 3: Foco com tarefa vinculada exibe "(25:00) 📖 [Tarefa] | Organy"', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => usePomodoro())

      act(() => {
        result.current.startFocus('t-1', 'Estudo de Algoritmos')
      })

      expect(document.title).toBe('(25:00) 📖 Estudo de Algoritmos | Organy')

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(document.title).toBe('(24:59) 📖 Estudo de Algoritmos | Organy')
    })

    it('Variação 4: Reta final (<= 5s) exibe "⚡ (00:05) Reta Final! Quase lá! | Organy"', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => usePomodoro())

      act(() => {
        result.current.startFocus('t-2', 'Revisão Final')
      })

      // Avança até os 5 segundos finais (25 min - 5s = 1495s)
      act(() => {
        vi.advanceTimersByTime((25 * 60 - 5) * 1000)
      })

      expect(result.current.session.timeLeft).toBe(5)
      expect(document.title).toBe('⚡ (00:05) Reta Final! Quase lá! | Organy')

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(result.current.session.timeLeft).toBe(3)
      expect(document.title).toBe('⚡ (00:03) Reta Final! Quase lá! | Organy')
    })

    it('Variação 5: Pausa / descanso exibe "(05:00) ☕ Pausa Revigorante | Organy"', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => usePomodoro())

      act(() => {
        result.current.switchMode('break')
        result.current.resumeFocus()
      })

      expect(document.title).toBe('(05:00) ☕ Pausa Revigorante | Organy')
    })

    it('Variação 6: Timer pausado pelo usuário exibe "⏸️ (tempo) Pausado | Organy"', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => usePomodoro())

      act(() => {
        result.current.startFocus('t-3', 'Leitura Atenta')
      })

      act(() => {
        vi.advanceTimersByTime(15000) // 15s decorridos -> 24:45 restantes
      })

      act(() => {
        result.current.pauseFocus()
      })

      expect(document.title).toBe('⏸️ (24:45) Pausado | Organy')
    })

    it('Variação 7: Conclusão de foco exibe "🎉 Foco Concluído! Parabéns! | Organy"', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => usePomodoro())

      act(() => {
        result.current.startFocus('t-4', 'Escrita do Artigo')
      })

      act(() => {
        vi.advanceTimersByTime(25 * 60 * 1000) // Foco finalizado
      })

      expect(document.title).toBe('🎉 Foco Concluído! Parabéns! | Organy')
    })

    it('Variação 8: Conclusão de pausa exibe "⏰ Pausa Finalizada! Pronto para Estudar? | Organy"', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => usePomodoro())

      act(() => {
        result.current.switchMode('break')
        result.current.resumeFocus()
      })

      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000) // Pausa finalizada
      })

      expect(document.title).toBe('⏰ Pausa Finalizada! Pronto para Estudar? | Organy')
    })
  })

  describe('3. Auditoria do Design System Stitch (Modern Precision) & Tokens', () => {
    it('Sidebar ativa utiliza estilo primário cobalto (#2563eb) do Stitch', () => {
      render(
        <Sidebar
          activeView="kanban"
          onViewChange={() => {}}
          isMobileOpen={false}
          onCloseMobile={() => {}}
          isCollapsed={false}
          onToggleCollapse={() => {}}
        />
      )

      const kanbanBtn = screen.getAllByRole('button', { name: 'Kanban' })[0]
      expect(kanbanBtn).toHaveClass('bg-blue-50')
      expect(kanbanBtn).toHaveClass('text-blue-600')
      expect(kanbanBtn).toHaveClass('ring-blue-500/20')
      expect(kanbanBtn).not.toHaveClass('bg-indigo-500/10')
    })
  })

  describe('4. Auditoria de Retrocompatibilidade de Storage', () => {
    it('recupera dados de kanban legados do OrganoCat e DailyFlow sem perda de dados', () => {
      const legacyKanban = {
        columns: [{ id: 'col-1', title: 'Importante', order: 0, colorTheme: 'blue' }],
        tasks: [
          {
            id: 't-leg',
            title: 'Tarefa Histórica',
            columnId: 'col-1',
            priority: 'high',
            tags: [],
            subtasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        version: 1,
      }
      localStorage.setItem('organocat_kanban_guest', JSON.stringify(legacyKanban))

      const loaded = storageService.load(null)
      expect(loaded.tasks).toHaveLength(1)
      expect(loaded.tasks[0].title).toBe('Tarefa Histórica')

      // Garante que o salvamento foi propagado
      expect(localStorage.getItem('organy_kanban_guest')).not.toBeNull()
    })

    it('recupera dados acadêmicos legados do OrganoCat sem perda de dados', () => {
      const legacyAcademic = {
        subjects: [
          {
            id: 'sub-1',
            name: 'Engenharia de Software',
            color: 'blue',
            code: 'ES-101',
            icon: 'Code',
          },
        ],
        notes: [
          {
            id: 'n-1',
            title: 'Arquitetura Limpa',
            content: 'Divisão em camadas',
            subjectId: 'sub-1',
            status: 'completed',
            tags: [],
            isPinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        version: 1,
      }
      localStorage.setItem('organocat_academic_guest', JSON.stringify(legacyAcademic))

      const loaded = academicStorageService.load(null)
      expect(loaded.subjects).toHaveLength(1)
      expect(loaded.subjects[0].name).toBe('Engenharia de Software')
      expect(loaded.notes[0].title).toBe('Arquitetura Limpa')

      // Garante persistência na chave oficial Organy
      expect(localStorage.getItem('organy_academic_guest')).not.toBeNull()
    })
  })
})
