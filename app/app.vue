<script setup lang="ts">
const { initialize } = useAuth()
await initialize()
</script>

<template>
  <div class="min-h-dvh bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
