<script setup lang="ts">
const props = defineProps<{
  items: any[]
  loading?: boolean
  error?: string | null
}>()
const emit = defineEmits<{
  (e: 'select', item: any): void
  (e: 'delete', item: any): void
}>()
</script>

<template>
  <div v-if="loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <UCard v-for="i in 6" :key="i" class="p-4">
      <USkeleton class="h-5 w-2/3 mb-1" />
      <USkeleton class="h-4 w-1/2" />
    </UCard>
  </div>

  <UAlert
    v-else-if="error"
    color="gray"
    variant="soft"
    icon="i-heroicons-exclamation-triangle"
    :description="error"
    title="No se pudo cargar la lista"
  />

  <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <AdminIngredientCard
      v-for="it in items"
      :key="it._id"
      :item="it"
      @select="emit('select', it)"
      @delete="emit('delete', it)"
    />
    <div v-if="items.length === 0" class="text-muted col-span-full">
      Sin ingredientes aún.
    </div>
  </div>
</template>
