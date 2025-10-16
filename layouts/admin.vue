<template>
  <div class="min-h-screen flex">
    <AdminNav />
    <main class="flex-1 p-4 space-y-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AdminNav from '~/components/AdminNav.vue'
definePageMeta({ layout: false }) // usamos este layout directo en las páginas admin
</script>
