<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <UCard class="p-6 space-y-5">
    <div class="text-center">
      <h1 class="text-2xl font-bold">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-muted">{{ subtitle }}</p>
    </div>
    <slot />
  </UCard>
</template>
