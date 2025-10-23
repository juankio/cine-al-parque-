<template>
  <UCard class="p-4">
    <header class="mb-3 flex items-center justify-between">
      <h3 class="font-semibold">Mesa {{ table.table }}</h3>
      <span class="text-xs text-neutral-500">Capacidad: {{ table.capacity }}</span>
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
          :color="buttonColor(table.table, seat)"
          :variant="buttonVariant(table.table, seat)"
          @click="$emit('toggle', table.table, seat.code, seat.taken)"
        >
          {{ seat.code }}
        </UButton>
      </UTooltip>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  table: Object,
  selectedKeys: { type: Object, required: true }, // Set<string>
  selectEnabled: { type: Boolean, default: false }
})

defineEmits(['toggle'])

function isSelected (tableCode, seatCode) {
  return props.selectedKeys.has(`${tableCode}-${seatCode}`)
}

function buttonColor (tableCode, seat) {
  if (seat.taken || !props.selectEnabled) return 'gray'
  if (isSelected(tableCode, seat.code)) return 'primary'
  return 'neutral'
}

function buttonVariant (tableCode, seat) {
  if (seat.taken || !props.selectEnabled) return 'soft'
  if (isSelected(tableCode, seat.code)) return 'solid'
  return 'outline'
}

function tooltip (tableCode, seat) {
  if (seat.taken) return 'Ocupado'
  if (!props.selectEnabled) return 'Solo lectura'
  return isSelected(tableCode, seat.code) ? 'Seleccionado' : 'Disponible'
}
</script>
