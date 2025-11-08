<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number }>(), {
  count: 6,
})
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <UCard
      v-for="i in props.count"
      :key="i"
      class="rounded-2xl border border-default p-4"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
        <USkeleton class="h-28 w-full rounded-xl sm:h-20 sm:w-14" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-5 w-2/3" />
          <USkeleton class="h-4 w-1/2" />
          <div class="flex flex-wrap gap-2 pt-2">
            <USkeleton class="h-7 w-24" />
            <USkeleton class="h-7 w-20" />
            <USkeleton class="h-7 w-16" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
