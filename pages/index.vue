<script setup lang="ts">
definePageMeta({ ssr: false })

import { useShowtimes } from '~/composables/useShowtimes'
import { useMovies } from '~/composables/useMovies'

const q = ref('')

// ===== Cartelera =====
const { loading: moviesLoading, error: moviesError, movies, fetchMovies, fetchShowtimes, upcomingShowtimes } = useMovies()
const filteredMovies = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return movies.value || []
  return (movies.value || []).filter(m => (m.titulo || '').toLowerCase().includes(term))
})

// ===== En vivo hoy (showtimes públicos) =====
const {
  loading: liveLoading,
  error: liveError,
  list: live,
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

// ===== Combos (menú) =====
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
    // Orden simple por precio desc para “wow”
    combos.value = items.sort((a, b) => (b?.precio || 0) - (a?.precio || 0))
  } catch (e: any) {
    combosError.value = e?.data?.message || e?.message || 'No se pudieron cargar los combos'
    combos.value = []
  } finally {
    combosLoading.value = false
  }
}

function money(n?: number) { return (Number(n || 0)).toLocaleString('es-CO') }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) }

onMounted(async () => {
  // Películas
  const list = await fetchMovies()
  // precarga showtimes por película (no bloquea UI)
  list.forEach(m => { fetchShowtimes(m.id).catch(() => {}) })

  // En vivo hoy
  await fetchUpcoming(48, 16)
  startAutoRefresh(15000, 48, 16)

  // Combos
  await fetchCombos()
})
onBeforeUnmount(() => {
  stopAutoRefresh()
})
</script>

<template>
  <UContainer class="py-6 space-y-8">
    <!-- HERO -->
    <UCard class="rounded-2xl p-6 bg-gradient-to-r from-primary/10 to-transparent border-none">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Cine al Parque</h1>
          <p class="text-sm text-muted mt-1">
            Compra tu combo, elige función y reserva tu mesa en minutos.
          </p>
        </div>
        <UInput
          v-model.trim="q"
          class="w-full md:w-96"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Buscar película…"
        />
      </div>
    </UCard>

    <!-- EN VIVO HOY -->
    <section>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          <UIcon name="i-heroicons-bolt" class="text-primary" /> En vivo hoy
        </h2>
        <UButton
          v-if="liveSections.length"
          size="xs"
          variant="ghost"
          color="gray"
          :loading="liveLoading"
          @click="fetchUpcoming(48, 16)"
        >Actualizar</UButton>
      </div>

      <div v-if="liveLoading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 6" :key="i" class="h-20 rounded-xl" />
      </div>

      <UAlert
        v-else-if="liveError"
        color="gray" variant="soft"
        icon="i-heroicons-exclamation-triangle"
        :description="liveError"
        title="No se pudieron cargar las funciones"
      />

      <div v-else-if="liveSections.length" class="space-y-5">
        <div v-for="section in liveSections" :key="section.id" class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">{{ section.label }}</h3>
          </div>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UCard v-for="s in section.items" :key="s._id" class="rounded-2xl">
              <div class="flex gap-3 items-start">
                <img :src="s.poster || '/favicon.ico'" class="w-14 h-20 object-cover rounded-lg border border-default/60" />
                <div class="min-w-0 flex-1">
                  <div class="font-medium truncate">{{ s.titulo || 'Sin título' }}</div>
                  <div class="text-xs text-muted mt-0.5">
                    {{ fmtTime(s.fechaHora) }} · Sala {{ s.sala || '—' }} · $ {{ money(s.price) }}
                  </div>
                  <div class="mt-2">
                    <UButton
                      :to="`/showtimes/${s._id}`"
                      size="xs"
                      color="primary"
                      variant="solid"
                    >Reservar</UButton>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>

      <EmptyState v-else description="No hay funciones próximas en las próximas 48 horas." />
    </section>

    <!-- COMBOS DESTACADOS -->
    <section>
      <h2 class="text-xl font-semibold mb-3 flex items-center gap-2">
        <UIcon name="i-heroicons-fire" class="text-primary" /> Combos para hoy
      </h2>

      <div v-if="combosLoading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 6" :key="i" class="h-28 rounded-2xl" />
      </div>

      <UAlert
        v-else-if="combosError"
        color="gray" variant="soft"
        icon="i-heroicons-exclamation-triangle"
        :description="combosError"
        title="No se pudieron cargar los combos"
      />

      <div v-else-if="combos.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <UCard v-for="c in combos" :key="c._id" class="rounded-2xl hover:bg-primary/5 transition">
          <div class="flex items-start justify-between">
            <div class="min-w-0">
              <div class="font-semibold truncate">{{ c.nombre }}</div>
              <div class="text-xs text-muted mt-0.5">
                $ {{ money(c.precio) }} <span v-if="c.categoria">· {{ c.categoria }}</span>
              </div>
              <div class="mt-1 flex flex-wrap gap-1">
                <UBadge v-for="t in (c.tags || [])" :key="t" size="xs" variant="soft">#{{ t }}</UBadge>
              </div>
            </div>
            <UButton size="xs" color="primary" :to="`/menu`" variant="outline">Ver</UButton>
          </div>
        </UCard>
      </div>

      <EmptyState v-else description="Aún no hay combos disponibles." />
    </section>

    <!-- CARTELERA -->
    <section>
      <h2 class="text-xl font-semibold mb-3">En cartelera</h2>

      <div v-if="moviesLoading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 6" :key="i" class="h-56 rounded-2xl" />
      </div>

      <UAlert
        v-else-if="moviesError"
        color="gray" variant="soft"
        icon="i-heroicons-exclamation-triangle"
        :description="moviesError"
        title="No se pudo cargar la cartelera"
      />

      <div v-else-if="filteredMovies.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="m in filteredMovies"
          :key="m.id"
          class="rounded-2xl hover:bg-muted/30 transition"
        >
          <img :src="m.poster || '/favicon.ico'" class="w-full h-48 object-cover rounded-lg border border-default/60" />
          <div class="mt-3">
            <div class="font-semibold truncate">{{ m.titulo }}</div>
            <div class="text-xs text-muted">
              {{ m.clasificacion || '—' }} · {{ m.duracion ? `${m.duracion} min` : '—' }}
            </div>

            <div class="mt-2 flex flex-wrap gap-2">
              <UButton
                v-for="s in upcomingShowtimes(m.id, 3)"
                :key="s.id"
                size="xs" variant="outline" color="primary"
                :to="`/showtimes/${s.id}`"
              >
                {{ fmtTime(s.fechaHora) }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <EmptyState v-else description="No hay películas que coincidan con tu búsqueda." />
    </section>
  </UContainer>
</template>
