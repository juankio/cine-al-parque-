<script setup lang="ts">
definePageMeta({ ssr: false })

import { useShowtimes } from '~/composables/useShowtimes'
import { useMovies } from '~/composables/useMovies'
import { useCombos } from '~/composables/useCombos'

const q = ref('')

const LIVE_REFRESH_HOURS = 48
const LIVE_REFRESH_LIMIT = 16
const LIVE_REFRESH_INTERVAL = 120000

// ===== Cartelera =====
const { loading: moviesLoading, error: moviesError, movies, fetchMovies, fetchShowtimes, upcomingShowtimes } = useMovies()
const filteredMovies = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return movies.value || []
  return (movies.value || []).filter(m => (m.titulo || '').toLowerCase().includes(term))
})
const isSearching = computed(() => q.value.trim().length > 0)

// ===== En vivo hoy =====
const {
  loading: liveLoading,
  error: liveError,
  today: liveToday,
  tomorrow: liveTomorrow,
  fetchUpcoming,
  startAutoRefresh,
  stopAutoRefresh,
} = useShowtimes()
const liveSections = computed(() => [
  { id: 'today', label: 'Hoy', items: liveToday.value },
  { id: 'tomorrow', label: 'Manana', items: liveTomorrow.value },
].filter(section => section.items.length))

// ===== Combos =====
const {
  combos,
  loading: combosLoading,
  error: combosError,
  fetchCombos,
  refresh: refreshCombos,
} = useCombos()

const handleComboFocus = () => {
  fetchCombos().catch(() => {})
}
onMounted(async () => {
  // Peliculas
  const list = await fetchMovies()
  // precarga showtimes por pelicula (no bloquea UI)
  list.forEach(m => { fetchShowtimes(m.id).catch(() => {}) })

  // En vivo hoy
  await fetchUpcoming({ hours: LIVE_REFRESH_HOURS, limit: LIVE_REFRESH_LIMIT })
  startAutoRefresh({
    intervalMs: LIVE_REFRESH_INTERVAL,
    hours: LIVE_REFRESH_HOURS,
    limit: LIVE_REFRESH_LIMIT,
    silent: true,
    onlyOnChange: true,
  })

  // Combos
  await fetchCombos({ force: true })

  if (process.client) {
    window.addEventListener('focus', handleComboFocus)
  }
})
onBeforeUnmount(() => {
  stopAutoRefresh()
  if (process.client) {
    window.removeEventListener('focus', handleComboFocus)
  }
})
</script>

<template>
  <UContainer class="py-6 space-y-8">
    <HomeHero v-model="q" />

    <HomeBillboard
      v-if="isSearching"
      :loading="moviesLoading"
      :error="moviesError"
      :filtered="filteredMovies"
      :upcoming-showtimes="upcomingShowtimes"
    />

    <template v-else>
      <HomeLiveShowtimes
        :loading="liveLoading"
        :error="liveError"
        :sections="liveSections"
        @refresh="fetchUpcoming({ hours: LIVE_REFRESH_HOURS, limit: LIVE_REFRESH_LIMIT })"
      />

      <HomeCombos
        :loading="combosLoading"
        :error="combosError"
        :combos="combos"
        @refresh="refreshCombos()"
      />

      <HomeBillboard
        :loading="moviesLoading"
        :error="moviesError"
        :filtered="filteredMovies"
        :upcoming-showtimes="upcomingShowtimes"
      />
    </template>
  </UContainer>
</template>
