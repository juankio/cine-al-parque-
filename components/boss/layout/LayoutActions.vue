<script setup lang="ts">
defineProps<{ loading: boolean; error: string; message: string }>()
const emit = defineEmits<{ (e:'generate'): void }>()
</script>

<template>
  <div class="flex items-center gap-3">
    <UButton
      :label="loading ? 'Generando…' : 'Generar layout'"
      color="primary"
      :loading="loading"
      icon="i-heroicons-cog-6-tooth"
      @click="emit('generate')"
    />
    <span v-if="error" class="text-red-500 text-sm">{{ error }}</span>
    <span v-if="message" class="text-primary text-sm">{{ message }}</span>
  </div>
</template>
