<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter, useRoute, useToast } from '#imports'
import { useAuth } from '~/composables/useAuth'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { animate, stagger } from 'animejs'
import AuthGraphicSidebar from '~/components/shared/AuthGraphicSidebar.vue'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const route = useRoute()
const { user, login, loginWithGoogle, loading, error } = useAuth()
const toast = useToast()
const localError = ref('')
const errMsg = computed(() => localError.value || (typeof error.value === 'string' ? error.value : ''))

const heroPerks = [
  'Reserva salas en tiempo real.',
  'Sincroniza combos con cocina/POS.',
  'Recibe métricas y alertas en vivo.',
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

const onGoogleCallback = async (response: any) => {
  localError.value = ''
  try {
    const token = response.access_token || response.credential
    await loginWithGoogle(token, formState.remember)
    await router.replace(resolveRedirect(route.query.redirect))
  } catch (e: any) {
    const message = e?.data?.message || e?.message || 'Error con Google'
    localError.value = message
    toast.add({
      title: 'Error de autenticación',
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
              <UForm :schema="schema" :state="formState" @submit="onSubmit" class="space-y-4">
                <UAlert
                  v-if="errMsg"
                  color="error"
                  variant="soft"
                  icon="i-heroicons-exclamation-triangle"
                  :description="errMsg"
                  class="mb-6 rounded-xl border border-error/20"
                />

                <UFormField label="Correo Electrónico" name="email" required>
                  <UInput v-model="formState.email" type="email" placeholder="juan@cine.com" size="lg" class="w-full" />
                </UFormField>

                <UFormField label="Contraseña" name="password" required>
                  <UInput v-model="formState.password" type="password" placeholder="••••••••" size="lg" class="w-full" />
                </UFormField>

                <UFormField name="remember">
                  <UCheckbox v-model="formState.remember" label="Mantener sesión iniciada" />
                </UFormField>

                <UButton type="submit" label="Entrar al panel" color="primary" size="xl" block trailing-icon="i-heroicons-arrow-right" :loading="loading" class="w-full rounded-2xl font-black tracking-widest uppercase mt-4 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" />
              </UForm>

              <div class="flex items-center justify-center lg:justify-start gap-2 text-sm text-white/60 font-medium pt-4">
                ¿No tienes cuenta?
                <NuxtLink to="/register" class="font-bold text-white hover:text-primary transition-colors">
                  Regístrate
                </NuxtLink>
              </div>

              <!-- Separador de Google -->
              <div class="relative mt-8 mb-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-white/10"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="bg-[#0a0a0a] px-4 text-white/40 uppercase tracking-widest text-xs font-bold">O continuar con</span>
                </div>
              </div>

              <!-- Botón Google Custom -->
              <div class="flex justify-center w-full">
                <GoogleLogin :callback="onGoogleCallback">
                  <button type="button" class="w-full flex items-center justify-center gap-3 bg-[#111] hover:bg-[#1a1a1a] text-white border border-white/10 rounded-2xl h-14 font-medium transition-all hover:scale-[1.02] shadow-lg">
                    <svg viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.1H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.9l3.66-2.81z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.1l3.66 2.81c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                    <span>Ingresar con Google</span>
                  </button>
                </GoogleLogin>
              </div>

            </div>
          </div>
        </div>

        <AuthGraphicSidebar 
          img-src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop"
          badge-text="Nuevo Dashboard"
          badge-icon="i-heroicons-sparkles-solid"
          badge-color="primary"
          title="Gestiona tus funciones sin fricción"
          description="Coordina la operación diaria, habilita funciones y monitorea métricas en un tablero único optimizado para la velocidad."
          :perks="heroPerks"
          position="right"
        />

      </div>
    </div>
  </div>
</template>
