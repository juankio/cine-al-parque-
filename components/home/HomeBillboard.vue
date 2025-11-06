<template>
  <section>
    <h2 class="text-xl font-semibold mb-3">En cartelera</h2>

    <div v-if="props.loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="i in 6" :key="i" class="h-56 rounded-2xl" />
    </div>

    <UAlert
      v-else-if="props.error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="props.error"
      title="No se pudo cargar la cartelera"
    />

    <div v-else-if="props.filtered.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="m in props.filtered"
        :key="m.id"
        class="rounded-2xl hover:bg-muted/30 transition"
      >
        <img :src="m.poster || '/favicon.ico'" class="w-full h-48 object-cover rounded-lg border border-default/60" />
        <div class="mt-3">
          <div class="font-semibold truncate">{{ m.titulo }}</div>
          <div class="text-xs text-muted">
            {{ m.clasificacion || '-' }} - {{ m.duracion ? `${m.duracion} min` : '-' }}
          </div>

          <div class="mt-2 flex flex-wrap gap-2">
            <UButton
              v-for="s in props.upcomingShowtimes(m.id, 3)"
              :key="s.id"
              size="xs"
              variant="outline"
              color="primary"
              :to="`/showtimes/${s.id}`"
            >
              {{ fmtTime(s.fechaHora) }}
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <EmptyState v-else description="No hay peliculas que coincidan con tu busqueda." />
  </section>
</template>

<script setup lang="ts">
import type { Movie, Showtime } from '~/composables/useMovies'

const props = defineProps<{
  loading: boolean
  error: string | null
  filtered: Movie[]
  upcomingShowtimes: (movieId: string, limit?: number) => Showtime[]
}>()

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}
</script>

