<script setup>
const props = defineProps({
  movie: { type: Object, required: true }
})

const movieLink = computed(() => {
  const id = props.movie?.id
  return id ? `/movie/${id}` : "#"
})

const adminLink = computed(() => {
  const id = props.movie?.id
  return id ? `/admin?movie=${encodeURIComponent(id)}` : "/admin"
})

const formattedPrice = computed(() => {
  const price = props.movie?.price
  if (price === undefined || price === null) return ""
  const numeric = Number(price)
  if (Number.isNaN(numeric)) return ""
  return numeric.toLocaleString()
})
</script>

<template>
  <article class="card overflow-hidden">
    <img :src="movie.poster || '/fallback.jpg'" :alt="movie.title" class="w-full aspect-[3/4] object-cover">
    <div class="card-body">
      <h3 class="card-title">{{ movie.title }}</h3>
      <p class="card-sub">
        {{ movie.rating }} | {{ movie.time }}<br>
        <span v-if="formattedPrice">${{ formattedPrice }}</span>
      </p>
      <div class="mt-3 flex gap-2">
        <NuxtLink :to="movieLink" class="btn btn-primary" :aria-disabled="movieLink === '#'">Ver horarios</NuxtLink>
        <NuxtLink :to="adminLink" class="btn btn-outline">Admin</NuxtLink>
      </div>
    </div>
  </article>
</template>
