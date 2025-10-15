<template>
  <button
    @click="toggle"
    class="rounded-lg px-2.5 py-1 text-xs font-medium border border-theme
           hover:bg-brand/10 text-foreground"
    :title="isDark ? 'Cambiar a claro' : 'Cambiar a oscuro'"
  >
    <span v-if="isDark">☀️ Claro</span>
    <span v-else>🌙 Oscuro</span>
  </button>
</template>

<script setup lang="ts">
const isDark = computed(() => document?.documentElement?.classList.contains('dark'))
const toggle = () => {
  // @ts-ignore
  // lo expone el plugin
  window.__toggleTheme?.()
}
</script>
