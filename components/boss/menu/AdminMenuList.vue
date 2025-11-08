<script setup lang="ts">
import AdminMenuCard from './AdminMenuCard.vue'

defineProps<{
  items: any[]
}>()

const emit = defineEmits<{
  edit: [any]
  delete: [string]
}>()
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
    <AdminMenuCard
      v-for="(item, index) in items"
      :key="item._id"
      :item="item"
      :index="index"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
  </div>
  <p
    v-if="!items.length"
    class="text-sm text-muted"
  >
    Sin productos.
  </p>
</template>
