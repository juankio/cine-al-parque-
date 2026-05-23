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

const labelUi = { label: 'text-white font-medium' }

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
  <div class="min-h-screen flex items-center justify-center bg-[#020202] p-4 sm:p-6 lg:p-8 overflow-hidden relative">
    <!-- Ambient Light -->
    <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

    <div class="w-full max-w-[1200px] overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-2xl">
      <div class="grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
        <!-- Left Side: Form -->
        <div class="flex flex-col justify-center p-8 md:p-16 relative z-10">
          <div class="w-full max-w-md mx-auto space-y-10">
            <div class="space-y-4 anim-left opacity-0 text-center lg:text-left">
              <NuxtLink to="/" class="inline-flex items-center gap-2 text-primary font-black tracking-widest uppercase text-sm mb-6 hover:opacity-80 transition-opacity">
                <UIcon name="i-heroicons-ticket-solid" class="w-5 h-5" />
                Cine al Parque
              </NuxtLink>
              <h1 class="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Bienvenido de vuelta
              </h1>
              <p class="text-white/60 text-base font-medium">
                Ingresa tus credenciales corporativas para continuar.
              </p>
            </div>

            <div class="anim-left opacity-0 space-y-6">
              <UAuthForm
                :schema="schema"
                :fields="fields"
                :state="formState"
                :loading="loading"
                :submit-button="{ label: 'Entrar al panel', color: 'primary', size: 'xl', class: 'w-full rounded-2xl font-black tracking-widest uppercase mt-4 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform', trailingIcon: 'i-heroicons-arrow-right' }"
                @submit="onSubmit"
              >
                <template #validation>
                  <UAlert
                    v-if="errMsg"
                    color="error"
                    variant="soft"
                    icon="i-heroicons-exclamation-triangle"
                    :description="errMsg"
                    class="mb-6 rounded-xl border border-error/20"
                  />
                </template>
              </UAuthForm>

              <div class="flex items-center justify-center lg:justify-start gap-2 text-sm text-white/60 font-medium pt-4">
                ¿No tienes cuenta?
                <NuxtLink to="/register" class="font-bold text-white hover:text-primary transition-colors">
                  Regístrate
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Graphic/Image -->
        <div class="hidden lg:flex relative bg-black items-center justify-center overflow-hidden">
          <img src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-30 grayscale-[30%] mix-blend-lighten" />
          
          <div class="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 to-transparent z-10"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>

          <div class="relative z-20 space-y-8 max-w-md p-16 anim-right opacity-0 mr-auto">
            <div class="space-y-4">
              <div class="inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary shadow-lg">
                <UIcon name="i-heroicons-sparkles-solid" class="w-3.5 h-3.5" /> Nuevo Dashboard
              </div>
              <h2 class="text-4xl font-black leading-tight text-white drop-shadow-md">
                Gestiona tus funciones sin fricción
              </h2>
              <p class="text-white/70 text-base font-medium leading-relaxed">
                Coordina la operación diaria, habilita funciones y monitorea métricas en un tablero único optimizado para la velocidad.
              </p>
            </div>

            <ul class="space-y-5">
              <li v-for="(perk, idx) in heroPerks" :key="idx" class="flex items-center gap-4 text-sm font-bold text-white">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20">
                  <UIcon name="i-heroicons-check" class="h-4 w-4" />
                </div>
                {{ perk }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
