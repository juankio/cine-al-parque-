<script setup lang="ts">
const model = defineModel<string>({ default: '' })
defineProps<{
  label: string
  name: string
  type?: string
  icon?: string
  autocomplete?: string
  required?: boolean
}>()
</script>

<template>
  <label class="auth-field">
    <span class="auth-field__label">{{ label }}</span>
    <UInput
      v-model.trim="model"
      :id="name"
      :type="type || 'text'"
      :icon="icon"
      :autocomplete="autocomplete"
      :required="required"
    />
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
</style>
