<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter, useToast } from '#imports'
import { useAuth } from '~/composables/useAuth'
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { animate, stagger } from 'animejs'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const toast = useToast()
const { register, loading, error } = useAuth()
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

const labelUi = { label: 'text-white font-medium' }

const fields: AuthFormField[] = [
  {
    name: 'name',
    type: 'text',
    label: 'Nombre completo',
    placeholder: 'Juan Pérez',
    required: true,
    defaultValue: '',
    ui: labelUi,
  },
  {
    name: 'email',
    type: 'email',
    label: 'Correo Electrónico',
    placeholder: 'juan@cine.com',
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
    name: 'confirm',
    type: 'password',
    label: 'Confirmar contraseña',
    placeholder: '••••••••',
    required: true,
    defaultValue: '',
    ui: labelUi,
  },
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
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#020202] p-4 sm:p-6 lg:p-8 overflow-hidden relative">
    <!-- Ambient Light -->
    <div class="absolute top-0 right-1/4 w-[500px] h-[500px] bg-rose-500/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

    <UCard class="w-full max-w-[1200px] overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-2xl" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <div class="grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
        
        <!-- Left Side: Graphic/Image -->
        <div class="hidden lg:flex relative bg-black items-center justify-center overflow-hidden order-2 lg:order-1">
          <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-30 grayscale-[30%] mix-blend-lighten" />
          
          <div class="absolute inset-0 bg-gradient-to-l from-[#0a0a0a]/90 to-transparent z-10"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>

          <div class="relative z-20 space-y-8 max-w-md p-16 anim-left opacity-0 ml-auto">
            <div class="space-y-4">
              <div class="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-400 shadow-lg">
                <UIcon name="i-heroicons-building-storefront-solid" class="w-3.5 h-3.5" /> Equipo Nuevo
              </div>
              <h2 class="text-4xl font-black leading-tight text-white drop-shadow-md">
                Activa tu centro de cine en minutos.
              </h2>
              <p class="text-white/70 text-base font-medium leading-relaxed">
                Organiza funciones, combos y reservas con dashboards intuitivos.
              </p>
            </div>

            <ul class="space-y-5">
              <li v-for="(step, idx) in onboardingSteps" :key="idx" class="flex items-center gap-4 text-sm font-bold text-white">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20">
                  <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
                </div>
                {{ step }}
              </li>
            </ul>

            <div class="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div v-for="stat in badgeHighlights" :key="stat.label" class="text-left">
                <p class="text-2xl font-black text-rose-400 drop-shadow-sm">{{ stat.value }}</p>
                <p class="text-[9px] uppercase tracking-widest font-bold text-white/50 mt-1">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </div>

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
              <UAuthForm
                :schema="schema"
                :fields="fields"
                :state="formState"
                :loading="loading"
                :submit-button="{ label: 'Registrarme', color: 'primary', size: 'xl', class: 'w-full rounded-2xl font-black tracking-widest uppercase mt-4 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform' }"
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
                ¿Ya tienes cuenta?
                <NuxtLink to="/login" class="font-bold text-white hover:text-primary transition-colors">
                  Inicia sesión
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

      </div>
    </UCard>
  </div>
</template>
