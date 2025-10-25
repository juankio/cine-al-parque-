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
const errMsg = computed(() => (typeof error.value === 'string' ? error.value : ''))

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
  if (!r.startsWith('/')) return '/'
  if (r.startsWith('/login')) return '/'
  if (r.length > 1024) return '/'
  return r
}

onMounted(() => {
  if (user.value) {
    router.replace(resolveRedirect(route.query.redirect))
    return
  }
  try {
    const hint = localStorage.getItem('cine.user.email')
    if (hint) email.value = hint
  } catch {}
})

const onSubmit = async () => {
  const v = validateLogin(email.value, password.value)
  if (v) return alert(v)
  try {
    await login({ email: email.value, password: password.value, remember: remember.value })
    await router.replace(resolveRedirect(route.query.redirect))
  } catch {}
}
</script>

<template>
  <AuthCard title="Inicia sesión" subtitle="Cine al Parque">
    <UForm @submit.prevent="onSubmit" class="space-y-4">
      <AuthTextField
        v-model="email"
        label="Correo"
        name="email"
        type="email"
        icon="i-heroicons-envelope"
        autocomplete="email"
        required
      />
      <AuthPasswordField
        v-model="password"
        label="Contraseña"
        name="password"
        autocomplete="current-password"
        required
      />
      <UCheckbox v-model="remember" label="Recuérdame" color="primary" />

      <UButton type="submit" color="primary" block size="lg" :loading="loading">
        Entrar
      </UButton>

      <UAlert
        v-if="errMsg"
        color="red"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        :description="errMsg"
      />
    </UForm>

    <p class="text-center text-sm text-muted">
      ¿No tienes cuenta?
      <NuxtLink to="/register" class="text-primary hover:underline">Regístrate</NuxtLink>
    </p>
  </AuthCard>
</template>
