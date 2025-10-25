<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <header class="flex items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-muted">{{ subtitle }}</p>
    </div>

    <!-- Slot opcional para botones u acciones -->
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
