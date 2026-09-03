import React from 'react'
import { Toast } from './Toast'
import { useToast } from '../hooks/useToast'
import type { ToastItem } from '../types/toast'

export interface ToastContainerProps {
  toasts?: ToastItem[]
  onDismiss?: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts: propToasts,
  onDismiss: propOnDismiss,
}) => {
  const { toasts: contextToasts, dismissToast: contextDismiss } = useToast()

  const toasts = propToasts ?? contextToasts
  const onDismiss = propOnDismiss ?? contextDismiss

  if (!toasts || toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
      aria-label="Notificações"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
