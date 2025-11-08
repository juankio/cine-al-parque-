<script setup lang="ts">
import type { PropType } from 'vue'

type FilterConfig = Record<string, { label: string }>

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  config: {
    type: Object as PropType<FilterConfig>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="flex items-center gap-2 rounded-full border border-default/40 p-1 bg-white/70 dark:bg-slate-900/60">
    <UButton
      v-for="(cfg, key) in config"
      :key="key"
      size="xs"
      :color="modelValue === key ? 'primary' : 'neutral'"
      :variant="modelValue === key ? 'solid' : 'ghost'"
      class="rounded-full px-3 transition hover:border-primary/50"
      @click="emit('update:modelValue', key)"
    >
      {{ cfg.label }}
    </UButton>
  </div>
</template>
