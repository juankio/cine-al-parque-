<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter, useRoute, useToast } from '#imports'
import { useAuth } from '~/composables/useAuth'
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { animate, stagger } from 'animejs'

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

const labelUi = { label: 'text-foreground font-medium' }

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Correo Electrónico',
    placeholder: 'admin@cine.com',
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
    label: 'Mantener sesión iniciada',
    defaultValue: false,
    ui: labelUi
  },
]

const schema = z.object({
  email: z
    .string()
    .min(1, 'Ingresa tu correo')
    .email('Correo inválido'),
  password: z
    .string()
    .min(1, 'Ingresa tu contraseña')
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

  // Anime.js Entrance Animation
  if (typeof window !== 'undefined') {
    animate('.anim-left', {
      opacity: [0, 1],
      translateX: [-40, 0],
      duration: 1000,
      delay: stagger(150),
      ease: 'outExpo'
    })
    
    animate('.anim-right', {
      opacity: [0, 1],
      translateX: [40, 0],
      duration: 1000,
      delay: stagger(150),
      ease: 'outExpo'
    })
  }
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
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    error.value = null
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/30 p-4 sm:p-6 lg:p-8">
    <UCard class="w-full max-w-5xl overflow-hidden rounded-[2rem] shadow-2xl border border-border/50 bg-background" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <div class="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
        <!-- Left Side: Form -->
        <div class="flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <div class="w-full max-w-md mx-auto space-y-8">
            <div class="space-y-2 anim-left opacity-0 text-center md:text-left">
              <NuxtLink to="/" class="inline-flex items-center gap-2 text-primary font-bold tracking-tight mb-4 hover:opacity-80 transition-opacity">
                <UIcon name="i-heroicons-film" class="w-6 h-6" />
                Cine al Parque
              </NuxtLink>
              <h1 class="text-3xl font-bold tracking-tight text-foreground">
                Bienvenido de vuelta
              </h1>
              <p class="text-muted-foreground text-sm">
                Ingresa tus credenciales corporativas para continuar.
              </p>
            </div>

            <div class="anim-left opacity-0 space-y-6">
              <UAuthForm
                :schema="schema"
                :fields="fields"
                :state="formState"
                :loading="loading"
                :submit-button="{ label: 'Entrar al panel', color: 'primary', size: 'lg', class: 'w-full rounded-xl font-semibold mt-2', trailingIcon: 'i-heroicons-arrow-right' }"
                @submit="onSubmit"
              >
                <template #validation>
                  <UAlert
                    v-if="errMsg"
                    color="error"
                    variant="soft"
                    icon="i-heroicons-exclamation-triangle"
                    :description="errMsg"
                    class="mb-4"
                  />
                </template>
              </UAuthForm>

              <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                ¿No tienes cuenta?
                <NuxtLink to="/register" class="font-medium text-primary hover:underline underline-offset-4">
                  Regístrate
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Graphic/Image -->
        <div class="hidden md:flex relative bg-primary/5 border-l border-border/50 items-center justify-center overflow-hidden p-12">
          <!-- Abstract SVG Background -->
          <div class="absolute inset-0 opacity-20 dark:opacity-10 text-primary pointer-events-none">
            <svg class="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity="0.2"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div class="absolute top-1/4 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
          <div class="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] mix-blend-screen" />

          <div class="relative z-10 space-y-8 max-w-sm anim-right opacity-0">
            <div class="space-y-4">
              <div class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5" /> Nuevo Dashboard
              </div>
              <h2 class="text-3xl font-bold leading-tight">
                Gestiona tus funciones sin fricción
              </h2>
              <p class="text-muted-foreground text-sm">
                Coordina la operación diaria, habilita funciones y monitorea métricas en un tablero único optimizado para la velocidad.
              </p>
            </div>

            <ul class="space-y-4">
              <li v-for="(perk, idx) in heroPerks" :key="idx" class="flex items-center gap-3 text-sm font-medium text-foreground">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UIcon name="i-heroicons-check" class="h-4 w-4" />
                </div>
                {{ perk }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
