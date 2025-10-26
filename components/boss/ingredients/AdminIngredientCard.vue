<script setup lang="ts">
const props = defineProps<{ item: any }>()
const emit = defineEmits<{
  (e: 'select', item: any): void
  (e: 'delete', item: any): void
}>()

const money = (n: any) => {
  const v = Number(n ?? 0)
  return isFinite(v) ? v.toLocaleString('es-CO') : '0'
}
</script>

<template>
  <UCard
    class="cursor-pointer rounded-2xl hover:bg-primary/5 transition"
    @click="emit('select', item)"
  >
    <div class="flex items-start justify-between">
      <div>
        <h3 class="font-semibold">{{ item.nombre }}</h3>
        <p class="text-xs text-muted">
          Unidad: {{ item.unidad }} · Stock: {{ item.stockBase ?? 0 }} · $ {{ money(item.costoPromedio) }}
        </p>
      </div>

      <UButton
        icon="i-heroicons-trash"
        variant="ghost"
        color="gray"
        aria-label="Eliminar"
        @click.stop="emit('delete', item)"
      />
    </div>
  </UCard>
</template>
