<script setup>
const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (v) => colorMode.preference = v ? 'dark' : 'light'
})
</script>

<template>
  <button @click="isDark = !isDark" class="px-3 py-1 rounded-xl border border-white/10 hover:bg-gray-900/5 dark:hover:bg-white/10">
    <span v-if="isDark">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>
