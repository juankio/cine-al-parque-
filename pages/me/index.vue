<script setup lang="ts">
import type { HistoryFilters } from '~/composables/useMe'

definePageMeta({ auth: true, ssr: false })

const { user, ensureSession } = useAuth()
const { stats, history: meHistory, loading, error, fetchStats, fetchHistory } = useMe()

type HistoryView = 'all' | 'upcoming' | 'past'
const viewFilter = ref<HistoryView>('all')

const filterConfig: Record<HistoryView, { label: string; description: string; params?: HistoryFilters }> = {
  all: {
    label: 'Todas',
    description: 'Tus reservas confirmadas y pasadas.'
  },
  upcoming: {
    label: 'Próximas',
    description: 'Reservas pendientes o confirmadas para fechas futuras.',
    params: { upcoming: 'true' }
  },
  past: {
    label: 'Pasadas',
    description: 'Historial completo de funciones anteriores.',
    params: { upcoming: 'false' }
  }
}

const loadHistory = async () => {
  const cfg = filterConfig[viewFilter.value]
  await fetchHistory(cfg.params || {})
}

onMounted(async () => {
  await ensureSession()
  if (!user.value) {
    const redirect = encodeURIComponent('/me')
    return navigateTo(`/login?redirect=${redirect}`)
  }
  await Promise.all([fetchStats(), loadHistory()])
})

watch(viewFilter, () => {
  loadHistory()
})

const items = computed(() => meHistory.value?.items ?? [])
const visits = computed(() => stats.value?.visits ?? 0)
const spent = computed(() => stats.value?.totalSpent ?? 0)
const favorite = computed(() => stats.value?.favorite ?? null)
const lastVisit = computed(() => {
  const value = stats.value?.lastVisit
  return value ? new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : null
})
const historyTitle = computed(() => {
  switch (viewFilter.value) {
    case 'upcoming':
      return 'Tus próximas reservas'
    case 'past':
      return 'Reservas anteriores'
    default:
      return 'Historial de reservas'
  }
})
const historyDescription = computed(() => filterConfig[viewFilter.value].description)

const money = (n: number) => (n || 0).toLocaleString('es-CO')
const formatDate = (iso?: string) => {
  if (!iso) return 'Fecha pendiente'
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

const overviewCards = computed(() => ([
  {
    label: 'Visitas totales',
    value: visits.value,
    hint: 'Reservas confirmadas',
    icon: 'i-heroicons-ticket'
  },
  {
    label: 'Total gastado',
    value: `$ ${money(spent.value)}`,
    hint: 'Incluye combos',
    icon: 'i-heroicons-banknotes'
  },
  {
    label: 'Última visita',
    value: lastVisit.value || 'Aún no visitas',
    hint: lastVisit.value ? 'Hora local' : 'Reserva tu primera función',
    icon: 'i-heroicons-calendar-days'
  }
]))
</script>

<template>
  <UContainer class="py-8 space-y-8">
    <Motion
      tag="section"
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.35 } }"
    >
      <AccountHero
        :user-name="user?.name || user?.email || 'Usuario'"
        :last-visit="lastVisit"
        :favorite-title="favorite?.titulo || null"
      />
    </Motion>

    <AccountStatsGrid :cards="overviewCards" />

    <AccountFavoriteCard
      v-if="favorite"
      :title="favorite.titulo"
      :poster="favorite.poster || ''"
    />

    <LoadingSkeleton v-if="loading" :rows="3" />
    <UAlert
      v-else-if="error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudieron cargar tus datos"
    />

    <section v-else class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 class="text-2xl font-semibold">{{ historyTitle }}</h3>
          <p class="text-sm text-muted">{{ historyDescription }}</p>
        </div>
        <AccountHistoryFilters v-model="viewFilter" :config="filterConfig" />
      </div>

      <EmptyState
        v-if="items.length === 0"
        title="Sin reservas todavía"
        description="Cuando confirmes una función la verás registrada en este espacio."
      />

      <AccountHistoryList v-else :items="items" />
    </section>
  </UContainer>
</template>
