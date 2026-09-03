import React, { useState, useCallback, useMemo } from 'react'
import { ToastContext } from '../context/ToastContext'
import type { ToastItem, ToastType, ShowToastOptions } from '../types/toast'

export interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', options?: ShowToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const newToast: ToastItem = {
        id,
        message,
        type,
        duration: options?.duration ?? 3500,
        action: options?.action,
      }

      setToasts((prev) => [...prev, newToast])
      return id
    },
    []
  )

  const success = useCallback(
    (message: string, options?: ShowToastOptions) =>
      showToast(message, 'success', options),
    [showToast]
  )

  const error = useCallback(
    (message: string, options?: ShowToastOptions) => showToast(message, 'error', options),
    [showToast]
  )

  const info = useCallback(
    (message: string, options?: ShowToastOptions) => showToast(message, 'info', options),
    [showToast]
  )

  const warning = useCallback(
    (message: string, options?: ShowToastOptions) =>
      showToast(message, 'warning', options),
    [showToast]
  )

  const contextValue = useMemo(
    () => ({
      toasts,
      showToast,
      success,
      error,
      info,
      warning,
      dismissToast,
    }),
    [toasts, showToast, success, error, info, warning, dismissToast]
  )

  return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>
}
