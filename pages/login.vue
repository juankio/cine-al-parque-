<template>
  <div class="bg-white rounded-2xl shadow p-6">
    <div class="mb-6 text-center">
      <h1 class="text-2xl font-bold">Inicia sesión</h1>
      <p class="text-sm text-gray-500">Cine al Parque</p>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Correo</label>
        <input
          v-model.trim="email"
          type="email"
          autocomplete="email"
          required
          class="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Contraseña</label>
        <input
          v-model="password"
          :type="show ? 'text' : 'password'"
          autocomplete="current-password"
          required
          class="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
        />
        <button
          type="button"
          @click="show = !show"
          class="text-xs mt-1 text-gray-500 hover:text-gray-700"
        >
          {{ show ? 'Ocultar' : 'Ver' }} contraseña
        </button>
      </div>

      <div class="flex items-center justify-between">
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="remember" class="rounded" />
          Recuérdame
        </label>
        <button
          type="button"
          @click="guestFill"
          class="text-sm text-blue-600 hover:underline"
        >
          Autocompletar demo
        </button>
      </div>

      <button
        :disabled="loading"
        type="submit"
        class="w-full rounded-xl py-2 font-semibold bg-black text-white disabled:opacity-60"
      >
        <span v-if="!loading">Entrar</span>
        <span v-else>Cargando…</span>
      </button>
        <p class="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
  ¿No tienes cuenta?
  <NuxtLink to="/register" class="text-brand hover:underline">Regístrate</NuxtLink>
</p>

      <p v-if="errMsg" class="text-sm text-red-600">{{ errMsg }}</p>

      <div class="relative py-3">
        <div class="absolute inset-0 flex items-center" aria-hidden="true">
          <div class="w-full border-t"></div>
        </div>
        <div class="relative flex justify-center">
          <span class="bg-white px-2 text-xs text-gray-500">o</span>
        </div>
      </div>

      <button
        type="button"
        @click="googleLogin"
        class="w-full rounded-xl border py-2 font-medium"
      >
        Continuar con Google
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useAuth } from '~/composables/useAuth'
import { validateLogin } from '@/utils/validators'

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const router = useRouter()
const { login, loading, error } = useAuth()

const email = ref<string>('')
const password = ref<string>('')
const remember = ref<boolean>(false)
const show = ref<boolean>(false)
const errMsg = computed(() => (typeof error.value === 'string' ? error.value : ''))

onMounted(() => {
  try {
    const hint = localStorage.getItem('cine.user.email')
    if (hint) email.value = hint
  } catch {}
})

const onSubmit = async () => {
  const v = validateLogin(email.value, password.value)
  if (v) {
    alert(v)
    return
  }
  try {
    await login({ email: email.value, password: password.value, remember: remember.value })
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch {
    // error ya queda en state
  }
}

const guestFill = () => {
  email.value = 'demo@mail.com'
  password.value = '123456'
}

const googleLogin = () => {
  const redirect = (route.query.redirect as string) || '/'
  window.location.href = '/api/auth/google/start?redirect=' + encodeURIComponent(redirect)
}
</script>
