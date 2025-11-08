<script setup lang="ts">
import type { ReservationSnapshot } from '~/types/showtime'

const props = defineProps<{
  hold: ReservationSnapshot
  description: string
  countdown?: string | null
  confirming: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
}>()

const money = (value?: number) => (Number(value || 0)).toLocaleString('es-CO')
</script>

<template>
  <UAlert
    :color="hold.status === 'paid' ? 'primary' : 'green'"
    variant="soft"
    icon="i-heroicons-ticket"
    :title="hold.status === 'paid' ? 'Reserva confirmada' : '¡Listo! Bloqueamos tus asientos'"
    :description="description"
  >
    <template #actions>
      <UButton
        v-if="hold.status === 'pending'"
        size="xs"
        color="primary"
        :loading="confirming"
        @click="emit('confirm')"
      >
        Confirmar pago (demo)
      </UButton>
      <UButton size="xs" variant="ghost" color="neutral" to="/me">
        Ver historial
      </UButton>
    </template>

    <div
      v-if="hold.status === 'pending'"
      class="mt-3 flex flex-wrap items-center gap-2 text-xs"
    >
      <UBadge color="primary" variant="soft">
        Expira en: {{ countdown || '—' }}
      </UBadge>
      <span v-if="hold.expiresAt" class="text-muted">
        ({{ new Date(hold.expiresAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) }})
      </span>
    </div>

    <div
      v-if="hold.items?.length"
      class="mt-3 text-xs text-muted"
    >
      <p>Combos incluidos:</p>
      <ul class="list-disc ml-4">
        <li
          v-for="item in hold.items"
          :key="item.menuItemId"
        >
          {{ item.qty }} × {{ item.nombre }} – $ {{ money(item.unitPrice * item.qty) }}
        </li>
      </ul>
    </div>
  </UAlert>
</template>
