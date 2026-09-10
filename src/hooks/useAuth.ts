import { useContext } from 'react'
import { AuthContext, type AuthContextType } from '../context/AuthContext'

const DEFAULT_GUEST_AUTH: AuthContextType = {
  user: null,
  session: null,
  loading: false,
  isConfigured: false,
  authModalInitialTab: undefined,
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  signUpWithPassword: async () => ({ error: null }),
  signInWithPassword: async () => ({ error: null }),
  continueAsGuest: () => {},
  isGuestAcknowledged: false,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
}

export const useAuth = (throwOnMissing: boolean = true): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    if (throwOnMissing) {
      throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
    }
    return DEFAULT_GUEST_AUTH
  }
  return context
}
