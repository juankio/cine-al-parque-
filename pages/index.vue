<script setup lang="ts">
definePageMeta({ ssr: false })

import { useShowtimes } from '~/composables/useShowtimes'
import { useMovies } from '~/composables/useMovies'
import { useCombos } from '~/composables/useCombos'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const q = ref('')

const LIVE_REFRESH_HOURS = 48
const LIVE_REFRESH_LIMIT = 16
const LIVE_REFRESH_INTERVAL = 120000

// ===== Cartelera =====
const { loading: moviesLoading, error: moviesError, movies, fetchMovies, upcomingShowtimes } = useMovies()
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
  { id: 'tomorrow', label: 'Mañana', items: liveTomorrow.value },
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
  await fetchMovies().catch(() => {})
  await fetchUpcoming({ hours: LIVE_REFRESH_HOURS, limit: LIVE_REFRESH_LIMIT }).catch(() => {})
  
  startAutoRefresh({
    intervalMs: LIVE_REFRESH_INTERVAL,
    hours: LIVE_REFRESH_HOURS,
    limit: LIVE_REFRESH_LIMIT,
    silent: true,
    onlyOnChange: true,
  })

  await fetchCombos({ force: true }).catch(() => {})

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleComboFocus)
  }
})

onBeforeUnmount(() => {
  stopAutoRefresh()
  if (typeof window !== 'undefined') {
    window.removeEventListener('focus', handleComboFocus)
  }
})
</script>

<template>
  <div class="relative min-h-screen bg-[#020202] text-foreground selection:bg-primary/30 selection:text-primary pb-24 overflow-hidden">
    
    <!-- Hero Full Bleed (De lado a lado sin restricciones) -->
    <HomeHero v-model="q" />

    <!-- Resto del contenido con contenedor -->
    <UContainer class="relative z-10 -mt-10 space-y-24">
      <template v-if="isSearching">
        <div id="cartelera" class="h-0" aria-hidden="true" />
        <HomeBillboard
          :loading="moviesLoading"
          :error="moviesError"
          :filtered="filteredMovies"
          :upcoming-showtimes="upcomingShowtimes"
        />
      </template>

      <template v-else>
        <!-- En vivo hoy -->
        <HomeLiveShowtimes
          :loading="liveLoading"
          :error="liveError"
          :sections="liveSections"
          @refresh="fetchUpcoming({ hours: LIVE_REFRESH_HOURS, limit: LIVE_REFRESH_LIMIT })"
        />

        <!-- Combos -->
        <HomeCombos
          :loading="combosLoading"
          :error="combosError"
          :combos="combos"
          @refresh="refreshCombos()"
        />

        <div id="cartelera" class="h-0" aria-hidden="true" />
        
        <!-- Cartelera General -->
        <HomeBillboard
          :loading="moviesLoading"
          :error="moviesError"
          :filtered="filteredMovies"
          :upcoming-showtimes="upcomingShowtimes"
        />
      </template>
    </UContainer>
  </div>
</template>
