export interface User {
  id: string
  email: string
  isAdmin?: boolean
  name?: string
}
export interface AuthLoginInput { email: string; password: string; remember?: boolean }
export interface AuthRegisterInput { name: string; email: string; password: string }

export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const loading = useState<boolean>('auth.loading', () => false)
  const error = useState<any>('auth.error', () => null)

  // 👇 NUEVO: bandera para no spamear /me y evitar loops
  const bootstrapped = useState<boolean>('auth.bootstrapped', () => false)
  const bootLoading = useState<boolean>('auth.bootLoading', () => false)

  const fetchMe = async (): Promise<User | null> => {
    try {
      loading.value = true
      const res = await $fetch<{ authenticated?: boolean; user?: User }>('/api/auth/me', {
        credentials: 'include'
      })
      user.value = res?.user ?? null
      return user.value
    } catch {
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  // 👇 NUEVO: garantiza que solo se consulte /me una vez por arranque
  const ensureSession = async (): Promise<User | null> => {
    if (user.value || bootstrapped.value || bootLoading.value) return user.value
    bootLoading.value = true
    try {
      const me = await fetchMe()
      bootstrapped.value = true
      return me
    } finally {
      bootLoading.value = false
    }
  }

  const login = async ({ email, password, remember = false }: AuthLoginInput): Promise<User> => {
    error.value = null
    loading.value = true
    try {
      const res = await $fetch<{ ok: boolean; user?: User }>('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        body: { email, password, remember }
      })
      const me = res?.user
      if (!me) throw new Error('Login fallido (sin user)')
      user.value = me
      // 👇 importante: marcamos bootstrapped para que el guard no llame /me de nuevo
      bootstrapped.value = true
      if (remember) localStorage.setItem('cine.user.email', email)
      return me
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Error de autenticación'
      throw e
    } finally {
      loading.value = false
    }
  }

  const register = async (input: AuthRegisterInput): Promise<User> => {
    error.value = null
    loading.value = true
    try {
      const res = await $fetch<{ ok: boolean; user?: User }>('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        body: input
      })
      const me = res?.user
      if (!me) throw new Error('Registro fallido')
      user.value = me
      bootstrapped.value = true
      return me
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'No se pudo registrar'
      throw e
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    loading.value = true
    try { await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }) } catch { }
    user.value = null
    bootstrapped.value = false
    loading.value = false
    try { localStorage.removeItem('cine.user.email') } catch { }
    await navigateTo('/login')
  }

  return { user, loading, error, fetchMe, ensureSession, login, register, logout, bootstrapped, bootLoading }
}
