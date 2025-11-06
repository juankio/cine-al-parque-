<script setup lang="ts">
definePageMeta({ ssr: false })

import { useShowtimes } from '~/composables/useShowtimes'
import { useMovies } from '~/composables/useMovies'

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
type ComboItem = { _id: string; nombre: string; precio: number; categoria?: string; tags?: string[] }
const combos = ref<ComboItem[]>([])
const combosLoading = ref(false)
const combosError = ref<string | null>(null)

async function fetchCombos() {
  combosLoading.value = true
  combosError.value = null
  try {
    const res = await $fetch<any>('/api/menu-items', {
      query: { page: 1, pageSize: 6, categoria: 'Combo' },
    })
    const items: any[] = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []
    combos.value = items.sort((a, b) => (b?.precio || 0) - (a?.precio || 0))
  } catch (e: any) {
    combosError.value = e?.data?.message || e?.message || 'No se pudieron cargar los combos'
    combos.value = []
  } finally {
    combosLoading.value = false
  }
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
  await fetchCombos()
})
onBeforeUnmount(() => {
  stopAutoRefresh()
})
</script>

<template>
  <UContainer class="py-6 space-y-8">
    <HomeHero v-model="q" class="animate-home-hero animate-home-section" style="--section-delay: 0s" />

    <HomeBillboard
      v-if="isSearching"
      class="animate-home-section"
      style="--section-delay: 0.1s"
      :loading="moviesLoading"
      :error="moviesError"
      :filtered="filteredMovies"
      :upcoming-showtimes="upcomingShowtimes"
    />

    <template v-else>
      <HomeLiveShowtimes
        class="animate-home-section"
        style="--section-delay: 0.1s"
        :loading="liveLoading"
        :error="liveError"
        :sections="liveSections"
        @refresh="fetchUpcoming({ hours: LIVE_REFRESH_HOURS, limit: LIVE_REFRESH_LIMIT })"
      />

      <HomeCombos
        class="animate-home-section"
        style="--section-delay: 0.2s"
        :loading="combosLoading"
        :error="combosError"
        :combos="combos"
      />

      <HomeBillboard
        class="animate-home-section"
        style="--section-delay: 0.3s"
        :loading="moviesLoading"
        :error="moviesError"
        :filtered="filteredMovies"
        :upcoming-showtimes="upcomingShowtimes"
      />
    </template>
  </UContainer>
</template>
