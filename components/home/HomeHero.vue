<template>
  <div ref="heroRef" class="relative overflow-hidden rounded-3xl border border-border bg-background p-8 md:p-12 shadow-sm">
    <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
      <div class="space-y-4 text-center md:text-left">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Cine al Parque
        </h1>
        <p class="text-base sm:text-lg text-muted-foreground max-w-md">
          Compra tu combo, elige función y reserva tu mesa en minutos.
        </p>
      </div>
      
      <div class="w-full md:w-96 lg:w-[28rem] relative">
        <UInput
          :model-value="props.modelValue"
          size="xl"
          icon="i-heroicons-magnifying-glass"
          placeholder="Buscar película..."
          class="w-full shadow-sm ring-border"
          @update:model-value="onUpdate"
        />
      </div>
    </div>
    
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import anime from 'animejs'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const heroRef = ref<HTMLElement | null>(null)

onMounted(() => {
  anime({
    targets: heroRef.value,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    easing: 'easeOutExpo'
  })
})

function onUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

