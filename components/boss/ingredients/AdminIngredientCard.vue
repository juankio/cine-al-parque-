<script setup lang="ts">
const props = defineProps<{
  item: {
    _id: string
    nombre?: string
    unidad?: string
    stock?: number
    costoUnitario?: number
    activo?: boolean
  }
}>()

const emit = defineEmits<{
  (e: 'select', item: any): void
  (e: 'delete', item: any): void
}>()

const money = (v?: number) =>
  typeof v === 'number' ? v.toLocaleString('es-CO') : '0'
</script>

<template>
  <UCard class="cursor-pointer hover:bg-primary/5 transition" @click="emit('select', item)">
    <div class="flex items-start justify-between">
      <div>
        <p class="font-semibold">{{ item.nombre || '—' }}</p>
        <p class="text-xs text-muted">
          Unidad: {{ item.unidad || '—' }} · Stock: {{ item.stock ?? 0 }} · $ {{ money(item.costoUnitario) }}
        </p>
      </div>

      <!-- Badge opcional (si el backend no lo tiene, default a true) -->
      <span
        class="text-xs font-medium"
        :class="(item.activo ?? true) ? 'text-primary' : 'text-muted'"
        @click.stop
      >
        {{ (item.activo ?? true) ? 'Activo' : 'Inactivo' }}
      </span>
    </div>

    <template #footer>
      <div class="flex items-center gap-3">
        <!-- Sólo Editar (click en la card) y Eliminar -->
        <UButton
          size="xs"
          variant="ghost"
          color="gray"
          @click.stop="emit('delete', item)"
          icon="i-heroicons-trash"
        />
      </div>
    </template>
  </UCard>
</template>
