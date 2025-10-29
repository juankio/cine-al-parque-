<template>
  <UCard class="cursor-pointer hover:bg-muted/30 transition" @click="$emit('select', item)">
    <div class="flex items-start justify-between">
      <div class="min-w-0">
        <h3 class="font-semibold truncate">{{ item.nombre }}</h3>
        <p class="text-xs text-muted mt-0.5">
          ${{ safePrecio.toLocaleString('es-CO') }}
          <span v-if="item?.recipeId" class="text-[11px] text-neutral-500"> · con receta</span>
        </p>
      </div>
      <UBadge :color="item.activo ? 'primary' : 'gray'">
        {{ item.activo ? 'Activo' : 'Inactivo' }}
      </UBadge>
    </div>

    <div class="text-xs text-muted mt-2">
      Receta: {{ item.recipeId?.nombre || '—' }}
    </div>

    <div class="mt-3 flex gap-2">
      <UButton size="xs" variant="outline" color="primary" @click.stop="$emit('select', item)">Editar</UButton>
      <UButton size="xs" variant="ghost" color="gray" icon="i-heroicons-trash" @click.stop="$emit('delete', item)" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{ item: any }>()
defineEmits(['select','delete'])

const safePrecio = computed(() => {
  const v = props.item?.precio
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : 0
})
</script>
