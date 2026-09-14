import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StoragePrivacySection } from '../components/profile/StoragePrivacySection'

describe('StoragePrivacySection Component', () => {
  it('renderiza arquitetura de armazenamento seguro e aciona callbacks', () => {
    const onExportBackup = vi.fn()
    const onClearCache = vi.fn()

    render(
      <StoragePrivacySection
        userId="user-test-123"
        totalTasks={10}
        notesCount={4}
        isConfigured={true}
        onExportBackup={onExportBackup}
        onClearCache={onClearCache}
      />
    )

    expect(screen.getByText('Privacidade, Armazenamento & Segurança')).toBeInTheDocument()
    expect(screen.getByText('Armazenamento Local Seguro')).toBeInTheDocument()
    expect(screen.getByText('Sincronização em Nuvem Supabase')).toBeInTheDocument()
    expect(
      screen.getByText('Criptografia ponta a ponta e zero cookies de rastreamento')
    ).toBeInTheDocument()
    expect(screen.getByText('Status Supabase: Disponível')).toBeInTheDocument()

    // Valida que NÃO existe telemetria falsa (sem ms, sem ping)
    expect(screen.queryByText(/Latência de rede/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/32 ms/i)).not.toBeInTheDocument()

    // Teste dos botões de ação
    const exportBtn = screen.getByRole('button', { name: /Baixar Backup JSON/i })
    expect(exportBtn).toBeInTheDocument()
    fireEvent.click(exportBtn)
    expect(onExportBackup).toHaveBeenCalledTimes(1)

    const clearBtn = screen.getByRole('button', { name: /Limpar Cache Local/i })
    expect(clearBtn).toBeInTheDocument()
    fireEvent.click(clearBtn)
    expect(onClearCache).toHaveBeenCalledTimes(1)
  })

  it('exibe status offline quando Supabase não estiver configurado', () => {
    render(
      <StoragePrivacySection
        userId={null}
        totalTasks={0}
        notesCount={0}
        isConfigured={false}
        onExportBackup={vi.fn()}
        onClearCache={vi.fn()}
      />
    )

    expect(screen.getByText('Status Supabase: Modo Offline/Local')).toBeInTheDocument()
  })
})
