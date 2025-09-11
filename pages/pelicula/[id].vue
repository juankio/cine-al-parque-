<script setup>
const route = useRoute()
const movieId = computed(() => route.params.id)

const { data: movie } = await useFetch('/assets/data/movies.json', {
  transform: (arr) => Array.isArray(arr) ? arr.find(m => m.id === movieId.value) : null
})

const title = computed(() => movie.value?.titulo || 'Película')
useHead({ title })
</script>

<template>
  <section v-if="movie">
    <div class="grid md:grid-cols-3 gap-6">
      <img :src="movie.poster" :alt="movie.titulo" class="w-full rounded-2xl border border-white/10">
      <div class="md:col-span-2 space-y-3">
        <h1 class="text-3xl font-bold">{{ movie.titulo }}</h1>
        <p class="text-sm text-gray-400">
          {{ movie.clasificacion }} • {{ movie.duracion }} min
        </p>
        <p class="text-gray-200">{{ movie.sinopsis }}</p>

        <div class="pt-2">
          <h3 class="font-semibold mb-2">Horarios</h3>
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="h in movie.horarios"
              :key="h"
              class="px-3 py-1 rounded bg-white text-gray-900 text-sm"
              :to="`/sala?movie=${movie.id}&hora=${encodeURIComponent(h)}`"
            >
              Reservar {{ h }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>

  <p v-else class="text-gray-400">Película no encontrada.</p>
</template>
