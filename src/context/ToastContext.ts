import { createContext } from 'react'
import type { ToastContextType } from '../types/toast'

const noopToast = () => ''

export const defaultToastContextValue: ToastContextType = {
  toasts: [],
  showToast: noopToast,
  success: noopToast,
  error: noopToast,
  info: noopToast,
  warning: noopToast,
  dismissToast: () => {},
}

export const ToastContext = createContext<ToastContextType>(defaultToastContextValue)
