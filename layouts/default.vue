<script setup>
const links = [
  { to: '/', label: 'Cartelera' },
  { to: '/sala', label: 'Sala' },
  { to: '/admin', label: 'Admin' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <header class="border-b border-white/10">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold">Cine al Parque</NuxtLink>
        <nav class="flex gap-2 text-sm">
          <NuxtLink
            v-for="l in links" :key="l.to" :to="l.to"
            class="px-3 py-1 rounded hover:bg-white/10"
            active-class="bg-white text-gray-900"
          >
            {{ l.label }}
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main class="max-w-6xl mx-auto px-6 py-6">
      <NuxtPage />
    </main>
  </div>
</template>
