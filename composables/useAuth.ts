export interface User {
  id: string
  email: string
  isAdmin?: boolean
  name?: string
}

export interface AuthLoginInput {
  email: string
  password: string
  remember?: boolean
}

export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const loading = useState<boolean>('auth.loading', () => false)
  const error = useState<any>('auth.error', () => null)

  const fetchMe = async (): Promise<User | null> => {
    try {
      loading.value = true
      // ✅ Usa $fetch para llamadas imperativas (client) y también sirve en server
      const res = await $fetch<{ authenticated?: boolean; user?: User }>('/api/auth/me', {
        credentials: 'include',
      })
      user.value = res?.user ?? null
      return user.value
    } catch (e) {
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  const login = async ({ email, password, remember = false }: AuthLoginInput): Promise<User> => {
    error.value = null
    loading.value = true
    try {
      // ✅ $fetch en vez de useFetch
      const res = await $fetch<{ ok: boolean; user?: User }>('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        body: { email, password, remember },
      })
      const me = res?.user
      if (!me) throw new Error('Login fallido')
      user.value = me
      if (remember) localStorage.setItem('cine.user.email', email)
      return me
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Error de autenticación'
      throw e
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    loading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch { }
    user.value = null
    loading.value = false
    try { localStorage.removeItem('cine.user.email') } catch { }
    await navigateTo('/login')
  }

  return { user, loading, error, fetchMe, login, logout }
}
