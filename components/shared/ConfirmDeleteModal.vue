<script setup lang="ts">
const model = defineModel<boolean>()
const props = defineProps({
  title: { type: String, default: '¿Eliminar?' },
  description: { type: String, default: 'Esta acción no se puede deshacer.' }
})
const emit = defineEmits(['confirm'])
</script>

<template>
  <UModal v-model:open="model" :title="title" :description="description">
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancelar" variant="subtle" color="neutral" @click="model = false" />
        <UButton label="Eliminar" color="error" @click="emit('confirm')" />
      </div>
    </template>
  </UModal>
</template>
