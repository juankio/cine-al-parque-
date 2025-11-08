<script setup lang="ts">
const props = defineProps<{
  reserveMode: boolean
  selectionCount: number
  hasCartItems: boolean
  cartCount: number
  cartSubtotal: number
  orderTotal: number
  reserving: boolean
  canReserve: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'reserve'): void
}>()

const money = (value?: number) => (Number(value || 0)).toLocaleString('es-CO')
</script>

<template>
  <div
    v-if="reserveMode"
    class="fixed inset-x-0 bottom-0 sm:hidden border-t border-default bg-background/90 backdrop-blur px-4 py-3"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="text-sm flex flex-col">
        <span>Seleccionadas: <b>{{ selectionCount }}</b></span>
        <span v-if="hasCartItems">Combos: <b>{{ cartCount }}</b> · $ {{ money(cartSubtotal) }}</span>
        <span>Total: <b>$ {{ money(orderTotal) }}</b></span>
      </div>
      <div class="flex gap-2">
        <UButton
          variant="outline"
          color="neutral"
          size="sm"
          icon="i-heroicons-arrow-path"
          @click="emit('refresh')"
        >
          Refrescar
        </UButton>
        <UButton
          :disabled="!canReserve"
          :loading="reserving"
          color="primary"
          size="sm"
          icon="i-heroicons-ticket"
          @click="emit('reserve')"
        >
          Reservar
        </UButton>
      </div>
    </div>
  </div>
</template>
