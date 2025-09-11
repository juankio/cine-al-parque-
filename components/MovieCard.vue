<script setup>
defineProps({
  movie: { type: Object, required: true }
})
</script>

<template>
  <article class="rounded-2xl overflow-hidden border border-white/10 bg-gray-800/60">
    <NuxtLink :to="`/pelicula/${movie.id}`" class="block">
      <img :src="movie.poster" :alt="movie.titulo" class="w-full h-64 object-cover">

    </NuxtLink>
    <div class="p-4 space-y-2">
      <h3 class="font-semibold text-lg">
        <NuxtLink :to="`/pelicula/${movie.id}`">{{ movie.titulo }}</NuxtLink>
      </h3>
      <p class="text-xs text-gray-400">
        {{ movie.clasificacion }} • {{ movie.duracion }} min
      </p>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="h in movie.horarios"
          :key="h"
          class="px-2 py-1 rounded bg-white text-gray-900 text-xs"
          :to="`/sala?movie=${movie.id}&hora=${encodeURIComponent(h)}`"
        >
          Reservar {{ h }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
