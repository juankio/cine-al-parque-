import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, AuthLoginInput, AuthRegisterInput } from '~/composables/useAuth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<any>(null)
  const bootstrapped = ref<boolean>(false)
  const bootLoading = ref<boolean>(false)

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

  const loginWithGoogle = async (credential: string, remember = true): Promise<User> => {
    error.value = null
    loading.value = true
    try {
      const res = await $fetch<{ ok: boolean; user?: User }>('/api/auth/google', {
        method: 'POST',
        credentials: 'include',
        body: { credential, remember }
      })
      const me = res?.user
      if (!me) throw new Error('Login fallido (sin user)')
      user.value = me
      bootstrapped.value = true
      return me
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Error autenticando con Google'
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

  return { 
    user, 
    loading, 
    error, 
    fetchMe, 
    ensureSession, 
    login, 
    loginWithGoogle, 
    register, 
    logout, 
    bootstrapped, 
    bootLoading 
  }
})
