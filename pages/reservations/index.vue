<script setup lang="ts">
import { computed, onMounted, watch, nextTick } from 'vue'
import { animate, stagger } from 'animejs'
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
const skeletons = computed(() => loading.value && !hasAny.value ? Array.from({ length: 2 }) : [])

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

const triggerAnimations = async () => {
  await nextTick()
  if (typeof window !== 'undefined') {
    animate('.res-section-title', {
      opacity: [0, 1],
      translateX: [-20, 0],
      duration: 600,
      ease: 'outQuart'
    })
    
    animate('.res-card', {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
      delay: stagger(100),
      ease: 'outExpo'
    })
  }
}

onMounted(() => {
  fetchReservations().then(() => {
    triggerAnimations()
  }).catch(() => {})
})

watch(reservations, () => {
  triggerAnimations()
})

const handleRefresh = () => fetchReservations().then(triggerAnimations)
const handleConfirm = (id: string) => confirmReservation(id).catch(() => {})
</script>

<template>
  <UContainer class="py-10 space-y-10">
    <ReservationsHeader :summary="summary" :loading="loading" @refresh="handleRefresh" />

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No pudimos cargar tus reservas"
    >
      <template #actions>
        <UButton size="xs" color="primary" variant="soft" @click="handleRefresh()">Reintentar</UButton>
      </template>
    </UAlert>

    <div v-if="skeletons.length" class="space-y-4">
      <UCard v-for="(_, idx) in skeletons" :key="idx" class="rounded-3xl border border-border/50">
        <USkeleton class="h-6 w-1/3 mb-3" />
        <USkeleton class="h-4 w-1/2 mb-2" />
        <USkeleton class="h-4 w-full mb-1" />
        <USkeleton class="h-4 w-2/3" />
      </UCard>
    </div>

    <EmptyState
      v-else-if="!hasAny"
      icon="i-heroicons-ticket"
      title="Aún no tienes reservaciones visibles"
      description="Cuando confirmes una función verás aquí tus entradas, combos y códigos QR."
      class="opacity-0 res-card"
    >
      <template #actions>
        <UButton to="/" color="primary" variant="soft" icon="i-heroicons-film">Explorar cartelera</UButton>
      </template>
    </EmptyState>

    <div v-else class="space-y-10">
      <section v-if="hasActive" class="space-y-5">
        <div class="flex items-center gap-2 opacity-0 res-section-title">
          <div class="p-1.5 rounded-lg bg-primary/10 text-primary">
            <UIcon name="i-heroicons-ticket" class="w-5 h-5" />
          </div>
          <h2 class="text-sm font-bold uppercase tracking-widest text-foreground">Reservas activas</h2>
        </div>
        <div class="space-y-5">
          <div v-for="reservation in activeReservations" :key="reservation.id" class="res-card opacity-0">
            <ReservationCard
              :reservation="reservation"
              :confirming="confirmingId === reservation.id"
              @confirm="handleConfirm"
            />
          </div>
        </div>
      </section>

      <section v-if="hasHistorical" class="space-y-5">
        <div class="flex items-center gap-2 opacity-0 res-section-title">
          <div class="p-1.5 rounded-lg bg-muted text-muted-foreground">
            <UIcon name="i-heroicons-archive-box" class="w-5 h-5" />
          </div>
          <h2 class="text-sm font-bold uppercase tracking-widest text-muted-foreground">Historial / Inactivas</h2>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <UCard
            v-for="reservation in historicalReservations"
            :key="reservation.id"
            class="res-card opacity-0 rounded-2xl border border-dashed border-border bg-muted/10"
          >
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Reserva #{{ reservation.id.slice(-6).toUpperCase() }}
                </p>
                <p class="text-sm font-medium text-foreground">
                  {{ formatDateTime(reservation.showtime?.fechaHora) }}
                </p>
              </div>
              <UBadge color="error" variant="soft" size="sm" class="uppercase text-[10px] font-bold tracking-wider">
                {{ reservation.status === 'expired' ? 'Expirada' : 'Cancelada' }}
              </UBadge>
            </div>
            <p class="text-sm text-foreground font-medium flex items-center gap-1.5">
              <UIcon name="i-heroicons-users" class="w-4 h-4 text-muted-foreground" />
              Sillas: {{ reservation.seats.join(', ') || 'N/D' }}
            </p>
            <p class="text-xs text-muted-foreground mt-2 border-t border-border/50 pt-2">
              {{ reservation.status === 'expired'
                ? 'El tiempo de espera finalizó sin confirmar el pago.'
                : 'La reserva fue cancelada manualmente.' }}
            </p>
          </UCard>
        </div>
      </section>
    </div>
  </UContainer>
</template>
