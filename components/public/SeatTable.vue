<script setup lang="ts">
const props = defineProps<{
  table: {
    table: string | number
    capacity: number
    seats: Array<{ code: string, taken: boolean }>
  }
  selectedKeys: Set<string>        // Set de "mesa-asiento"
  selectEnabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', table: string | number, seatCode: string, taken: boolean): void
}>()

function key(tableCode: string | number, seatCode: string) {
  return `${tableCode}-${seatCode}`
}
function isSelected (tableCode: string | number, seatCode: string) {
  return props.selectedKeys.has(key(tableCode, seatCode))
}
function color (tableCode: string | number, seat: { code: string; taken: boolean }) {
  if (seat.taken || !props.selectEnabled) return 'neutral'
  return isSelected(tableCode, seat.code) ? 'primary' : 'neutral'
}
function variant (tableCode: string | number, seat: { code: string; taken: boolean }) {
  if (seat.taken || !props.selectEnabled) return 'soft'
  return isSelected(tableCode, seat.code) ? 'solid' : 'outline'
}
function tooltip (tableCode: string | number, seat: { code: string; taken: boolean }) {
  if (seat.taken) return 'Ocupado'
  if (!props.selectEnabled) return 'Solo lectura'
  return isSelected(tableCode, seat.code) ? 'Seleccionado' : 'Disponible'
}

/* Accesibilidad: tecla Enter/Space */
function onKey (e: KeyboardEvent, table: string | number, seat: any) {
  if (seat.taken || !props.selectEnabled) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('toggle', table, seat.code, seat.taken)
  }
}
</script>

<template>
  <UCard class="p-4 hover:bg-muted/30 transition">
    <header class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-table-cells" class="text-primary" />
        <h3 class="font-semibold">Mesa {{ table.table }}</h3>
      </div>
      <UBadge color="neutral" variant="soft" class="text-xs">
        Capacidad: {{ table.capacity }}
      </UBadge>
    </header>

    <div class="flex flex-wrap gap-2">
      <UTooltip
        v-for="seat in table.seats"
        :key="seat.code"
        :text="tooltip(table.table, seat)"
        :popper="{ placement: 'top' }"
      >
        <UButton
          :disabled="seat.taken || !selectEnabled"
          size="sm"
          class="transition-colors"
          :color="color(table.table, seat)"
          :variant="variant(table.table, seat)"
          :aria-pressed="isSelected(table.table, seat.code)"
          :aria-label="`Silla ${seat.code} de mesa ${table.table}`"
          @click="emit('toggle', table.table, seat.code, seat.taken)"
          @keydown="onKey($event, table.table, seat)"
        >
          <template #leading>
            <UIcon
              v-if="seat.taken"
              name="i-heroicons-lock-closed"
              class="opacity-70"
            />
            <UIcon
              v-else-if="isSelected(table.table, seat.code)"
              name="i-heroicons-check-circle"
            />
            <UIcon v-else name="i-heroicons-user" class="opacity-70" />
          </template>
          {{ seat.code }}
        </UButton>
      </UTooltip>
    </div>
  </UCard>
</template>
