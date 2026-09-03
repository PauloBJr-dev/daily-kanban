import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import type { ToastItem, ToastType } from '../types/toast'

export interface ToastProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

const toastTypeStyles: Record<
  ToastType,
  {
    icon: React.ComponentType<{ className?: string }>
    iconClass: string
    iconBg: string
    progressBarClass: string
    borderClass: string
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    progressBarClass: 'bg-emerald-500 dark:bg-emerald-400',
    borderClass: 'border-emerald-200/70 dark:border-emerald-900/50',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    progressBarClass: 'bg-rose-500 dark:bg-rose-400',
    borderClass: 'border-rose-200/70 dark:border-rose-900/50',
  },
  warning: {
    icon: AlertCircle,
    iconClass: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    progressBarClass: 'bg-amber-500 dark:bg-amber-400',
    borderClass: 'border-amber-200/70 dark:border-amber-900/50',
  },
  info: {
    icon: Info,
    iconClass: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    progressBarClass: 'bg-indigo-500 dark:bg-indigo-400',
    borderClass: 'border-indigo-200/70 dark:border-indigo-900/50',
  },
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 3500
  const styleConfig = toastTypeStyles[toast.type] || toastTypeStyles.info
  const IconComponent = styleConfig.icon

  useEffect(() => {
    if (duration <= 0) return

    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, duration, onDismiss])

  const handleActionClick = () => {
    if (toast.action) {
      toast.action.onClick()
      onDismiss(toast.id)
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto relative flex items-center justify-between gap-3 w-full max-w-sm p-3.5 rounded-2xl bg-white dark:bg-slate-900 border ${styleConfig.borderClass} shadow-lg shadow-slate-900/5 dark:shadow-slate-950/40 text-slate-800 dark:text-slate-100 transition-all overflow-hidden animate-in slide-in-from-bottom-3 duration-200`}
    >
      {/* Icon & Message Container */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${styleConfig.iconBg} ${styleConfig.iconClass}`}
        >
          <IconComponent className="w-4 h-4" />
        </div>
        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug break-words">
          {toast.message}
        </p>
      </div>

      {/* Action and Close buttons */}
      <div className="flex items-center gap-1.5 shrink-0 pl-1">
        {toast.action && (
          <button
            type="button"
            onClick={handleActionClick}
            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {toast.action.label}
          </button>
        )}

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Fechar notificação"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subtle Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
          <div
            className={`h-full ${styleConfig.progressBarClass} transition-all origin-left`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  )
}
