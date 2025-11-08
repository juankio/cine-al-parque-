<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ReservationsHeader from '~/components/reservations/ReservationsHeader.vue'
import ReservationCard from '~/components/reservations/ReservationCard.vue'
import { useReservations } from '~/composables/useReservations'

definePageMeta({ ssr: false })

const { reservations, loading, error, confirmingId, fetchReservations, confirmReservation } = useReservations()

const summary = computed(() => {
  let pending = 0
  let paid = 0
  for (const reservation of reservations.value) {
    if (reservation.status === 'pending') pending++
    if (reservation.status === 'paid') paid++
  }
  return { total: reservations.value.length, pending, paid }
})

const hasAny = computed(() => reservations.value.length > 0)

const skeletons = computed(() =>
  loading.value && !hasAny.value ? Array.from({ length: 2 }) : []
)

const activeReservations = computed(() =>
  reservations.value.filter((reservation) => reservation.status === 'pending' || reservation.status === 'paid')
)

const historicalReservations = computed(() =>
  reservations.value.filter((reservation) => reservation.status === 'expired' || reservation.status === 'canceled')
)

const hasActive = computed(() => activeReservations.value.length > 0)
const hasHistorical = computed(() => historicalReservations.value.length > 0)

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Sin fecha'
  return new Date(value).toLocaleString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchReservations().catch(() => {})
})

const handleRefresh = () => fetchReservations()
const handleConfirm = (id: string) => confirmReservation(id).catch(() => {})
</script>

<template>
  <UContainer class="py-10 space-y-8">
    <ReservationsHeader :summary="summary" :loading="loading" @refresh="handleRefresh" />

    <UAlert
      v-if="error"
      color="red"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No pudimos cargar tus reservas"
    >
      <template #actions>
        <UButton size="xs" color="primary" variant="soft" @click="handleRefresh()">Reintentar</UButton>
      </template>
    </UAlert>

    <div v-if="skeletons.length" class="space-y-4">
      <UCard v-for="(_, idx) in skeletons" :key="idx" class="rounded-3xl border border-default/30">
        <USkeleton class="h-6 w-1/3 mb-3" />
        <USkeleton class="h-4 w-1/2 mb-2" />
        <USkeleton class="h-4 w-full mb-1" />
        <USkeleton class="h-4 w-2/3" />
      </UCard>
    </div>

    <EmptyState
      v-else-if="!hasAny"
      icon="i-heroicons-ticket"
      title="Aun no tienes reservaciones visibles"
      description="Cuando confirmes una funcion veras aqui tus entradas, combos y codigos QR."
    >
      <template #actions>
        <UButton to="/" color="primary" icon="i-heroicons-film">Explorar cartelera</UButton>
      </template>
    </EmptyState>

    <div v-else class="space-y-8">
      <section v-if="hasActive" class="space-y-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-ticket" class="text-primary" />
          <h2 class="text-sm font-semibold uppercase tracking-wide text-muted">Reservas activas</h2>
        </div>
        <div class="space-y-5">
          <ReservationCard
            v-for="reservation in activeReservations"
            :key="reservation.id"
            :reservation="reservation"
            :confirming="confirmingId === reservation.id"
            @confirm="handleConfirm"
          />
        </div>
      </section>

      <section v-if="hasHistorical" class="space-y-3">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-archive-box" class="text-muted" />
          <h2 class="text-sm font-semibold uppercase tracking-wide text-muted">Historial sin QR</h2>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <UCard
            v-for="reservation in historicalReservations"
            :key="reservation.id"
            class="rounded-2xl border border-dashed border-default/50 bg-muted/5"
          >
            <div class="flex items-start justify-between gap-3 mb-2">
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-muted">
                  Reserva #{{ reservation.id.slice(-6).toUpperCase() }}
                </p>
                <p class="text-sm text-muted">
                  {{ formatDateTime(reservation.showtime?.fechaHora) }}
                </p>
              </div>
              <UBadge color="rose" variant="soft">
                {{ reservation.status === 'expired' ? 'Expirada' : 'Cancelada' }}
              </UBadge>
            </div>
            <p class="text-sm text-default">
              Sillas: {{ reservation.seats.join(', ') || 'N/D' }}
            </p>
            <p class="text-xs text-muted mt-1">
              {{ reservation.status === 'expired'
                ? 'El hold vencio antes de confirmar el pago.'
                : 'Se cancelo manualmente esta reserva.' }}
            </p>
          </UCard>
        </div>
      </section>
    </div>
  </UContainer>
</template>
