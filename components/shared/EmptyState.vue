<script setup lang="ts">
defineProps<{ 
  title?: string; 
  description?: string;
  icon?: string;
  isError?: boolean;
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed transition-colors duration-300"
       :class="isError ? 'bg-error/5 border-error/20' : 'bg-muted/10 border-border/50'">
    <div class="p-4 rounded-2xl mb-5 shadow-sm" :class="isError ? 'bg-error/10 text-error' : 'bg-background border border-border/50 text-muted-foreground'">
      <UIcon :name="icon || (isError ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-inbox')" class="w-8 h-8" />
    </div>
    <h3 class="text-xl font-bold tracking-tight text-foreground">{{ title || 'Sin resultados' }}</h3>
    <p v-if="description" class="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">{{ description }}</p>
    <div v-if="$slots.default || $slots.actions" class="mt-6 flex items-center justify-center gap-3">
      <slot name="actions" />
      <slot />
    </div>
  </div>
</template>
