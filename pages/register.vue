<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRouter, useToast } from '#imports'
import { useAuth } from '~/composables/useAuth'
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

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
  'Sincroniza precios y combos para cocina y POS.',
  'Comparte tu enlace público para recibir reservas.',
]

const labelUi = { label: 'text-white' }
const fields: AuthFormField[] = [
  {
    name: 'name',
    type: 'text',
    label: 'Nombre',
    placeholder: 'Nombre y apellido',
    required: true,
    defaultValue: '',
    ui: labelUi,
  },
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

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
  const { name, email, password } = payload.data
  localError.value = ''
  try {
    await register({ name, email, password })
    toast.add({
      title: 'Cuenta creada',
      description: 'Te damos la bienvenida 👋',
      color: 'green',
      icon: 'i-heroicons-user-plus',
    })
    router.push('/')
  } catch (e: any) {
    const message = e?.data?.message || e?.message || 'No pudimos crear tu cuenta'
    localError.value = message
    toast.add({
      title: 'Registro fallido',
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
            class="backdrop-blur-xl bg-white/5 border border-white/10 text-white p-8 sm:p-10 flex flex-col gap-6 rounded-[28px] lg:rounded-[32px] lg:rounded-r-[120px] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          >
            <Motion
              tag="div"
              class="text-center space-y-1"
              :initial="{ opacity: 0, y: -10 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4, ease: 'easeOut' } }"
            >
              <div class="inline-flex items-center gap-1 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
                registro
              </div>
              <h2 class="text-2xl font-semibold">Crea tu cuenta</h2>
              <p class="text-sm text-white/70">Completa tus datos para comenzar a operar</p>
            </Motion>

            <div class="space-y-4">
              <Motion
                tag="div"
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.45, ease: 'easeOut' } }"
              >
                <UAuthForm
                  :schema="schema"
                  :fields="fields"
                  :state="formState"
                  :loading="loading"
                  :submit-button="{ label: 'Registrarme', color: 'primary', class: 'rounded-full' }"
                  @submit="onSubmit"
                >
                  <template #name-label>
                    <span class="text-white">Nombre</span>
                  </template>
                  <template #email-label>
                    <span class="text-white">Correo</span>
                  </template>
                <template #password-label>
                  <span class="text-white">Contraseña</span>
                </template>
                <template #confirm-label>
                  <span class="text-white">Confirmar contraseña</span>
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
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.45, ease: 'easeOut' } }"
              >
                <div class="text-center text-sm text-white/80">
                  ¿Ya tienes cuenta?
                  <NuxtLink to="/login" class="text-white font-semibold hover:text-primary transition-colors">Inicia sesión</NuxtLink>
                </div>
              </Motion>

              <Motion
                v-if="errMsg"
                tag="div"
                :initial="{ opacity: 0, y: 14 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.34, duration: 0.35, ease: 'easeOut' } }"
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

          <Motion
            tag="section"
            :initial="{ opacity: 0, x: 30 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 0.15, type: 'spring', stiffness: 200, damping: 20 } }"
            class="relative bg-white text-slate-900 p-8 sm:p-10 rounded-[28px] lg:rounded-[32px] lg:rounded-l-[120px] overflow-hidden shadow-inner"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-white via-rose-50 to-rose-100 pointer-events-none" />
            <div class="absolute -left-24 top-20 h-64 w-64 rounded-full bg-rose-100 opacity-50 blur-3xl" />
            <div class="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-rose-200 opacity-30 blur-2xl" />
            <div class="relative space-y-6">
              <Motion
                tag="div"
                :initial="{ opacity: 0, y: -14 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.12, duration: 0.4, ease: 'easeOut' } }"
              >
                <UBadge variant="soft" color="primary" class="uppercase tracking-[0.3em] text-xs text-muted">
                  Equipo nuevo
                </UBadge>
              </Motion>
              <Motion
                tag="div"
                class="space-y-4"
                :initial="{ opacity: 0, y: 18 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.45, ease: 'easeOut' } }"
              >
                <h1 class="text-3xl sm:text-4xl font-bold leading-tight">
                  Activa tu centro de cine al aire libre en minutos.
                </h1>
                <p class="text-sm text-muted">
                  Organiza funciones, combos y reservas con dashboards intuitivos. Cada usuario comparte información sincronizada.
                </p>
              </Motion>
              <ul class="space-y-2 text-sm text-muted">
                <Motion
                  v-for="(step, index) in onboardingSteps"
                  :key="step"
                  tag="li"
                  :initial="{ opacity: 0, x: 16 }"
                  :enter="{ opacity: 1, x: 0, transition: { delay: 0.28 + index * 0.08, duration: 0.4, ease: 'easeOut' } }"
                  class="flex items-start gap-3"
                >
                  <span class="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>{{ step }}</span>
                </Motion>
              </ul>

              <div class="grid grid-cols-3 gap-3 text-left">
                <Motion
                  v-for="(stat, index) in badgeHighlights"
                  :key="stat.label"
                  tag="div"
                  :initial="{ opacity: 0, y: 16, scale: 0.96 }"
                  :enter="{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.32 + index * 0.08, duration: 0.4, ease: 'easeOut' } }"
                  class="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm"
                >
                  <p class="text-xs uppercase tracking-wide text-slate-500">{{ stat.label }}</p>
                  <p class="text-2xl font-semibold text-primary">{{ stat.value }}</p>
                </Motion>
              </div>
            </div>
          </Motion>
        </div>
      </UCard>
    </Motion>
  </div>
</template>
