<script setup>
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
  // Precargar horarios (no bloquea la UI)
  list.forEach(m => { fetchShowtimes(m.id).catch(() => {}) })
})
</script>

<template>
  <UContainer class="py-6">
    <!-- Encabezado -->
    <PageHeader
      title="Cartelera"
      subtitle="Elige tu película y reserva tus sillas"
    >
      <template #actions>
        <SearchBar
          v-model="q"
          placeholder="Buscar título…"
          class="w-full sm:w-72"
          @clear="clearQ"
        />
      </template>
    </PageHeader>

    <!-- Loading -->
    <LoadingSkeleton v-if="loading" :rows="6" class="mt-4" />

    <!-- Error -->
    <UAlert
      v-else-if="error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudo cargar la cartelera"
      class="mt-4"
    />

    <!-- Lista / vacío -->
    <template v-else>
      <EmptyState
        v-if="filtered.length === 0"
        class="mt-4"
        description="No hay películas que coincidan con tu búsqueda."
      />

      <div
        v-else
        class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <MovieCard
          v-for="m in filtered"
          :key="m.id"
          :movie="m"
          :next-showtimes="upcomingShowtimes(m.id, 3)"
        />
      </div>
    </template>
  </UContainer>
</template>
