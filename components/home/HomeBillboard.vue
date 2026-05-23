<template>
  <section ref="sectionRef" class="space-y-6">
    <h2 class="text-2xl font-bold tracking-tight text-foreground">En cartelera</h2>

    <div v-if="props.loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="animate-pulse flex flex-col gap-3">
        <USkeleton class="h-64 w-full rounded-xl" />
        <USkeleton class="h-6 w-3/4 rounded" />
        <USkeleton class="h-4 w-1/2 rounded" />
      </div>
    </div>

    <UAlert
      v-else-if="props.error"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="props.error"
      title="No se pudo cargar la cartelera"
    />

    <div v-else-if="props.filtered.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="(m, idx) in props.filtered"
        :key="m.id"
        class="billboard-card flex flex-col h-full rounded-xl border border-border bg-background transition-all hover:shadow-md hover:border-primary/50 overflow-hidden opacity-0"
        :ui="{ body: { padding: 'p-0' } }"
      >
        <div class="aspect-[2/3] w-full overflow-hidden relative">
          <img :src="m.poster || '/favicon.ico'" class="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        </div>
        <div class="p-5 flex flex-col flex-1 space-y-3">
          <div class="space-y-1">
            <h3 class="font-semibold text-lg leading-tight line-clamp-1">{{ m.titulo }}</h3>
            <div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span class="font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs">{{ m.clasificacion || 'T.P' }}</span>
              <span>•</span>
              <span>{{ m.duracion ? `${m.duracion} min` : '-' }}</span>
            </div>
          </div>

          <div class="pt-2 mt-auto flex flex-wrap gap-2">
            <UButton
              v-for="s in props.upcomingShowtimes(m.id, 3)"
              :key="s.id"
              size="sm"
              variant="soft"
              color="primary"
              :to="`/showtimes/${s.id}`"
              class="font-medium"
            >
              {{ fmtTime(s.fechaHora) }}
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <EmptyState v-else description="No hay películas que coincidan con tu búsqueda." />
  </section>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'

const props = defineProps<{
  loading: boolean
  error: string | null
  filtered: any[]
  upcomingShowtimes: (movieId: string) => any[]
}>()

const isClient = typeof window !== 'undefined'

const animateGrid = () => {
  if (isClient) {
    import('animejs').then((module) => {
      const anime = module.default
      anime({
        targets: '.movie-card',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        delay: anime.stagger(150),
        easing: 'easeOutExpo'
      })
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

