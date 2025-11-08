<script setup lang="ts">
import type { PropType } from 'vue'
import type { HistoryItem } from '~/composables/useMe'

const props = defineProps({
  items: {
    type: Array as PropType<HistoryItem[]>,
    default: () => []
  }
})

const money = (n?: number) => (Number(n || 0)).toLocaleString('es-CO')
const formatDate = (iso?: string) => {
  if (!iso) return 'Fecha pendiente'
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

const statusMap: Record<string, { color: 'neutral' | 'success' | 'warning' | 'error'; label: string }> = {
  paid:     { color: 'success',  label: 'Pagado' },
  pending:  { color: 'warning', label: 'Pendiente' },
  expired:  { color: 'error',   label: 'Expirado' },
  canceled: { color: 'neutral',    label: 'Cancelado' }
}
const statusIcons: Record<string, string> = {
  paid: 'i-heroicons-check-circle',
  pending: 'i-heroicons-clock',
  expired: 'i-heroicons-bolt-slash',
  canceled: 'i-heroicons-x-circle'
}
const statusAccent: Record<string, string> = {
  paid: 'bg-emerald-500',
  pending: 'bg-amber-400',
  expired: 'bg-gray-400',
  canceled: 'bg-rose-500'
}

const statusConf = (s?: string) => statusMap[s || ''] || { color: 'gray', label: s || '—' }
const statusIcon = (s?: string) => statusIcons[s || ''] || 'i-heroicons-question-mark-circle'
const statusAccentClass = (s?: string) => statusAccent[s || ''] || 'bg-gray-400'
</script>

<template>
  <div class="space-y-4">
    <Motion
      v-for="reservation in items"
      :key="reservation.id"
      tag="div"
      :initial="{ opacity: 0, y: 18 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.25 } }"
    >
      <UCard
        class="relative overflow-hidden rounded-2xl border border-default/40 p-5 transition hover:border-primary/40 hover:shadow-[0_18px_40px_rgba(225,29,72,0.12)]"
      >
        <span class="absolute inset-y-5 left-0 w-1 rounded-r-full" :class="statusAccentClass(reservation.status)" />
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <UIcon :name="statusIcon(reservation.status)" class="text-primary/80" />
              <h4 class="text-lg font-semibold truncate">
                {{ reservation.movie?.titulo || 'Sin título' }}
              </h4>
            </div>
            <p class="text-sm text-muted">
              {{ formatDate(reservation.showtime?.fechaHora) }} • Sala {{ reservation.showtime?.sala || '—' }}
            </p>
            <div class="flex flex-wrap gap-3 text-sm text-muted">
              <span>Asientos: <b>{{ (reservation.seats || []).join(', ') || '—' }}</b></span>
              <span>Total: <b>$ {{ money(reservation.total) }}</b></span>
            </div>
            <div v-if="reservation.cart?.length" class="flex flex-wrap gap-2 pt-2">
              <UBadge
                v-for="(c, idx) in reservation.cart"
                :key="idx"
                color="neutral"
                variant="soft"
                class="text-xs"
              >
                {{ c.qty }}× {{ c.nombre }}
              </UBadge>
            </div>
            <p
              v-if="reservation.status === 'pending' && reservation.expiresAt"
              class="text-xs text-amber-600"
            >
              Recuerda confirmar antes de {{ new Date(reservation.expiresAt).toLocaleTimeString('es-CO') }}.
            </p>
          </div>

          <div class="flex flex-col items-start gap-2">
            <UBadge :color="statusConf(reservation.status).color" variant="subtle">
              {{ statusConf(reservation.status).label }}
            </UBadge>
            <UButton
              v-if="reservation.status === 'pending'"
              size="xs"
              color="primary"
              variant="soft"
              to="/reservations"
            >
              Ver detalles
            </UButton>
          </div>
        </div>
      </UCard>
    </Motion>
  </div>
</template>
