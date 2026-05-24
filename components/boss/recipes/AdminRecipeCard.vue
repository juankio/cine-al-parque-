<template>
  <UCard
    class="cursor-pointer hover:bg-muted/30 transition"
    @click="$emit('select', recipe)"
  >
    <div class="flex items-start justify-between">
      <div class="min-w-0">
        <h3 class="font-semibold truncate">{{ recipe?.nombre || '-' }}</h3>
        <p class="text-xs text-muted mt-0.5">
          Porciones: {{ safePorciones }}
        </p>
      </div>
      <UBadge :color="statusColor">
        {{ statusLabel }}
      </UBadge>
    </div>

    <div class="text-xs text-muted mt-2 space-y-1">
      <div>{{ safeItemsCount }} ingredientes</div>
      <div v-if="!recipe?.available" class="text-amber-600">
        Ingredientes sin stock/inactivos
      </div>
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
        color="neutral"
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

const statusLabel = computed(() => {
  if (props.recipe?.available === false) return 'Inactiva (ingredientes)'
  return props.recipe?.activo ? 'Activa' : 'Inactiva'
})

const statusColor = computed(() => {
  if (props.recipe?.available === false) return 'gray'
  return props.recipe?.activo ? 'primary' : 'gray'
})
</script>
