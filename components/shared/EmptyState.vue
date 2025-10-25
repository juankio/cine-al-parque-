<script setup lang="ts">
defineProps<{ title?: string; description?: string }>()
</script>

<template>
  <UCard class="p-8 text-center">
    <p class="text-lg font-semibold">{{ title || 'Sin resultados' }}</p>
    <p v-if="description" class="text-sm text-muted mt-1">{{ description }}</p>
    <div class="mt-4">
      <slot />
    </div>
  </UCard>
</template>
