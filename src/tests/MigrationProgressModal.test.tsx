import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MigrationProgressModal } from '../components/auth/MigrationProgressModal'
import { migrationService } from '../services/migrationService'

describe('MigrationProgressModal Component', () => {
  const mockOnComplete = vi.fn()
  const mockOnSkip = vi.fn()

  beforeEach(() => {
    vi.restoreAllMocks()
    mockOnComplete.mockClear()
    mockOnSkip.mockClear()
  })

  it('não renderiza nada quando isOpen for false', () => {
    render(
      <MigrationProgressModal
        isOpen={false}
        userId="user-123"
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza os 6 itens do checklist e executa a migração com sucesso', async () => {
    vi.spyOn(migrationService, 'executeMigration').mockImplementation(
      async (_userId, onStepChange) => {
        onStepChange?.([
          {
            id: 'backup',
            title: 'Cópia de Segurança Local',
            description: '',
            status: 'completed',
          },
          {
            id: 'kanban_local',
            title: 'Migração do Kanban',
            description: '',
            status: 'completed',
          },
          {
            id: 'kanban_cloud',
            title: 'Sincronização do Quadro na Nuvem',
            description: '',
            status: 'completed',
          },
          {
            id: 'academic_local',
            title: 'Migração Acadêmica',
            description: '',
            status: 'completed',
          },
          {
            id: 'academic_cloud',
            title: 'Sincronização Acadêmica na Nuvem',
            description: '',
            status: 'completed',
          },
          {
            id: 'validation',
            title: 'Validação de Integridade',
            description: '',
            status: 'completed',
          },
        ])
        return { success: true }
      }
    )

    render(
      <MigrationProgressModal
        isOpen={true}
        userId="user-123"
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /sincronizando seus dados/i })
    ).toBeInTheDocument()

    // 6 passos presentes
    expect(screen.getByText('Cópia de Segurança Local')).toBeInTheDocument()
    expect(screen.getByText('Migração do Kanban')).toBeInTheDocument()
    expect(screen.getByText('Sincronização do Quadro na Nuvem')).toBeInTheDocument()
    expect(screen.getByText('Migração Acadêmica')).toBeInTheDocument()
    expect(screen.getByText('Sincronização Acadêmica na Nuvem')).toBeInTheDocument()
    expect(screen.getByText('Validação de Integridade')).toBeInTheDocument()

    // Mensagem de sucesso
    expect(
      await screen.findByText(
        /todos os dados foram preservados e sincronizados com sucesso!/i
      )
    ).toBeInTheDocument()

    // Redireciona chamando onComplete
    await waitFor(
      () => {
        expect(mockOnComplete).toHaveBeenCalled()
      },
      { timeout: 2500 }
    )
  })

  it('exibe mensagem amigável e opções de contingência caso ocorra erro na sincronização', async () => {
    vi.spyOn(migrationService, 'executeMigration').mockResolvedValue({
      success: false,
      error:
        'Houve uma instabilidade na conexão ao sincronizar suas anotações. Seus dados continuam salvos com segurança neste navegador.',
      failedStepId: 'academic_cloud',
    })
    const downloadBackupSpy = vi
      .spyOn(migrationService, 'downloadBackup')
      .mockImplementation(() => {})

    render(
      <MigrationProgressModal
        isOpen={true}
        userId="user-fail"
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    )

    // Mensagem amigável de erro
    expect(
      await screen.findByText(
        /houve uma instabilidade na conexão ao sincronizar suas anotações/i
      )
    ).toBeInTheDocument()

    // Botões de contingência presentes
    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i })
    const backupBtn = screen.getByRole('button', { name: /baixar backup dos dados/i })
    const skipBtn = screen.getByRole('button', {
      name: /acessar modo local e sincronizar depois/i,
    })

    expect(retryBtn).toBeInTheDocument()
    expect(backupBtn).toBeInTheDocument()
    expect(skipBtn).toBeInTheDocument()

    // Clicar em Baixar Backup aciona download
    fireEvent.click(backupBtn)
    expect(downloadBackupSpy).toHaveBeenCalledTimes(1)

    // Clicar em Modo Local chama onSkip
    fireEvent.click(skipBtn)
    expect(mockOnSkip).toHaveBeenCalledTimes(1)
  })
})
