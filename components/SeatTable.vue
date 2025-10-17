<template>
  <div class="rounded-2xl border border-theme bg-surface p-4">
    <header class="mb-3 flex items-center justify-between">
      <h3 class="font-semibold">Mesa {{ table.table }}</h3>
      <span class="text-xs text-neutral-500">Capacidad: {{ table.capacity }}</span>
    </header>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="seat in table.seats"
        :key="seat.code"
        :disabled="seat.taken"
        @click="$emit('toggle', table.table, seat.code, seat.taken)"
        class="h-9 rounded-lg border px-3 text-sm transition-colors"
        :class="btnClass(table.table, seat)"
        :title="tooltip(table.table, seat)"
      >
        {{ seat.code }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
type SeatState = { code: string; taken: boolean }
type TableRow = { table: string; capacity: number; seats: SeatState[] }

const props = defineProps<{
  table: TableRow
  selectedKeys: Set<string>
}>()

defineEmits<{
  (e: 'toggle', tableCode: string, seatCode: string, taken: boolean): void
}>()

function isSelected(tableCode: string, seatCode: string) {
  return props.selectedKeys.has(`${tableCode}-${seatCode}`)
}

function btnClass(tableCode: string, seat: SeatState) {
  if (seat.taken) return 'cursor-not-allowed bg-neutral-500/20 border-neutral-500/30 text-neutral-500'
  if (isSelected(tableCode, seat.code)) return 'bg-brand text-white border-brand'
  return 'border-theme hover:bg-brand/10'
}

function tooltip(tableCode: string, seat: SeatState) {
  if (seat.taken) return 'Ocupado'
  return isSelected(tableCode, seat.code) ? 'Seleccionado' : 'Disponible'
}
</script>
