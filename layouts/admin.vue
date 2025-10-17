<script setup lang="ts">
import AdminNav from '~/components/AdminNav.vue'
import Navbar from '~/components/Navbar.vue'

</script>

<template>
  <div class="min-h-screen bg-surface text-foreground">
    <Navbar />
    <div class="flex min-h-screen">
      <AdminNav class="w-60 border-r border-theme/20" />
      <main class="flex-1 p-6 bg-surface transition-colors">
        <slot />
      </main>
    </div>
  </div>
</template>
