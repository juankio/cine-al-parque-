<template>
  <section class="mx-auto max-w-6xl p-4 space-y-6">
    <!-- Hero / Encabezado -->
    <header class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-foreground">Cartelera</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">Elige tu película y reserva tus sillas</p>
      </div>

      <!-- Buscador -->
      <div class="flex items-center gap-2">
        <input
          v-model.trim="q"
          type="search"
          placeholder="Buscar título…"
          class="w-64 rounded-xl border border-theme bg-surface px-3 py-2 text-sm outline-none focus:ring"
        />
        <button @click="clearQ" v-if="q" class="rounded-xl border border-theme px-3 py-2 text-sm">Limpiar</button>
      </div>
    </header>

    <!-- Estado -->
    <div v-if="loading" class="text-neutral-500">Cargando cartelera…</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <!-- Lista -->
    <div v-else>
      <div v-if="filtered.length === 0" class="text-neutral-500">No hay películas que coincidan.</div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MovieCard
          v-for="m in filtered"
          :key="m.id"
          :movie="m"
          :next-showtimes="upcomingShowtimes(m.id, 3)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import MovieCard from '~/components/MovieCard.vue'
import { useMovies } from '~/composables/useMovies'

definePageMeta({ ssr: false }) // en público normalmente puede ser SSR:true; si prefieres, quítalo

const { movies, loading, error, fetchMovies, fetchShowtimes, upcomingShowtimes } = useMovies()
const q = ref('')

const filtered = computed(() => {
  const term = q.value.toLowerCase()
  if (!term) return movies.value
  return (movies.value || []).filter(m => m.titulo.toLowerCase().includes(term))
})

function clearQ() {
  q.value = ''
}

// Carga cartelera + precarga de horarios por película (en paralelo, sin bloquear UI)
onMounted(async () => {
  const list = await fetchMovies()
  // Pre-cargar horarios de todas (dispara en paralelo pero no esperamos a todas)
  list.forEach(m => { fetchShowtimes(m.id).catch(() => {}) })
})
</script>
