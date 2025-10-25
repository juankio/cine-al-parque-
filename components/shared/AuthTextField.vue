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
  <UFormGroup :label="label" :name="name">
    <UInput
      v-model.trim="model"
      :type="type || 'text'"
      :icon="icon"
      :autocomplete="autocomplete"
      :required="required"
    />
  </UFormGroup>
</template>
