<template>
  <UContainer class="py-6">
    <!-- Hero / Encabezado -->
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight">Cartelera</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">Elige tu película y reserva tus sillas</p>
      </div>

      <!-- Buscador -->
      <div class="flex items-center gap-2">
        <UInput
          v-model.trim="q"
          type="search"
          placeholder="Buscar título…"
          icon="i-heroicons-magnifying-glass-20-solid"
          class="w-64"
        />
        <UButton v-if="q" variant="ghost" color="gray" @click="clearQ">
          Limpiar
        </UButton>
      </div>
    </header>

    <!-- Estado: loading -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="p-4 rounded-2xl border border-default">
        <div class="flex gap-4">
          <USkeleton class="h-40 w-28 rounded-xl" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-5 w-2/3" />
            <USkeleton class="h-4 w-1/2" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-5/6" />
            <div class="flex gap-2 pt-2">
              <USkeleton class="h-7 w-20" />
              <USkeleton class="h-7 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado: error -->
    <UAlert
      v-else-if="error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudo cargar la cartelera"
      class="mb-4"
    />

    <!-- Lista -->
    <div v-else>
      <div v-if="filtered.length === 0" class="text-neutral-500">
        No hay películas que coincidan.
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MovieCard
          v-for="m in filtered"
          :key="m.id"
          :movie="m"
          :next-showtimes="upcomingShowtimes(m.id, 3)"
        />
      </div>
    </div>
  </UContainer>
</template>

<script setup>
import MovieCard from '~/components/MovieCard.vue'
import { useMovies } from '~/composables/useMovies'

definePageMeta({ ssr: false })

const { movies, loading, error, fetchMovies, fetchShowtimes, upcomingShowtimes } = useMovies()
const q = ref('')

const filtered = computed(() => {
  const term = q.value.toLowerCase()
  if (!term) return movies.value
  return (movies.value || []).filter(m => m.titulo.toLowerCase().includes(term))
})

function clearQ () {
  q.value = ''
}

onMounted(async () => {
  const list = await fetchMovies()
  list.forEach(m => { fetchShowtimes(m.id).catch(() => {}) })
})
</script>
