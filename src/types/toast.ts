export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: ToastAction
}

export interface ShowToastOptions {
  duration?: number
  action?: ToastAction
}

export interface ToastContextType {
  toasts: ToastItem[]
  showToast: (message: string, type?: ToastType, options?: ShowToastOptions) => string
  success: (message: string, options?: ShowToastOptions) => string
  error: (message: string, options?: ShowToastOptions) => string
  info: (message: string, options?: ShowToastOptions) => string
  warning: (message: string, options?: ShowToastOptions) => string
  dismissToast: (id: string) => void
}
