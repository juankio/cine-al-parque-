<template>
  <div ref="heroRef" class="relative overflow-hidden rounded-3xl border border-border/40 bg-background/50 backdrop-blur-xl shadow-sm p-10 md:p-16 mb-12">
    <!-- Abstract SVG Background Pattern -->
    <div class="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
      <svg class="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/4" width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="300" cy="300" r="300" fill="url(#paint0_radial)" />
        <defs>
          <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(300 300) rotate(90) scale(300)">
            <stop stop-color="currentColor" />
            <stop offset="1" stop-color="currentColor" stop-opacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>

    <!-- Glowing accents (Pro lines) -->
    <div class="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-[100px] pointer-events-none mix-blend-screen"></div>
    <div class="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/20 blur-[100px] pointer-events-none mix-blend-screen"></div>

    <div class="relative z-10 flex flex-col items-center justify-center gap-10 text-center">
      <div class="space-y-6 max-w-3xl hero-text-container">
        <!-- Subtitle pill -->
        <div class="hero-el inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-md">
          <UIcon name="i-heroicons-sparkles" class="mr-2 h-4 w-4" />
          <span>La nueva experiencia del cine</span>
        </div>
        
        <!-- Main title -->
        <h1 class="hero-el text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-foreground">
          Cine al <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-400">Parque</span>
        </h1>
        
        <!-- Description -->
        <p class="hero-el text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          Reserva tu asiento, pre-ordena combos deliciosos y vive la magia del séptimo arte con un servicio sin interrupciones.
        </p>
      </div>
      
      <!-- Search Bar with floating effect -->
      <div class="hero-el w-full max-w-2xl relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <UInput
          :model-value="props.modelValue"
          size="xl"
          icon="i-heroicons-magnifying-glass"
          placeholder="Busca tu película favorita..."
          class="relative w-full shadow-lg ring-1 ring-border/50 bg-background/80 backdrop-blur-xl rounded-xl transition-all duration-300 focus-within:ring-primary/50"
          :ui="{ icon: { trailing: { pointer: '' } } }"
          @update:model-value="onUpdate"
        >
          <template #trailing>
            <span class="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-muted/50 hidden sm:inline-block">⌘ K</span>
          </template>
        </UInput>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { animate, createTimeline, stagger, random } from 'animejs';
import { onMounted, ref } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const heroRef = ref<HTMLElement | null>(null)
const isClient = typeof window !== 'undefined'

onMounted(() => {
  if (isClient) {
    // Parallax background
    animate(heroRef.value?.querySelectorAll('.bg-primary\\/20, .bg-secondary\\/20') || [], {
      translateX: () => random(-20, 20),
      translateY: () => random(-20, 20),
      scale: [0.9, 1.1],
      duration: 4000,
      alternate: true,
      loop: true,
      ease: 'inOutSine'
    })

    // Staggered intro
    const tl = createTimeline({ defaults: { ease: 'outExpo' } });
    tl.add(heroRef.value, {
      opacity: [0, 1],
      duration: 800
    })
    .add('.hero-el', {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 1000,
      delay: stagger(150),
    }, '-=400');
  }
})

function onUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

