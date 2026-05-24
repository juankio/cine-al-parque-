<script setup lang="ts">
const model = defineModel<string>({ default: '' })
defineProps<{ placeholder?: string; class?: string }>()
const emit = defineEmits<{ (e:'clear'):void }>()
</script>

<template>
  <div class="flex items-center gap-2" :class="[$props.class]">
    <UInput
      v-model.trim="model"
      type="search"
      :placeholder="placeholder || 'Buscar…'"
      icon="i-heroicons-magnifying-glass-20-solid"
      class="w-64"
    />
    <UButton
      v-if="model"
      variant="ghost"
      color="neutral"
      @click="model=''; emit('clear')"
    >
      Limpiar
    </UButton>
  </div>
</template>
