<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const isClient = typeof window !== 'undefined'
const flashlightRef = ref(null)

const handleMouseMove = (e) => {
  if (!flashlightRef.value) return
  
  // Optimizando con requestAnimationFrame y CSS Variables para 60fps constantes
  requestAnimationFrame(() => {
    if (flashlightRef.value) {
      flashlightRef.value.style.setProperty('--x', `${e.clientX}px`)
      flashlightRef.value.style.setProperty('--y', `${e.clientY}px`)
      flashlightRef.value.style.opacity = '1'
    }
  })
}

const handleMouseLeave = () => {
  if (flashlightRef.value) {
    flashlightRef.value.style.opacity = '0'
  }
}

onMounted(() => {
  if (isClient) {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
  }
})

onBeforeUnmount(() => {
  if (isClient) {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-black text-foreground transition-colors flex flex-col relative overflow-hidden">
      
      <!-- Global Backgrounds (Ghost images and textures) -->
      <div class="fixed inset-0 z-[0] pointer-events-none opacity-[0.04] mix-blend-screen">
        <img src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2670&auto=format&fit=crop" class="w-full h-full object-cover grayscale" />
      </div>
      <div class="fixed inset-0 z-[0] pointer-events-none opacity-10 mix-blend-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      
      <!-- Theatrical Grid Pattern (Global) -->
      <div class="fixed inset-0 z-[0] pointer-events-none bg-[linear-gradient(to_right,#8888880a_1px,transparent_1px),linear-gradient(to_bottom,#8888880a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_30%,transparent_100%)]"></div>

      <!-- Global Vignette (Dark edges everywhere) -->
      <div class="fixed inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]"></div>

      <!-- Global Flashlight (Luz Roja Perseguidor) -->
      <div 
        ref="flashlightRef"
        class="pointer-events-none fixed inset-0 z-[40] transition-opacity duration-700 opacity-0 mix-blend-screen"
        style="background: radial-gradient(circle 600px at var(--x, 50%) var(--y, 50%), rgba(225,29,72,0.18), transparent 80%)"
      ></div>

      <Navbar class="z-50 relative" />
      
      <!-- El main debe expandirse, eliminamos el UContainer global para permitir Full-Bleed -->
      <main class="flex-1 w-full relative z-10">
        <slot />
      </main>
    </div>
  </UApp>
</template>
