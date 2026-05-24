<template>
  <div v-if="loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <UCard v-for="i in 6" :key="i">
      <USkeleton class="h-5 w-2/3" />
      <USkeleton class="h-4 w-1/2 mt-2" />
    </UCard>
  </div>

  <UAlert
    v-else-if="error"
    color="neutral"
    variant="soft"
    icon="i-heroicons-exclamation-triangle"
    :description="error"
    title="No se pudo cargar recetas"
  />

  <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <AdminRecipeCard
      v-for="r in items"
      :key="r._id"
      :recipe="r"
      @select="$emit('edit', r)"
      @delete="$emit('delete', r)"
    />
    <div v-if="(items?.length || 0) === 0" class="text-muted">Sin recetas.</div>
  </div>
</template>

<script setup lang="ts">
import AdminRecipeCard from './AdminRecipeCard.vue'

defineProps<{
  items: any[]
  loading: boolean
  error: string | null
}>()

defineEmits(['edit','delete'])
</script>
