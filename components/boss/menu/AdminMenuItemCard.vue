<template>
  <UCard
    class="cursor-pointer hover:bg-muted/30 transition"
    @click="$emit('select', item)"
  >
    <!-- Header: nombre + estado -->
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="font-semibold truncate">{{ item?.nombre || '—' }}</h3>
        <p class="text-xs text-muted mt-0.5">
          {{ currencyCOP }}
          <span v-if="recipeLabel" class="text-[11px] opacity-70"> · {{ recipeLabel }}</span>
        </p>
      </div>

      <UBadge :color="item?.activo ? 'primary' : 'gray'">
        {{ item?.activo ? 'Activo' : 'Inactivo' }}
      </UBadge>
    </div>

    <!-- Meta: categoría / tipo -->
    <div class="mt-2 flex flex-wrap gap-1">
      <UBadge v-if="item?.categoria" size="xs" variant="soft"> {{ item.categoria }} </UBadge>
      <UBadge
        v-if="tipoNice"
        size="xs"
        :color="item?.tipo ? 'primary' : 'gray'"
        variant="soft"
      >
        {{ tipoNice }}
      </UBadge>
    </div>

    <!-- Tags -->
    <div v-if="(item?.tags?.length || 0) > 0" class="mt-2 flex flex-wrap gap-1">
      <UBadge
        v-for="(t, i) in item.tags.slice(0, 4)"
        :key="t + i"
        size="xs"
        variant="soft"
      >
        #{{ t }}
      </UBadge>
      <UBadge v-if="item.tags.length > 4" size="xs" variant="soft">
        +{{ item.tags.length - 4 }}
      </UBadge>
    </div>

    <!-- Actions -->
    <template #footer>
      <div class="flex gap-2 justify-end">
        <UButton
          size="xs"
          variant="outline"
          color="primary"
          @click.stop="$emit('select', item)"
        >
          Editar
        </UButton>
        <UButton
          size="xs"
          variant="ghost"
          color="gray"
          icon="i-heroicons-trash"
          @click.stop="$emit('delete', item)"
        />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{ item: any }>()
defineEmits(['select', 'delete'])

/** Precio seguro y formateado a COP */
const safePrecio = computed<number>(() => {
  const v = props.item?.precio
  const n =
    typeof v === 'number'
      ? v
      : Number(String(v ?? '').replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : 0
})
const currencyCOP = computed(() =>
  safePrecio.value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
)

/** Label recetas (soporta recipeIds o recipeId) */
const recipeLabel = computed(() => {
  const ids = Array.isArray(props.item?.recipeIds)
    ? props.item.recipeIds
    : props.item?.recipeId
    ? [props.item.recipeId]
    : []
  if (ids.length === 0) return 'sin receta'
  if (ids.length === 1) return '1 receta'
  return `${ids.length} recetas`
})

/** Tipo legible */
const tipoNice = computed(() => {
  const t = String(props.item?.tipo || '').toLowerCase()
  if (t === 'personal') return 'Personal (1 porción)'
  if (t === 'grupal') return 'Grupal (2–3 porciones)'
  if (t === 'parche') return 'Parche (4+ porciones)'
  return ''
})
</script>
