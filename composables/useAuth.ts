import { computed } from 'vue'
import { useRequestFetch } from '#app'
import type { FetchError } from 'ofetch'

type AuthUser = {
  id: string
  name: string
  email: string
}

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = {
  name: string
  email: string
  password: string
}

type RefreshOptions = {
  quiet?: boolean
}

type AuthResult<T = unknown> = {
  ok: boolean
  user: AuthUser
} & T

const resolveErrorMessage = (error: unknown, fallback = 'Error desconocido'): string => {
  if (!error) return fallback

  const fetchError = error as FetchError<any>
  const data = fetchError?.data ?? (fetchError as any)?.response?._data

  if (data) {
    if (typeof data === 'string') return data
    if (typeof data.statusMessage === 'string') return data.statusMessage
    if (typeof data.message === 'string') return data.message
    if (typeof data.error === 'string') return data.error
  }

  const statusMessage = (fetchError as any)?.statusMessage
  if (typeof statusMessage === 'string' && statusMessage) return statusMessage

  if (fetchError?.message) return fetchError.message

  return fallback
}

export const useAuth = () => {
  const nuxtApp = useNuxtApp()

  const user = useState<AuthUser | null>('auth-user', () => null)
  const status = useState<AuthStatus>('auth-status', () => 'idle')
  const error = useState<string | null>('auth-error', () => null)
  const initialized = useState<boolean>('auth-initialized', () => false)
  const initializing = useState<boolean>('auth-initializing', () => false)

  const setUser = (value: AuthUser | null) => {
    user.value = value
    status.value = value ? 'authenticated' : 'unauthenticated'
  }

  const fetcherForContext = () => (process.server ? useRequestFetch() : nuxtApp.$fetch)

  const refresh = async (options: RefreshOptions = {}) => {
    const { quiet } = options

    if (!quiet) {
      status.value = 'loading'
      error.value = null
    }

    const request = fetcherForContext()

    try {
      const response = await request<{ user: AuthUser | null }>('/api/auth/me', {
        credentials: 'include'
      })

      setUser(response?.user ?? null)
      if (!quiet) error.value = null
      return user.value
    } catch (err) {
      setUser(null)
      if (!quiet) error.value = resolveErrorMessage(err, 'No se pudo verificar la sesion')
      throw err
    } finally {
      if (status.value === 'loading') {
        status.value = user.value ? 'authenticated' : 'unauthenticated'
      }
    }
  }

  const initialize = async () => {
    if (initialized.value || initializing.value) return user.value

    initializing.value = true
    try {
      await refresh({ quiet: true }).catch(() => null)
    } finally {
      initialized.value = true
      initializing.value = false
    }

    return user.value
  }

  const login = async (payload: LoginPayload) => {
    error.value = null
    status.value = 'loading'

    try {
      const response = await nuxtApp.$fetch<AuthResult>('/api/auth/login', {
        method: 'POST',
        body: payload,
        credentials: 'include'
      })

      setUser(response.user)
      return response.user
    } catch (err) {
      setUser(null)
      error.value = resolveErrorMessage(err, 'No se pudo iniciar sesion')
      throw err
    } finally {
      if (status.value === 'loading') {
        status.value = user.value ? 'authenticated' : 'unauthenticated'
      }
    }
  }

  const register = async (payload: RegisterPayload) => {
    error.value = null
    status.value = 'loading'

    try {
      const response = await nuxtApp.$fetch<AuthResult>('/api/auth/register', {
        method: 'POST',
        body: payload,
        credentials: 'include'
      })

      setUser(response.user)
      return response.user
    } catch (err) {
      setUser(null)
      error.value = resolveErrorMessage(err, 'No se pudo registrar')
      throw err
    } finally {
      if (status.value === 'loading') {
        status.value = user.value ? 'authenticated' : 'unauthenticated'
      }
    }
  }

  const logout = async () => {
    error.value = null

    try {
      await nuxtApp.$fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } finally {
      setUser(null)
    }
  }

  const clearError = () => {
    error.value = null
  }

  const isAuthenticated = computed(() => !!user.value)
  const isLoading = computed(() => status.value === 'loading' && !user.value)

  return {
    user,
    status,
    error,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refresh,
    initialize,
    clearError
  }
}
