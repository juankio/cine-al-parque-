<template>
  <UCard
    class="cursor-pointer hover:bg-muted/30 transition"
    @click="$emit('select', recipe)"
  >
    <div class="flex items-start justify-between">
      <div class="min-w-0">
        <h3 class="font-semibold truncate">{{ recipe?.nombre || '—' }}</h3>
        <p class="text-xs text-muted mt-0.5">
          Porciones: {{ safePorciones }}
        </p>
      </div>
      <UBadge :color="recipe?.activo ? 'primary' : 'gray'">
        {{ recipe?.activo ? 'Activo' : 'Inactivo' }}
      </UBadge>
    </div>

    <div class="text-xs text-muted mt-2">
      {{ safeItemsCount }} ingredientes
    </div>

    <div class="mt-3 flex gap-2">
      <UButton
        size="xs"
        variant="outline"
        color="primary"
        @click.stop="$emit('select', recipe)"
      >
        Editar
      </UButton>
      <UButton
        size="xs"
        variant="ghost"
        color="gray"
        icon="i-heroicons-trash"
        @click.stop="$emit('delete', recipe)"
        title="Eliminar"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{ recipe: any }>()
defineEmits(['select','delete'])

// Fallbacks seguros (evitan mostrar NaN o undefined)
const safePorciones = computed(() => {
  const v = props.recipe?.porciones
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : 1
})

const safeItemsCount = computed(() => {
  const arr = props.recipe?.items
  return Array.isArray(arr) ? arr.length : 0
})
</script>
