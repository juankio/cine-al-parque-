<script setup>
import { useCartelera } from '@/composables/useCartelera'
const { filtered, q, loading } = useCartelera()

</script>

<template>
  <section>
    <header class="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold">Cartelera</h1>
        <p class="text-sm text-gray-300">Elige la película y horario para reservar tu mesa.</p>
      </div>
      <input
        v-model="q"
        type="search"
        placeholder="Buscar título…"
        class="bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/40"
      />
    </header>

    <div v-if="loading" class="text-gray-400">Cargando…</div>
    <div v-else class="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
      <MovieCard v-for="m in filtered" :key="m.id" :movie="m" />
      <p v-if="filtered.length===0" class="text-gray-400">No hay resultados.</p>
    </div>
  </section>
</template>
