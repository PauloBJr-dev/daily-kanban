import { useContext } from 'react'
import { AuthContext, type AuthContextType } from '../context/AuthContext'

const DEFAULT_GUEST_AUTH: AuthContextType = {
  user: null,
  session: null,
  loading: false,
  isConfigured: false,
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
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
