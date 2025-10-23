<template>
  <UToggle
    v-model="isDark"
    on-icon="i-heroicons-moon-20-solid"
    off-icon="i-heroicons-sun-20-solid"
    size="lg"
    color="primary"
  />
</template>

<script setup>
const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.preference === 'dark',
  set: (v) => (colorMode.preference = v ? 'dark' : 'light')
})
</script>
