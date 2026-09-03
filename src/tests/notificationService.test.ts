import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  isSupported,
  getPermission,
  requestPermission,
  notify,
} from '../services/notificationService'

describe('notificationService', () => {
  const originalNotification = window.Notification

  afterEach(() => {
    window.Notification = originalNotification
    vi.restoreAllMocks()
  })

  it('detecta suporte corretamente quando Notification existe ou não', () => {
    expect(isSupported()).toBe(typeof window !== 'undefined' && 'Notification' in window)

    // @ts-expect-error Simula ausência
    window.Notification = undefined
    expect(isSupported()).toBe(false)
    expect(getPermission()).toBe('denied')
  })

  it('retorna a permissão atual quando suportada', () => {
    // @ts-expect-error Mock Notification
    window.Notification = {
      permission: 'granted',
      requestPermission: vi.fn(),
    }

    expect(getPermission()).toBe('granted')
  })

  it('solicita permissão via requestPermission', async () => {
    // @ts-expect-error Mock Notification
    window.Notification = {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    }

    const result = await requestPermission()
    expect(result).toBe('granted')
  })

  it('não dispara notificação se a permissão não for granted', () => {
    const MockNotification = vi.fn()
    // @ts-expect-error Mock Notification
    MockNotification.permission = 'denied'
    // @ts-expect-error Mock Notification
    window.Notification = MockNotification

    const instance = notify('Teste')
    expect(instance).toBeNull()
    expect(MockNotification).not.toHaveBeenCalled()
  })

  it('dispara notificação com título e opções quando permission for granted', () => {
    const MockNotification = vi.fn()
    // @ts-expect-error Mock Notification
    MockNotification.permission = 'granted'
    // @ts-expect-error Mock Notification
    window.Notification = MockNotification

    notify('Alerta', { body: 'Mensagem de teste' })

    expect(MockNotification).toHaveBeenCalledWith('Alerta', {
      body: 'Mensagem de teste',
      icon: '/vite.svg',
      badge: '/vite.svg',
      silent: true,
    })
  })
})
