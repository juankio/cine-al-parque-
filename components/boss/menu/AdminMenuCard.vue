<script setup lang="ts">
const props = defineProps<{
  item: Record<string, any>
  index: number
}>()

const emit = defineEmits<{
  edit: [Record<string, any>]
  delete: [string]
}>()
</script>

<template>
  <Motion
    tag="div"
    :initial="{ opacity: 0, y: 24, scale: 0.96 }"
    :enter="{ opacity: 1, y: 0, scale: 1, transition: { delay: index * 0.04, duration: 0.4, ease: 'easeOut' } }"
  >
    <UCard
      class="group rounded-2xl border border-default/60 transition hover:-translate-y-1 hover:bg-primary/5"
      @click="emit('edit', item)"
    >
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="font-medium truncate">{{ item.nombre }}</p>
          <p class="text-xs text-muted">{{ item.categoria || 'Sin categoría' }}</p>
        </div>
        <UBadge :color="item.activo ? 'success' : 'neutral'"  variant="soft">
          {{ item.activo ? 'Activo' : 'Inactivo' }}
        </UBadge>
      </div>

      <p class="mt-3 text-lg font-semibold">${{ item.precio }}</p>

      <div class="mt-2 flex flex-wrap gap-1">
        <UBadge v-for="tag in item.tags || []" :key="tag" size="xs" variant="soft">#{{ tag }}</UBadge>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            size="xs"
            variant="ghost"
            color="neutral"
            @click.stop="emit('edit', item)"
          >
            Editar
          </UButton>
          <UButton
            size="xs"
            color="error"
            variant="soft"
            @click.stop="emit('delete', item._id)"
          >
            Borrar
          </UButton>
        </div>
      </template>
    </UCard>
  </Motion>
</template>
