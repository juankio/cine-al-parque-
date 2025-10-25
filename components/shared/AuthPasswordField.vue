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
  <UFormGroup :label="label" :name="name">
    <UInput
      v-model="model"
      :type="show ? 'text' : 'password'"
      icon="i-heroicons-lock-closed"
      :autocomplete="autocomplete || 'current-password'"
      :required="required"
    />
    <UButton
      color="gray"
      variant="link"
      size="xs"
      class="mt-1"
      @click="show = !show"
    >
      {{ show ? 'Ocultar' : 'Ver' }} contraseña
    </UButton>
  </UFormGroup>
</template>
