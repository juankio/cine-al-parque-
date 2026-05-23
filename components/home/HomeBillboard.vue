<template>
  <section ref="sectionRef" class="space-y-8 relative">
    <div class="flex items-center justify-between border-b border-border/50 pb-5">
      <h2 class="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
        <UIcon name="i-heroicons-film" class="text-primary w-8 h-8" />
        En Cartelera
      </h2>
    </div>

    <div v-if="props.loading" class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div v-for="i in 8" :key="i" class="animate-pulse flex flex-col gap-4">
        <USkeleton class="aspect-[2/3] w-full rounded-2xl" />
        <div class="space-y-3 px-1">
          <USkeleton class="h-6 w-3/4 rounded-md" />
          <USkeleton class="h-4 w-1/2 rounded-md" />
        </div>
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

    <div v-else-if="props.filtered.length" class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="(m, idx) in props.filtered"
        :key="m.id"
        class="billboard-card relative group flex flex-col h-full rounded-2xl bg-background/50 backdrop-blur-sm border border-border/40 hover:border-primary/40 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl opacity-0"
      >
        <!-- Poster container -->
        <div class="aspect-[2/3] w-full overflow-hidden relative bg-muted">
          <div class="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>
          <img :src="m.poster || '/favicon.ico'" class="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" loading="lazy" />
          
          <!-- Floating badge -->
          <div class="absolute top-4 right-4 z-20">
            <span class="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase bg-background/80 backdrop-blur-md text-foreground shadow-lg border border-border/50">
              {{ m.clasificacion || 'T.P' }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 flex flex-col flex-1 space-y-5 relative z-20 -mt-20">
          <div class="space-y-3">
            <h3 class="font-black text-2xl leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors drop-shadow-md">{{ m.titulo }}</h3>
            <div class="flex items-center gap-2 text-sm text-muted-foreground font-bold tracking-wide">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 opacity-70" />
              <span>{{ m.duracion ? `${m.duracion} min` : 'Sin duración' }}</span>
            </div>
          </div>

          <!-- Showtimes -->
          <div class="pt-4 mt-auto flex flex-col gap-4 border-t border-border/40">
            <p class="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Próximas funciones</p>
            <div class="flex flex-wrap gap-2.5">
              <template v-if="props.upcomingShowtimes(m.id, 3).length">
                <UButton
                  v-for="s in props.upcomingShowtimes(m.id, 3)"
                  :key="s.id"
                  size="sm"
                  variant="soft"
                  color="primary"
                  :to="`/showtimes/${s.id}`"
                  class="font-bold tracking-wide rounded-xl px-4 py-2 hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  {{ fmtTime(s.fechaHora) }}
                </UButton>
              </template>
              <span v-else class="text-sm text-muted-foreground font-medium flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-xl w-full border border-border/50">
                <UIcon name="i-heroicons-calendar" class="w-5 h-5" /> Sin funciones hoy
              </span>
            </div>
          </div>
        </div>
      </div>
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
      duration: 800,
      delay: stagger(100),
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
