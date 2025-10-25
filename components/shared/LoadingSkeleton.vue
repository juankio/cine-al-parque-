<script setup lang="ts">
defineProps<{ rows?: number }>()
</script>

<template>
  <div class="grid gap-3">
    <UCard v-for="i in (rows || 6)" :key="i" class="p-4">
      <USkeleton class="h-5 w-2/3 mb-2" />
      <USkeleton class="h-4 w-1/2" />
      <div class="flex gap-2 pt-2">
        <USkeleton class="h-7 w-20" />
        <USkeleton class="h-7 w-24" />
      </div>
    </UCard>
  </div>
</template>
