<template>
  <!-- Loading -->
  <div v-if="loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <UCard v-for="i in 6" :key="i" class="space-y-2">
      <USkeleton class="h-5 w-2/3" />
      <USkeleton class="h-4 w-1/2" />
      <USkeleton class="h-8 w-full" />
    </UCard>
  </div>

  <!-- Error -->
  <UAlert
    v-else-if="error"
    color="gray"
    variant="soft"
    icon="i-heroicons-exclamation-triangle"
    :description="error"
    title="No se pudo cargar el menú"
  />

  <!-- List -->
  <div v-else>
    <div v-if="(items?.length || 0) === 0" class="text-muted">Sin productos.</div>

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <AdminMenuItemCard
        v-for="r in items"
        :key="r._id"
        :item="r"
        @edit="$emit('edit', r)"
        @delete="$emit('delete', r)"
        @select="$emit('edit', r)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminMenuItemCard from './AdminMenuItemCard.vue'
defineProps<{ items: any[]; loading: boolean; error: string | null }>()
defineEmits(['edit', 'delete'])
</script>
