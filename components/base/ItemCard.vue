<script setup lang="ts">
defineProps<{ clickable?: boolean }>()
</script>

<template>
  <div
    class="rounded-2xl border border-default bg-default p-4 transition"
    :class="clickable ? 'hover:bg-primary/5 cursor-pointer' : ''"
  >
    <slot />
  </div>
</template>
