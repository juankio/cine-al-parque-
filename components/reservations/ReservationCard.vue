<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { ReservationSummary } from '~/types/reservations'
import QrCode from '~/components/base/QrCode.vue'

const props = defineProps({
  reservation: {
    type: Object as PropType<ReservationSummary>,
    required: true
  },
  confirming: Boolean
})

const emit = defineEmits<{
  (e: 'confirm', id: string): void
}>()

const statusMeta: Record<
  ReservationSummary['status'],
  { label: string; color: 'neutral' | 'success' | 'warning' | 'error' }
> = {
  pending: { label: 'Pendiente', color: 'warning' },
  paid: { label: 'Pagada', color: 'success' },
  expired: { label: 'Expirada', color: 'error' },
  canceled: { label: 'Cancelada', color: 'neutral' }
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

const showConfirm = computed(() => props.reservation.status === 'pending')
</script>

<template>
  <UCard class="rounded-3xl border border-default/40 bg-white/90 dark:bg-slate-900/80">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-primary/70">
            Reserva #{{ reservation.id.slice(-6).toUpperCase() }}
          </p>
          <h2 class="text-xl font-semibold">{{ reservation.showtime?.movieTitle || 'Función sin título' }}</h2>
          <p class="text-sm text-muted">
            {{ formatDateTime(reservation.showtime?.fechaHora) }}
            <span v-if="reservation.showtime?.sala">• Sala {{ reservation.showtime?.sala }}</span>
          </p>
          <p v-if="reservation.checkedInAt" class="text-xs text-green-600 mt-1">
            Check-in: {{ formatDateTime(reservation.checkedInAt) }}
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
              {{ item.nombre }} × {{ item.qty }} — {{ formatMoney(item.unitPrice * item.qty) }}
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

        <div v-if="showConfirm" class="space-y-3">
          <UAlert
            color="warning"
            variant="soft"
            icon="i-heroicons-clock"
            title="Pago pendiente"
            :description="
              reservation.expiresAt
                ? `Expira el ${formatDateTime(reservation.expiresAt)}`
                : 'Confirma el pago para asegurar tus sillas.'
            "
          />
          <UButton
            block
            color="primary"
            icon="i-heroicons-credit-card"
            :loading="confirming"
            :disabled="!reservation.canConfirm"
            @click="emit('confirm', reservation.id)"
          >
            Confirmar pago
          </UButton>
        </div>

        <div
          v-else
          class="rounded-2xl border border-dashed border-default/50 p-4 flex flex-col md:flex-row items-center gap-4"
        >
          <div class="flex-1 space-y-2 text-sm">
            <p class="text-xs uppercase tracking-[0.3em] text-muted">Código QR</p>
            <p class="text-muted">
              Muéstralo en taquilla para registrar tu acceso. Puedes compartirlo con tu equipo.
            </p>
            <p v-if="reservation.checkedInAt" class="text-xs text-green-600">
              Ya registramos el acceso el {{ formatDateTime(reservation.checkedInAt) }}.
            </p>
          </div>
          <QrCode v-if="reservation.qrToken" :value="reservation.qrToken" :size="170">
            <p class="text-xs text-muted">
              ID {{ reservation.id.slice(-6).toUpperCase() }}
            </p>
          </QrCode>
          <div v-else class="text-sm text-muted">
            Mostraremos el QR cuando la reserva esté pagada.
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
