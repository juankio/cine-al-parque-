<template>
  <section>
    <h2 class="text-xl font-semibold mb-3 flex items-center gap-2">
      <UIcon name="i-heroicons-fire" class="text-primary" /> Combos para hoy
    </h2>

    <div v-if="props.loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="i in 6" :key="i" class="h-28 rounded-2xl" />
    </div>

    <UAlert
      v-else-if="props.error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="props.error"
      title="No se pudieron cargar los combos"
    />

    <div v-else-if="props.combos.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="c in props.combos" :key="c._id" class="rounded-2xl hover:bg-primary/5 transition">
        <div class="flex items-start justify-between">
          <div class="min-w-0">
            <div class="font-semibold truncate">{{ c.nombre }}</div>
            <div class="text-xs text-muted mt-0.5">
              $ {{ money(c.precio) }} <span v-if="c.categoria">- {{ c.categoria }}</span>
            </div>
            <div class="mt-1 flex flex-wrap gap-1">
              <UBadge v-for="t in (c.tags || [])" :key="t" size="xs" variant="soft">#{{ t }}</UBadge>
            </div>
          </div>
          <UButton size="xs" color="primary" :to="`/menu`" variant="outline">Ver</UButton>
        </div>
      </UCard>
    </div>

    <EmptyState v-else description="Aun no hay combos disponibles." />
  </section>
</template>

<script setup lang="ts">
interface ComboItem {
  _id: string
  nombre: string
  precio: number
  categoria?: string
  tags?: string[]
}

const props = defineProps<{
  loading: boolean
  error: string | null
  combos: ComboItem[]
}>()

function money(n?: number) {
  return (Number(n || 0)).toLocaleString('es-CO')
}
</script>

