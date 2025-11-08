<script setup lang="ts">
const model = defineModel<string>({ default: '' })
const show = ref(false)
defineProps<{
  label: string
  name: string
  autocomplete?: string
  required?: boolean
}>()
</script>

<template>
  <label class="auth-field">
    <span class="auth-field__label">{{ label }}</span>
    <UInput
      v-model="model"
      :id="name"
      :type="show ? 'text' : 'password'"
      icon="i-heroicons-lock-closed"
      :autocomplete="autocomplete || 'current-password'"
      :required="required"
    />
    <UButton
      color="gray"
      variant="link"
      size="xs"
      class="auth-field__toggle"
      @click.prevent="show = !show"
    >
      {{ show ? 'Ocultar' : 'Ver' }} contraseña
    </UButton>
  </label>
</template>

<style scoped>
.auth-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.auth-field__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.7);
}
:global(.login-card__form) .auth-field__label,
:global(.register-card__form) .auth-field__label {
  color: rgba(255, 255, 255, 0.85);
}
.auth-field__toggle {
  align-self: flex-end;
  margin-top: -0.25rem;
  color: rgba(15, 23, 42, 0.7);
}
:global(.login-card__form) .auth-field__toggle,
:global(.register-card__form) .auth-field__toggle {
  color: rgba(255, 255, 255, 0.85);
}
</style>
