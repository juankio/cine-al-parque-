<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import SeatTable from '~/components/public/SeatTable.vue'
import UCollapse from '~/components/base/UCollapse.vue'

type TableRow = {
  table: string | number
  seats: Array<{ code: string; taken: boolean }>
  capacity: number
}

const props = defineProps({
  loading: Boolean,
  errorText: {
    type: String,
    default: null
  },
  tables: {
    type: Array as PropType<TableRow[]>,
    default: () => []
  },
  reserveMode: Boolean,
  selectedKeys: {
    type: Object as PropType<Set<string>>,
    required: true
  },
  showtimeId: {
    type: String,
    default: ''
  },
  lastRefreshLabel: {
    type: String,
    default: '—'
  }
})

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'toggle-seat', table: string | number, seatCode: string, taken: boolean): void
}>()

const expandedLayout = ref(true)
watch(() => props.reserveMode, (on) => {
  if (on && !expandedLayout.value) expandedLayout.value = true
})
</script>

<template>
  <div class="flex items-center justify-between mb-2">
    <p class="text-sm text-muted">Disponibilidad de sillas</p>
    <UButton
      variant="ghost"
      color="primary"
      size="xs"
      :icon="expandedLayout ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
      @click="expandedLayout = !expandedLayout"
    >
      {{ expandedLayout ? 'Ocultar sillas' : 'Mostrar sillas' }}
    </UButton>
  </div>

  <UCollapse :model-value="expandedLayout">
    <UCard class="p-3">
      <div class="flex flex-wrap items-center gap-3 text-sm">
        <span class="text-muted mr-1">Leyenda:</span>
        <UBadge color="neutral" variant="outline">Libre</UBadge>
        <UBadge color="primary" variant="solid">Seleccionada</UBadge>
        <UBadge color="neutral" variant="soft" class="opacity-60">Ocupada</UBadge>
        <UBadge color="neutral" variant="soft">Última actualización: {{ lastRefreshLabel }}</UBadge>
      </div>
    </UCard>

    <div v-if="loading" class="grid gap-3 mt-4">
      <UCard v-for="i in 3" :key="i" class="p-4">
        <USkeleton class="h-5 w-2/3 mb-2" />
        <USkeleton class="h-4 w-1/2" />
      </UCard>
    </div>

    <UAlert
      v-else-if="errorText"
      color="neutral"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="errorText"
      title="No se pudo cargar el layout"
    >
      <template #actions>
        <UButton size="xs" color="primary" variant="outline" @click="emit('refresh')">
          Reintentar
        </UButton>
      </template>
    </UAlert>

    <UCard v-else-if="tables.length === 0" class="p-6 text-muted">
      <p>No hay layout para este showtime (o aún no se ha generado).</p>
      <div class="mt-2 text-xs opacity-80 space-y-1">
        <div><b>ID:</b> {{ showtimeId }}</div>
        <div><b>Última actualización:</b> {{ lastRefreshLabel }}</div>
      </div>
    </UCard>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
      <SeatTable
        v-for="t in tables"
        :key="t.table"
        :table="t"
        :selected-keys="selectedKeys"
        :select-enabled="reserveMode"
        @toggle="(tableCode, seatCode, taken) => emit('toggle-seat', tableCode, seatCode, taken)"
      />
    </div>
  </UCollapse>
</template>
