<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useReservations } from '~/composables/useReservations'
import type { ReservationSummary } from '~/types/reservations'

definePageMeta({ ssr: false })

const reservationsStore = useReservations()
const {
  reservations,
  loading,
  error,
  hasReservations,
  pendingReservations,
  confirmingId,
  fetchReservations,
  confirmReservation
} = reservationsStore

onMounted(() => {
  fetchReservations().catch(() => {})
})

const summaryStats = computed(() => ({
  total: reservations.value.length,
  pending: pendingReservations.value.length,
  paid: reservations.value.filter((res) => res.status === 'paid').length
}))

const statusMeta: Record<
  ReservationSummary['status'],
  { label: string; color: 'gray' | 'green' | 'amber' | 'rose' }
> = {
  pending: { label: 'Pendiente', color: 'amber' },
  paid: { label: 'Pagada', color: 'green' },
  expired: { label: 'Expirada', color: 'rose' },
  canceled: { label: 'Cancelada', color: 'gray' }
}

const formatMoney = (value?: number) => `$ ${Number(value || 0).toLocaleString('es-CO')}`
const formatDateTime = (value?: string | null, withTime = true) => {
  if (!value) return 'Por definir'
  return new Date(value).toLocaleString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: withTime ? '2-digit' : undefined,
    minute: withTime ? '2-digit' : undefined
  })
}

const handleConfirm = (id: string) => {
  confirmReservation(id).catch(() => {})
}

const loadingSkeletons = computed(() =>
  loading.value && !hasReservations.value ? Array.from({ length: 2 }) : []
)
</script>

<template>
  <UContainer class="py-10 space-y-8">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-3">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <UIcon name="i-heroicons-arrow-left" />
          Volver al inicio
        </NuxtLink>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">Reservas</p>
          <h1 class="text-3xl font-bold">Mis reservas</h1>
          <p class="text-sm text-muted max-w-2xl">
            Revisa el estado de tus holds, confirma pagos pendientes y consulta los detalles de cada funci��n.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-heroicons-arrow-path"
          :loading="loading"
          @click="fetchReservations()"
        >
          Actualizar
        </UButton>
        <UButton color="primary" variant="ghost" to="/menu" icon="i-heroicons-arrow-top-right-on-square">
          Ver combos
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="error"
      color="red"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No pudimos cargar tus reservas"
    >
      <template #actions>
        <UButton size="xs" color="primary" variant="soft" @click="fetchReservations()">Reintentar</UButton>
      </template>
    </UAlert>

    <div class="grid gap-4 sm:grid-cols-3">
      <UCard
        v-for="(stat, label) in { Activas: summaryStats.pending, Confirmadas: summaryStats.paid, Total: summaryStats.total }"
        :key="label"
        class="rounded-2xl border border-default/40 bg-white/90 dark:bg-slate-900/90"
      >
        <p class="text-xs uppercase tracking-[0.2em] text-muted">{{ label }}</p>
        <p class="text-3xl font-semibold">{{ stat }}</p>
      </UCard>
    </div>

    <div v-if="loadingSkeletons.length" class="space-y-4">
      <UCard v-for="(_, idx) in loadingSkeletons" :key="idx" class="rounded-3xl border border-default/30">
        <USkeleton class="h-6 w-1/3 mb-3" />
        <USkeleton class="h-4 w-1/2 mb-2" />
        <USkeleton class="h-4 w-full mb-1" />
        <USkeleton class="h-4 w-2/3" />
      </UCard>
    </div>

    <EmptyState
      v-else-if="!hasReservations"
      icon="i-heroicons-ticket"
      title="A��n no tienes reservaciones visibles"
      description="Cuando confirmes una funci��n, ver��s aqu�� el detalle de tus entradas y combos."
    >
      <template #actions>
        <UButton to="/" color="primary" icon="i-heroicons-film">Explorar cartelera</UButton>
      </template>
    </EmptyState>

    <div v-else class="space-y-5">
      <UCard
        v-for="reservation in reservations"
        :key="reservation.id"
        class="rounded-3xl border border-default/40 bg-white/90 dark:bg-slate-900/80"
      >
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.35em] text-primary/70">
                Reserva #{{ reservation.id.slice(-6).toUpperCase() }}
              </p>
              <h2 class="text-xl font-semibold">
                {{ reservation.showtime?.movieTitle || 'Funci��n sin t��tulo' }}
              </h2>
              <p class="text-sm text-muted">
                {{ formatDateTime(reservation.showtime?.fechaHora) }}
                <span v-if="reservation.showtime?.sala">• Sala {{ reservation.showtime?.sala }}</span>
              </p>
            </div>
            <div class="text-right space-y-2">
              <UBadge :color="statusMeta[reservation.status].color" size="sm">
                {{ statusMeta[reservation.status].label }}
              </UBadge>
              <p class="text-xs text-muted">
                Creada: {{ formatDateTime(reservation.createdAt, false) }}
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-6 md:grid-cols-[1.2fr,1fr]">
          <div class="space-y-4">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-muted">Sillas</p>
              <p class="text-base font-semibold text-default">
                {{ reservation.seats.join(', ') }}
              </p>
              <p class="text-xs text-muted">
                {{ reservation.seats.length }} {{ reservation.seats.length === 1 ? 'silla' : 'sillas' }}
              </p>
            </div>

            <div v-if="reservation.cart.length">
              <p class="text-xs uppercase tracking-[0.3em] text-muted">Snacks &amp; combos</p>
              <ul class="text-sm text-muted space-y-1">
                <li v-for="item in reservation.cart" :key="item.menuItemId">
                  {{ item.nombre }} &times; {{ item.qty }} — {{ formatMoney(item.unitPrice * item.qty) }}
                </li>
              </ul>
            </div>
          </div>

          <div class="space-y-4">
            <div class="rounded-2xl bg-primary/5 dark:bg-primary/10 p-4 space-y-2 border border-primary/20">
              <div class="flex items-center justify-between text-sm">
                <span>Sillas</span>
                <b>{{ formatMoney(reservation.seatsTotal) }}</b>
              </div>
              <div class="flex items-center justify-between text-sm" v-if="reservation.cart.length">
                <span>Combos</span>
                <b>{{ formatMoney(reservation.cartTotal) }}</b>
              </div>
              <div class="flex items-center justify-between text-base font-semibold text-primary">
                <span>Total</span>
                <span>{{ formatMoney(reservation.total) }}</span>
              </div>
            </div>

            <div v-if="reservation.status === 'pending'" class="space-y-3">
              <UAlert
                color="amber"
                variant="soft"
                icon="i-heroicons-clock"
                title="Pago pendiente"
                :description="
                  reservation.expiresAt
                    ? `Esta reserva expira el ${formatDateTime(reservation.expiresAt)}`
                    : 'Confirma el pago para asegurar tus asientos.'
                "
              />
              <UButton
                block
                color="primary"
                icon="i-heroicons-credit-card"
                :loading="confirmingId === reservation.id"
                :disabled="!reservation.canConfirm"
                @click="handleConfirm(reservation.id)"
              >
                Confirmar pago
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
