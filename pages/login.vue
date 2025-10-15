<template>
  <div class="bg-white dark:bg-surface rounded-2xl shadow border border-theme p-6">
    <div class="mb-6 text-center">
      <h1 class="text-2xl font-bold text-foreground">Inicia sesión</h1>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">Cine al Parque</p>
    </div>

    <form autocomplete="on" @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium mb-1">Correo</label>
        <input id="email" name="email" v-model.trim="email" type="email" inputmode="email" autocomplete="email" required
               class="w-full rounded-xl border border-theme px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring"/>
      </div>
      <div>
        <label for="password" class="block text-sm font-medium mb-1">Contraseña</label>
        <input id="password" name="password" v-model="password" :type="show ? 'text' : 'password'"
               autocomplete="current-password" required
               class="w-full rounded-xl border border-theme px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring"/>
        <button type="button" @click="show = !show" class="text-xs mt-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
          {{ show ? 'Ocultar' : 'Ver' }} contraseña
        </button>
      </div>

      <label class="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="remember" class="rounded" /> Recuérdame
      </label>

      <button :disabled="loading" type="submit" class="w-full rounded-xl py-2 font-semibold bg-brand text-white disabled:opacity-60">
        <span v-if="!loading">Entrar</span>
        <span v-else>Cargando…</span>
      </button>

      <p v-if="errMsg" class="text-sm text-red-500">{{ errMsg }}</p>
    </form>

    <p class="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
      ¿No tienes cuenta?
      <NuxtLink to="/register" class="text-brand hover:underline">Regístrate</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from '#imports'
import { useAuth } from '~/composables/useAuth'
import { validateLogin } from '~/utils/validators'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const route = useRoute()
const { user, login, loading, error } = useAuth()

const email = ref('')
const password = ref('')
const remember = ref(false)
const show = ref(false)
const errMsg = computed(() => (typeof error.value === 'string' ? error.value : ''))

// --- helper: sanitiza y resuelve redirect seguro ---
function decodeLoop(val: string, max = 5) {
  let out = val
  for (let i = 0; i < max; i++) {
    const dec = decodeURIComponent(out)
    if (dec === out) break
    out = dec
  }
  return out
}

function resolveRedirect(raw: unknown): string {
  let r = Array.isArray(raw) ? raw[0] : (raw as string | undefined)
  if (!r) return '/'
  r = decodeLoop(r)

  // solo rutas internas
  if (!r.startsWith('/')) return '/'

  // evita volver al login
  if (r.startsWith('/login')) return '/'

  // por seguridad, evita rutas absurdamente largas
  if (r.length > 1024) return '/'

  return r
}

onMounted(async () => {
  // Si ya estamos logueados y estamos en /login, vete al destino (o /)
  if (user.value) {
    const dest = resolveRedirect(route.query.redirect)
    router.replace(dest)
    return
  }
  try {
    const hint = localStorage.getItem('cine.user.email')
    if (hint) email.value = hint
  } catch {}
})

const onSubmit = async () => {
  const v = validateLogin(email.value, password.value)
  if (v) { alert(v); return }

  try {
    await login({ email: email.value, password: password.value, remember: remember.value })
    const dest = resolveRedirect(route.query.redirect)
    // usa replace para no dejar /login en el history
    await router.replace(dest)
  } catch {}
}
</script>

