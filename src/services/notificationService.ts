/**
 * Serviço de notificações do navegador para o DailyFlow Pomodoro.
 * Lida com permissões, checagens de compatibilidade e disparo de alertas visuais no SO.
 */

export class NotificationService {
  /**
   * Verifica se a Notification API é suportada pelo ambiente atual.
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && typeof window.Notification !== 'undefined'
  }

  /**
   * Obtém o status atual de permissão de notificações.
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied'
    return Notification.permission
  }

  /**
   * Solicita permissão ao usuário para emitir notificações no navegador.
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied'

    try {
      const permission = await Notification.requestPermission()
      return permission
    } catch {
      // Fallback para navegadores que utilizavam callback na API antiga
      return new Promise((resolve) => {
        try {
          Notification.requestPermission((status) => {
            resolve(status)
          })
        } catch {
          resolve('denied')
        }
      })
    }
  }

  /**
   * Emite uma notificação nativa caso haja permissão concedida.
   */
  notify(title: string, options?: NotificationOptions): Notification | null {
    if (!this.isSupported() || this.getPermission() !== 'granted') {
      return null
    }

    try {
      const defaultOptions: NotificationOptions = {
        icon: '/vite.svg',
        badge: '/vite.svg',
        silent: true, // Áudio já é sintetizado harmonicamente pelo soundService
        ...options,
      }

      return new Notification(title, defaultOptions)
    } catch {
      // Silencia falhas caso o sistema operacional ou browser rejeite a notificação
      return null
    }
  }
}

export const notificationService = new NotificationService()
export const isSupported = () => notificationService.isSupported()
export const getPermission = () => notificationService.getPermission()
export const requestPermission = () => notificationService.requestPermission()
export const notify = (title: string, options?: NotificationOptions) =>
  notificationService.notify(title, options)
