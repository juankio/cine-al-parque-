<script setup lang="ts">
definePageMeta({ auth: true, ssr: false })

const { user, ensureSession } = useAuth()
const { stats, history: meHistory, loading, error, fetchStats, fetchHistory } = useMe()

onMounted(async () => {
  await ensureSession()
  if (!user.value) {
    const redirect = encodeURIComponent('/me')
    return navigateTo(`/login?redirect=${redirect}`)
  }
  await Promise.all([fetchStats(), fetchHistory()])
})

const items   = computed(() => meHistory.value?.items ?? [])
const visits  = computed(() => stats.value?.visits ?? 0)
const spent   = computed(() => stats.value?.totalSpent ?? 0)
const favorite = computed(() => stats.value?.favorite ?? null)

const money = (n: number) => (n || 0).toLocaleString('es-CO')

// badge por estado
const statusMap: Record<string, { color: 'green'|'yellow'|'gray'|'red'; label: string }> = {
  paid:     { color: 'green',  label: 'Pagado' },
  pending:  { color: 'yellow', label: 'Pendiente' },
  expired:  { color: 'gray',   label: 'Expirado' },
  canceled: { color: 'red',    label: 'Cancelado' }
}
const statusConf = (s?: string) => statusMap[s || ''] || { color: 'gray', label: s || '—' }
</script>

<template>
  <UContainer class="py-6 space-y-8">
    <!-- Header -->
    <PageHeader
      title="Mi cuenta"
      :subtitle="`Bienvenido, ${user?.name || user?.email} 👋`"
    />

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-3">
      <UCard class="p-4 text-center">
        <p class="text-sm text-muted">Visitas totales</p>
        <p class="text-2xl font-bold">{{ visits }}</p>
      </UCard>

      <UCard class="p-4 text-center">
        <p class="text-sm text-muted">Total gastado</p>
        <p class="text-2xl font-bold">$ {{ money(spent) }}</p>
      </UCard>

      <UCard v-if="favorite" class="p-4 text-center">
        <p class="text-sm text-muted">Peli favorita</p>
        <p class="text-lg font-semibold">{{ favorite.titulo }}</p>
        <img
          :src="favorite.poster || '/placeholder.png'"
          alt=""
          class="mx-auto mt-2 h-24 w-auto rounded-lg object-cover border border-default/50"
        />
      </UCard>
    </div>

    <!-- Loading / Error -->
    <LoadingSkeleton v-if="loading" :rows="3" />
    <UAlert
      v-else-if="error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudieron cargar tus datos"
    />

    <!-- Historial -->
    <template v-else>
      <h3 class="text-xl font-semibold">Historial de reservas</h3>

      <EmptyState
        v-if="items.length === 0"
        description="No tienes reservas todavía."
      />

      <div v-else class="grid gap-4">
        <ItemCard v-for="r in items" :key="r.id">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h4 class="font-semibold truncate">
                🎬 {{ r.movie?.titulo || 'Sin título' }}
              </h4>
              <p class="text-sm text-muted mt-1">
                Sala {{ r.showtime?.sala || '—' }} —
                {{ new Date(r.showtime?.fechaHora || Date.now()).toLocaleString('es-CO') }}
              </p>
              <p class="text-sm text-muted">Asientos: {{ (r.seats || []).join(', ') || '—' }}</p>
              <p class="text-sm text-muted">Total: $ {{ money(r.total || 0) }}</p>

              <div v-if="r.cart?.length" class="mt-2 text-sm text-muted">
                <p>🍔 Comida:</p>
                <ul class="list-disc ml-5">
                  <li v-for="(c, i) in r.cart" :key="i">
                    {{ c.qty }} × {{ c.nombre }} — $ {{ money(c.unitPrice * c.qty) }}
                  </li>
                </ul>
              </div>

              <p v-if="r.status === 'pending' && r.expiresAt" class="text-xs text-muted mt-2">
                Expira: {{ new Date(r.expiresAt).toLocaleTimeString('es-CO') }}
              </p>
            </div>

            <UBadge
              :color="statusConf(r.status).color"
              variant="subtle"
              class="shrink-0"
            >
              {{ statusConf(r.status).label }}
            </UBadge>
          </div>
        </ItemCard>
      </div>
    </template>
  </UContainer>
</template>
