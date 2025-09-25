<script setup>
import MovieCard from "~/components/MovieCard.vue"

const movies = ref([])

const toPlainId = (value) => {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value.toString === "function") return value.toString()
  return `${value}`
}

onMounted(async () => {
  try {
    const res = await fetch("/api/movies", { headers: { Accept: "application/json" } })
    if (!res.ok) throw new Error("Error cargando cartelera")
    const data = await res.json()

    movies.value = Array.isArray(data)
      ? data.map((m) => {
          const duration = Number(m.duracion ?? m.duration ?? 0) || 0
          const id = toPlainId(m.id ?? m._id)

          return {
            id,
            title: m.titulo ?? m.title ?? "",
            poster: m.poster ?? "",
            sinopsis: m.sinopsis ?? "",
            rating: m.clasificacion ?? m.rating ?? "",
            duration,
            time: `${duration} min`,
            price: m.price ?? null
          }
        })
      : []
  } catch (e) {
    console.error(e)
  }
})
</script>

<template>
  <section class="space-y-8">
    <header class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold">Cartelera de hoy</h1>
        <p class="opacity-80 text-sm">Elige la funcion y reserva tu puesto.</p>
      </div>
    </header>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <MovieCard v-for="m in movies" :key="m.id" :movie="m" />
    </div>
  </section>
</template>
