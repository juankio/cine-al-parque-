<template>
  <section ref="sectionRef" class="space-y-8 relative w-full px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
    <div class="flex items-center justify-between border-b border-border/50 pb-5">
      <h2 class="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
        <UIcon name="i-heroicons-film" class="text-primary w-8 h-8" />
        En Cartelera
      </h2>
    </div>

    <div v-if="props.loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      <div v-for="i in 10" :key="i" class="animate-pulse flex flex-col gap-4">
        <USkeleton class="aspect-[2/3] w-full rounded-2xl" />
      </div>
    </div>

    <EmptyState
      v-else-if="props.error"
      is-error
      title="Error de Conexión"
      :description="props.error"
    >
      <template #actions>
        <UButton color="primary" variant="soft" icon="i-heroicons-arrow-path" @click="() => {}">Reintentar conexión</UButton>
      </template>
    </EmptyState>

    <div v-else-if="props.filtered.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      <NuxtLink
        v-for="(m, idx) in props.filtered"
        :key="m.id"
        :to="props.upcomingShowtimes(m.id, 1).length ? `/showtimes/${props.upcomingShowtimes(m.id, 1)[0].id}` : '#'"
        class="billboard-card block relative group w-full aspect-[2/3] rounded-2xl overflow-hidden bg-black shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 opacity-0 transform-gpu cursor-pointer"
      >
        <!-- Full Poster Background -->
        <img :src="m.poster || '/favicon.ico'" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100" loading="lazy" />
        
        <!-- Heavy Gradient for Text Legibility -->
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent opacity-50"></div>
        
        <!-- Floating badge Top Right -->
        <div class="absolute top-4 right-4 z-20">
          <span class="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase bg-black/60 backdrop-blur-md text-white shadow-lg border border-white/10">
            {{ m.clasificacion || 'T.P' }}
          </span>
        </div>

        <!-- Content Bottom -->
        <div class="absolute inset-x-0 bottom-0 p-6 flex flex-col space-y-3 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <div class="space-y-1">
            <h3 class="font-black text-2xl leading-tight text-white drop-shadow-lg break-words">{{ m.titulo }}</h3>
            <div class="flex items-center gap-2 text-xs text-white/70 font-bold tracking-widest uppercase">
              <span>{{ m.duracion ? `${m.duracion} min` : 'Sin duración' }}</span>
              <span v-if="props.upcomingShowtimes(m.id, 1).length" class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-2"></span>
              <span v-if="props.upcomingShowtimes(m.id, 1).length" class="text-primary">{{ fmtTime(props.upcomingShowtimes(m.id, 1)[0].fechaHora) }}</span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <EmptyState v-else description="No hay películas que coincidan con tu búsqueda. Intenta con otro término." class="my-12" />
  </section>
</template>

<script setup lang="ts">
import { animate, stagger } from 'animejs'
import { onMounted, watch } from 'vue'

const props = defineProps<{
  loading: boolean
  error: string | null
  filtered: any[]
  upcomingShowtimes: (movieId: string, limit?: number) => any[]
}>()

const isClient = typeof window !== 'undefined'

const fmtTime = (dateStr: string) => {
  if (!dateStr) return '--:--'
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const animateGrid = () => {
  if (isClient) {
    animate('.billboard-card', {
      opacity: [0, 1],
      translateY: [40, 0],
      scale: [0.95, 1],
      duration: 800,
      delay: stagger(50),
      ease: 'outQuart'
    })
  }
}

onMounted(() => {
  if (!props.loading && props.filtered.length) {
    animateGrid()
  }
})

watch(() => props.loading, (newVal) => {
  if (!newVal && props.filtered.length) {
    setTimeout(animateGrid, 50)
  }
})
</script>
