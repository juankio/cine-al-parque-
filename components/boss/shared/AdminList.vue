<script setup lang="ts">
/**
 * Lista genérica: tú decides cómo renderizar cada item via slot.
 * Props: items (array), emptyTitle/emptyDescription para estado vacío.
 */
defineProps<{
  items: any[] | undefined
  emptyTitle?: string
  emptyDescription?: string
}>()
</script>

<template>
  <div v-if="!items || items.length === 0">
    <UCard class="p-8 text-center">
      <p class="text-lg font-semibold">{{ emptyTitle || 'Sin resultados' }}</p>
      <p v-if="emptyDescription" class="text-sm text-muted mt-1">{{ emptyDescription }}</p>
      <div class="mt-4"><slot name="empty" /></div>
    </UCard>
  </div>
  <div v-else class="grid gap-3">
    <slot name="item" v-for="(it, i) in items" :key="i" :item="it" />
  </div>
</template>
