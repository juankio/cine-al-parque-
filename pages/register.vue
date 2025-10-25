<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from '#imports'
import { useAuth } from '~/composables/useAuth'
import { validateRegister } from '~/utils/validators'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const { register, loading, error } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const errMsg = computed(() => (typeof error.value === 'string' ? error.value : ''))

const onSubmit = async () => {
  const v = validateRegister(name.value, email.value, password.value, confirm.value)
  if (v) return alert(v)
  try {
    await register({ name: name.value, email: email.value, password: password.value })
    router.push('/')
  } catch {}
}
</script>

<template>
  <AuthCard title="Crear cuenta" subtitle="Cine al Parque">
    <UForm @submit.prevent="onSubmit" class="space-y-4">
      <AuthTextField
        v-model="name"
        label="Nombre"
        name="name"
        icon="i-heroicons-user"
        autocomplete="name"
        required
      />
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
        autocomplete="new-password"
        required
      />
      <AuthPasswordField
        v-model="confirm"
        label="Confirmar contraseña"
        name="confirm"
        autocomplete="new-password"
        required
      />

      <UButton type="submit" color="primary" block size="lg" :loading="loading">
        Registrarme
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
      ¿Ya tienes cuenta?
      <NuxtLink to="/login" class="text-primary hover:underline">Inicia sesión</NuxtLink>
    </p>
  </AuthCard>
</template>
