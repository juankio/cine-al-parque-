<script setup>
const props = defineProps({
  movie: { type: Object, required: true } // { id, title, time, rating, poster }
})
</script>

<template>
  <article class="rounded-2xl overflow-hidden border border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
    <img :src="movie.poster" :alt="movie.title" class="w-full aspect-[3/4] object-cover">
    <div class="p-4">
      <h3 class="font-bold text-lg">{{ movie.title }}</h3>
      <p class="text-sm opacity-80">{{ movie.time }} · {{ movie.rating }}</p>
      <div class="mt-3 flex gap-2">
        <NuxtLink :to="`/sala?movie=${movie.id}`" class="px-3 py-1 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900">Reservar</NuxtLink>
        <NuxtLink :to="`/admin?movie=${movie.id}`" class="px-3 py-1 rounded-xl border border-white/10">Admin</NuxtLink>
      </div>
    </div>
  </article>
</template>
