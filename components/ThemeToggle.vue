<template>
  <button
    class="flex items-center gap-2 border border-theme rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-ferrari-red/10 transition"
    @click="toggle"
  >
    <span v-if="isDark">🌞 </span>
    <span v-else>🌙 </span>
  </button>
</template>

<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

const mode = useColorMode() // usa localStorage y clase .dark en html
const isDark = computed(() => mode.value === 'dark')
const toggle = () => {
  mode.value = isDark.value ? 'light' : 'dark'
}
</script>
