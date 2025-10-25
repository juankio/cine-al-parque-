<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
defineProps<{ title?: string; description?: string; confirmLabel?: string }>()
const emit = defineEmits<{ (e:'confirm'): void }>()
</script>

<template>
  <UModal v-model:open="open" :title="title || 'Confirmar acción'" :description="description">
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancelar" variant="subtle" color="neutral" @click="open = false" />
        <UButton :label="confirmLabel || 'Confirmar'" color="primary" @click="emit('confirm'); open = false" />
      </div>
    </template>
  </UModal>
</template>
