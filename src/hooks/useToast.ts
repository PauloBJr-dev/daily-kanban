import { useContext } from 'react'
import { ToastContext, defaultToastContextValue } from '../context/ToastContext'
import type { ToastContextType } from '../types/toast'

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  return context || defaultToastContextValue
}

export { ToastProvider } from '../components/ToastProvider'
