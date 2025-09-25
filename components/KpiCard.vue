<script setup>
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  sub: { type: String, default: '' }
})
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="text-sm opacity-80">{{ label }}</div>
      <div class="text-2xl font-bold">{{ value }}</div>
      <div v-if="sub" class="text-xs opacity-60 mt-1">{{ sub }}</div>
    </div>
  </div>
</template>
