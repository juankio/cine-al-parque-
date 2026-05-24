import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

export interface User {
  id: string
  email: string
  isAdmin?: boolean
  name?: string
  picture?: string
}
export interface AuthLoginInput { email: string; password: string; remember?: boolean }
export interface AuthRegisterInput { name: string; email: string; password: string }

export const useAuth = () => {
  const store = useAuthStore()
  const { user, loading, error, bootstrapped, bootLoading } = storeToRefs(store)

  return {
    user,
    loading,
    error,
    bootstrapped,
    bootLoading,
    fetchMe: store.fetchMe,
    ensureSession: store.ensureSession,
    login: store.login,
    loginWithGoogle: store.loginWithGoogle,
    register: store.register,
    logout: store.logout
  }
}
