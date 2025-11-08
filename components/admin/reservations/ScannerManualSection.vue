<script setup lang="ts">
import type { PropType } from 'vue'
import type { ReservationScanResult } from '~/types/reservations'

const props = defineProps({
  manualToken: {
    type: String,
    default: ''
  },
  verifying: Boolean,
  lastResult: {
    type: Object as PropType<{ ok: boolean; reservation?: ReservationScanResult; message?: string } | null>,
    default: null
  },
  formatDateTime: {
    type: Function as PropType<(value?: string | null) => string>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:manualToken', token: string): void
  (e: 'submit'): void
}>()

const handleInput = (event: Event) => {
  emit('update:manualToken', (event.target as HTMLInputElement).value)
}

const submit = () => emit('submit')
</script>

<template>
  <UCard class="rounded-3xl border border-default/40 bg-white/90 dark:bg-slate-900/90 space-y-4">
    <template #header>
      <p class="text-xs uppercase tracking-[0.3em] text-muted">Ingreso manual</p>
    </template>

    <form class="space-y-3" @submit.prevent="submit">
      <label class="text-xs font-semibold uppercase tracking-[0.3em] text-muted block">
        Token QR
        <UInput
          :value="manualToken"
          placeholder="Pega el contenido del QR"
          class="mt-1.5"
          @input="handleInput"
        />
      </label>
      <UButton type="submit" block color="primary" icon="i-heroicons-check" :loading="verifying">
        Validar token
      </UButton>
    </form>

    <div v-if="lastResult" class="rounded-2xl border border-dashed p-4 space-y-2">
      <UBadge :color="lastResult.ok ? 'green' : 'red'" variant="soft">
        {{ lastResult.ok ? 'Admitido' : 'Observación' }}
      </UBadge>
      <p class="text-base font-semibold">
        {{ lastResult.reservation?.showtime?.movieTitle || 'Reserva sin título' }}
      </p>
      <p class="text-sm text-muted">
        {{ formatDateTime(lastResult.reservation?.showtime?.fechaHora) }}
        <span v-if="lastResult.reservation?.showtime?.sala">• Sala {{ lastResult.reservation?.showtime?.sala }}</span>
      </p>
      <p class="text-sm">
        Sillas: <b>{{ lastResult.reservation?.seats.join(', ') || 'N/D' }}</b>
      </p>
      <p class="text-xs text-muted" v-if="lastResult.reservation">
        Check-in: {{ formatDateTime(lastResult.reservation.checkedInAt) }}
      </p>
      <p class="text-sm text-muted" v-if="lastResult.message">{{ lastResult.message }}</p>
    </div>
  </UCard>
</template>
