<script setup lang="ts">
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <div class="flex items-center gap-2">
    <USwitch
      v-model="model"
      size="lg"
      color="primary"
      on-icon="i-heroicons-check-circle"
      off-icon="i-heroicons-eye-slash"
    />
    <span class="text-sm font-medium">
      {{ model ? 'Modo reserva activo' : 'Modo vista' }}
    </span>
  </div>
</template>
