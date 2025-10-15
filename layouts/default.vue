
<template>
  <div class="min-h-screen bg-surface text-foreground">
    <Navbar />
    <main class="mx-auto w-full max-w-6xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
<script setup lang="ts">
import Navbar from '~/components/Navbar.vue'
</script>
