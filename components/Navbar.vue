<script setup>
import ThemeToggle from "~/components/ThemeToggle.vue"
const links = [
  { to: '/', label: 'Cartelera' },
  { to: '/sala', label: 'Sala' },
  { to: '/admin', label: 'Admin' }
]
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-white/10 backdrop-blur bg-white/60 dark:bg-gray-900/60">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4 justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <div class="w-9 h-9 rounded-2xl bg-brand/90 text-white grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,.10)]">🎬</div>
        <span class="text-lg font-extrabold tracking-tight select-none">
          <span class="animate-pulse-slow text-brand">Cine</span> al Parque
        </span>
      </NuxtLink>

      <nav class="hidden sm:flex gap-1 text-sm">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to"
          class="px-3 py-1 rounded-xl hover:bg-gray-900/5 dark:hover:bg-white/10 transition"
          active-class="bg-gray-900/90 text-white dark:bg-white dark:text-gray-900">
          {{ l.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <ThemeToggle />
        <NuxtLink to="/sala" class="hidden sm:inline-flex px-3 py-1 rounded-xl bg-brand text-white font-semibold">Reservar</NuxtLink>
      </div>
    </div>
  </header>
</template>
