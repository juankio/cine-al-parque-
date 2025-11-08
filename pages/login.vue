<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter, useRoute, useToast } from '#imports'
import { useAuth } from '~/composables/useAuth'
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const route = useRoute()
const { user, login, loading, error } = useAuth()
const toast = useToast()
const localError = ref('')
const errMsg = computed(() => localError.value || (typeof error.value === 'string' ? error.value : ''))

const heroPerks = [
  'Reserva salas en tiempo real.',
  'Sincroniza combos con cocina/POS.',
  'Recibe métricas y alertas en vivo.',
]

const labelUi = { label: 'text-white' }

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Correo',
    placeholder: 'correo@cine.com',
    required: true,
    defaultValue: '',
    ui: labelUi,
  },
  {
    name: 'password',
    type: 'password',
    label: 'Contraseña',
    placeholder: '••••••••',
    required: true,
    defaultValue: '',
    ui: labelUi,
  },
  {
    name: 'remember',
    type: 'checkbox',
    label: 'Recordarme',
    defaultValue: false,
    ui: labelUi
  },
]

const schema = z.object({
  email: z
    .string()
    .nonempty('Ingresa tu correo')
    .email('Correo inválido'),
  password: z
    .string()
    .nonempty('Ingresa tu contraseña')
    .min(4, 'Contraseña demasiado corta'),
  remember: z.boolean().optional(),
})

type Schema = z.output<typeof schema>

const formState = reactive<Schema>({
  email: '',
  password: '',
  remember: false,
})

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
    if (hint) formState.email = hint
  } catch {}
})

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
  const { email, password, remember } = payload.data
  localError.value = ''
  try {
    await login({ email, password, remember: !!remember })
    if (remember) localStorage.setItem('cine.user.email', email)
    else localStorage.removeItem('cine.user.email')
    await router.replace(resolveRedirect(route.query.redirect))
  } catch (e: any) {
    const message = e?.data?.message || e?.message || 'Credenciales inválidas'
    localError.value = message
    toast.add({
      title: 'No pudimos iniciar sesión',
      description: message,
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    error.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-rose-950 via-rose-900 to-rose-950 px-4 py-10 sm:px-6 lg:px-8 flex items-center justify-center">
    <Motion
      tag="div"
      :initial="{ opacity: 0, y: 32 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }"
      :hover="{ scale: 1.005 }"
      class="w-full max-w-5xl"
    >
      <UCard class="relative overflow-hidden border border-white/10 bg-black/30 shadow-[0_40px_120px_rgba(0,0,0,0.55)] rounded-[36px]">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <Motion
            tag="section"
            :initial="{ opacity: 0, x: -30 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 0.1, type: 'spring', stiffness: 200, damping: 20 } }"
            class="relative bg-white text-slate-900 p-8 sm:p-10 rounded-[28px] lg:rounded-[32px] lg:rounded-r-[120px] overflow-hidden shadow-inner"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-white via-rose-50 to-rose-100 pointer-events-none" />
            <div class="absolute -right-24 -top-8 h-64 w-64 rounded-full bg-rose-100 opacity-50 blur-3xl" />
            <div class="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-rose-200 opacity-30 blur-2xl" />
            <div class="relative space-y-6">
              <Motion
                tag="div"
                :initial="{ opacity: 0, y: -14 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.12, duration: 0.4, ease: 'easeOut' } }"
              >
                <UBadge variant="soft" color="primary" class="uppercase tracking-[0.3em] text-xs text-muted">
                  Cine al Parque
                </UBadge>
              </Motion>
              <Motion
                tag="div"
                class="space-y-4"
                :initial="{ opacity: 0, y: 18 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.45, ease: 'easeOut' } }"
              >
                <h1 class="text-3xl sm:text-4xl font-bold leading-tight">
                  Gestiona funciones, combos y reservas sin fricción.
                </h1>
                <p class="text-sm text-muted">
                  Coordina la operación diaria, habilita funciones y monitorea métricas en un tablero único.
                </p>
              </Motion>
              <ul class="space-y-2 text-sm text-muted">
                <Motion
                  v-for="(perk, index) in heroPerks"
                  :key="perk"
                  tag="li"
                  :initial="{ opacity: 0, x: -14 }"
                  :enter="{ opacity: 1, x: 0, transition: { delay: 0.28 + index * 0.08, duration: 0.4, ease: 'easeOut' } }"
                  class="flex items-center gap-2"
                >
                  <span class="h-2 w-2 rounded-full bg-primary" />
                  {{ perk }}
                </Motion>
              </ul>
            </div>
          </Motion>

          <Motion
            tag="section"
            :initial="{ opacity: 0, x: 30 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 0.15, type: 'spring', stiffness: 200, damping: 20 } }"
            class="backdrop-blur-xl bg-white/5 border border-white/10 text-white p-8 sm:p-10 flex flex-col gap-6 rounded-[28px] lg:rounded-[32px] lg:rounded-l-[120px] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          >
            <Motion
              tag="div"
              class="text-center space-y-1"
              :initial="{ opacity: 0, y: -10 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.12, duration: 0.4, ease: 'easeOut' } }"
            >
              <div class="inline-flex items-center gap-1 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
                acceso
              </div>
              <h2 class="text-2xl font-semibold">Inicia sesión</h2>
              <p class="text-sm text-white/70">Ingresa tus credenciales corporativas</p>
            </Motion>

            <div class="space-y-4">
              <Motion
                tag="div"
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.22, duration: 0.45, ease: 'easeOut' } }"
              >
                <UAuthForm
                  :schema="schema"
                  :fields="fields"
                  :state="formState"
                  :loading="loading"
                  :submit-button="{ label: 'Entrar', color: 'primary', class: 'rounded-full' }"
                  @submit="onSubmit"
                >
                  <template #email-label>
                    <span class="text-white">Correo</span>
                  </template>
                  <template #password-label>
                    <span class="text-white">Contraseña</span>
                  </template>
                  <template #validation>
                    <p v-if="errMsg" class="text-sm text-red-300 text-center">
                      {{ errMsg }}
                    </p>
                  </template>
                </UAuthForm>
              </Motion>

              <Motion
                tag="div"
                :initial="{ opacity: 0, y: 24 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.32, duration: 0.45, ease: 'easeOut' } }"
              >
                <div class="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between text-white/80 text-center sm:text-left">
                  <NuxtLink to="/login#recuperar" class="text-white font-medium hover:text-primary transition-colors">
                    ¿Olvidaste tu contraseña?
                  </NuxtLink>
                  <span class="text-white/70">
                    ¿No tienes cuenta?
                    <NuxtLink to="/register" class="text-white font-semibold hover:text-primary transition-colors">Regístrate ahora</NuxtLink>
                  </span>
                </div>
              </Motion>

              <Motion
                v-if="errMsg"
                tag="div"
                :initial="{ opacity: 0, y: 16 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.35, ease: 'easeOut' } }"
              >
                <UAlert
                  color="red"
                  variant="soft"
                  icon="i-heroicons-exclamation-triangle"
                  :description="errMsg"
                />
              </Motion>
            </div>
          </Motion>
        </div>
      </UCard>
    </Motion>
  </div>
</template>
