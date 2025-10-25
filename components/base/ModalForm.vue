<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
defineProps<{
  title: string
  description?: string
  submitLabel?: string
  busy?: boolean
}>()

const emit = defineEmits<{ (e: 'submit'): void }>()
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="description">
    <template #body>
      <form @submit.prevent="emit('submit')" class="space-y-3">
        <slot />
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          label="Cancelar"
          variant="subtle"
          color="neutral"
          @click="open = false"
        />
        <UButton
          :label="submitLabel || 'Guardar'"
          color="primary"
          :loading="busy"
          type="submit"
        />
      </div>
    </template>
  </UModal>
</template>
