<script setup lang="ts">
defineProps<{ 
  title?: string; 
  description?: string;
  icon?: string;
  isError?: boolean;
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-border bg-background/50 backdrop-blur-xl shadow-inner transition-colors duration-300 relative overflow-hidden">
    <!-- Ambient Glow para Empty States -->
    <div v-if="isError" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-error/10 blur-[80px] rounded-full pointer-events-none mix-blend-screen"></div>
    <div v-else class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-muted-foreground/5 blur-[80px] rounded-full pointer-events-none mix-blend-screen"></div>

    <div class="relative z-10 p-4 rounded-full mb-5 shadow-lg border border-border/50 backdrop-blur-md" :class="isError ? 'bg-error/10 text-error' : 'bg-muted/30 text-muted-foreground'">
      <UIcon :name="icon || (isError ? 'i-heroicons-exclamation-triangle-solid' : 'i-heroicons-inbox-solid')" class="w-10 h-10 drop-shadow-md" />
    </div>
    
    <h3 class="relative z-10 text-2xl font-black tracking-tight text-foreground">{{ title || 'Sin resultados' }}</h3>
    <p v-if="description" class="relative z-10 text-base text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed font-medium">{{ description }}</p>
    
    <div v-if="$slots.default || $slots.actions" class="relative z-10 mt-8 flex items-center justify-center gap-4">
      <slot name="actions" />
      <slot />
    </div>
  </div>
</template>
