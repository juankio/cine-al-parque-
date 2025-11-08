<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  summary: {
    type: Object as PropType<{ total: number; pending: number; paid: number }>,
    default: () => ({ total: 0, pending: 0, paid: 0 })
  },
  loading: Boolean
})

const emit = defineEmits<{
  (e: 'refresh'): void
}>()
</script>

<template>
  <div class="space-y-5">
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
            Revisa tus holds, confirma pagos y muestra el QR cuando llegues a la sala.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" :loading="loading" @click="emit('refresh')">
          Actualizar
        </UButton>
        <UButton color="primary" variant="ghost" to="/menu" icon="i-heroicons-arrow-top-right-on-square">
          Ver combos
        </UButton>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <UCard
        v-for="card in [
          { label: 'Pendientes', value: summary.pending },
          { label: 'Pagadas', value: summary.paid },
          { label: 'Total', value: summary.total }
        ]"
        :key="card.label"
        class="rounded-2xl border border-default/40 bg-white/90 dark:bg-slate-900/90"
      >
        <p class="text-xs uppercase tracking-[0.2em] text-muted">{{ card.label }}</p>
        <p class="text-3xl font-semibold">{{ card.value }}</p>
      </UCard>
    </div>
  </div>
</template>
