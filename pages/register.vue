<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter, useToast } from '#imports'
import { useAuth } from '~/composables/useAuth'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { animate, stagger } from 'animejs'
import AuthGraphicSidebar from '~/components/shared/AuthGraphicSidebar.vue'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const toast = useToast()
const { register, loginWithGoogle, loading, error } = useAuth()
const localError = ref('')
const errMsg = computed(() => localError.value || (typeof error.value === 'string' ? error.value : ''))

const badgeHighlights = [
  { label: 'Centros activos', value: '12' },
  { label: 'Combos vendidos', value: '+8K' },
  { label: 'Tiempo de set up', value: '5 min' },
]

const onboardingSteps = [
  'Configura salas y mesas con asistentes guiados.',
  'Sincroniza precios y combos para cocina.',
  'Comparte tu enlace público para recibir reservas.',
]


const schema = z
  .object({
    name: z.string().min(2, 'Ingresa tu nombre'),
    email: z.string().email('Correo inválido'),
    password: z.string().min(6, 'Contraseña demasiado corta'),
    confirm: z.string().min(6, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirm, {
    path: ['confirm'],
    message: 'Las contraseñas no coinciden',
  })

type Schema = z.output<typeof schema>

const formState = reactive<Schema>({
  name: '',
  email: '',
  password: '',
  confirm: '',
})

onMounted(() => {
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
  const { name, email, password } = payload.data
  localError.value = ''
  try {
    await register({ name, email, password })
    toast.add({
      title: 'Cuenta creada',
      description: 'Te damos la bienvenida 👋',
      color: 'success',
      icon: 'i-heroicons-user-plus',
    })
    router.push('/')
  } catch (e: any) {
    const message = e?.data?.message || e?.message || 'No pudimos crear tu cuenta'
    localError.value = message
    toast.add({
      title: 'Registro fallido',
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
    await loginWithGoogle(token, true)
    await router.replace('/')
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
    <div class="absolute top-0 right-1/4 w-[500px] h-[500px] bg-rose-500/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

    <UCard class="w-full max-w-[1200px] overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-2xl" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <div class="grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
        
        <AuthGraphicSidebar 
          img-src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop"
          badge-text="Equipo Nuevo"
          badge-icon="i-heroicons-building-storefront-solid"
          badge-color="rose"
          title="Activa tu centro de cine en minutos."
          description="Organiza funciones, combos y reservas con dashboards intuitivos."
          :perks="onboardingSteps"
          :stats="badgeHighlights"
          position="left"
        />

        <!-- Right Side: Form -->
        <div class="flex flex-col justify-center p-8 md:p-16 relative z-10 order-1 lg:order-2">
          <div class="w-full max-w-md mx-auto space-y-8">
            <div class="space-y-4 anim-right opacity-0 text-center lg:text-left">
              <NuxtLink to="/" class="inline-flex items-center gap-2 text-primary font-black tracking-widest uppercase text-sm mb-4 hover:opacity-80 transition-opacity">
                <UIcon name="i-heroicons-ticket-solid" class="w-5 h-5" />
                Cine al Parque
              </NuxtLink>
              <h1 class="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Crea tu cuenta
              </h1>
              <p class="text-white/60 text-base font-medium">
                Completa tus datos corporativos para comenzar a operar.
              </p>
            </div>

            <div class="anim-right opacity-0 space-y-6">
              <UForm :schema="schema" :state="formState" @submit="onSubmit" class="space-y-4">
                <UAlert
                  v-if="errMsg"
                  color="error"
                  variant="soft"
                  icon="i-heroicons-exclamation-triangle"
                  :description="errMsg"
                  class="mb-6 rounded-xl border border-error/20"
                />

                <UFormField label="Nombre completo" name="name" required>
                  <UInput v-model="formState.name" placeholder="Juan Pérez" size="lg" class="w-full" />
                </UFormField>

                <UFormField label="Correo Electrónico" name="email" required>
                  <UInput v-model="formState.email" type="email" placeholder="juan@cine.com" size="lg" class="w-full" />
                </UFormField>

                <UFormField label="Contraseña" name="password" required>
                  <UInput v-model="formState.password" type="password" placeholder="••••••••" size="lg" class="w-full" />
                </UFormField>

                <UFormField label="Confirmar contraseña" name="confirm" required>
                  <UInput v-model="formState.confirm" type="password" placeholder="••••••••" size="lg" class="w-full" />
                </UFormField>

                <UButton type="submit" label="Registrarme" color="primary" size="xl" block :loading="loading" class="w-full rounded-2xl font-black tracking-widest uppercase mt-4 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" />
              </UForm>

              <div class="flex items-center justify-center lg:justify-start gap-2 text-sm text-white/60 font-medium pt-4">
                ¿Ya tienes cuenta?
                <NuxtLink to="/login" class="font-bold text-white hover:text-primary transition-colors">
                  Inicia sesión
                </NuxtLink>
              </div>

              <!-- Separador de Google -->
              <div class="relative mt-8 mb-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-white/10"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="bg-[#0a0a0a] px-4 text-white/40 uppercase tracking-widest text-xs font-bold">O registrarme con</span>
                </div>
              </div>

              <!-- Botón Google Custom -->
              <div class="flex justify-center w-full">
                <GoogleLogin :callback="onGoogleCallback" popup-type="TOKEN">
                  <button type="button" class="w-full flex items-center justify-center gap-3 bg-[#111] hover:bg-[#1a1a1a] text-white border border-white/10 rounded-2xl h-14 font-medium transition-all hover:scale-[1.02] shadow-lg">
                    <svg viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.1H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.9l3.66-2.81z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.1l3.66 2.81c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                    <span>Google</span>
                  </button>
                </GoogleLogin>
              </div>

            </div>
          </div>
        </div>

      </div>
    </UCard>
  </div>
</template>
