<script setup>
const route = useRoute()
const id = computed(() => route.params.id)

const movie = ref(null)
const showtimes = ref([])
const loading = ref(true)
const err = ref("")

const toPlainId = (value) => {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value.toString === "function") return value.toString()
  return `${value}`
}

const normalizeShowtime = (st) => {
  const showtimeId = toPlainId(st.id ?? st._id)
  return {
    ...st,
    id: showtimeId
  }
}

onMounted(async () => {
  try {
    const movieRes = await fetch(`/api/movies/${encodeURIComponent(id.value)}`, {
      headers: { Accept: "application/json" }
    })
    if (!movieRes.ok) throw new Error("No se pudo cargar la pelicula")
    const movieData = await movieRes.json()
    movie.value = {
      ...movieData,
      id: toPlainId(movieData.id ?? movieData._id)
    }

    const showtimeRes = await fetch(`/api/movies/${encodeURIComponent(id.value)}/showtimes`, {
      headers: { Accept: "application/json" }
    })
    if (!showtimeRes.ok) throw new Error("No se pudieron cargar los horarios")
    const showtimeData = await showtimeRes.json()
    showtimes.value = Array.isArray(showtimeData)
      ? showtimeData.map(normalizeShowtime)
      : []
  } catch (e) {
    console.error(e)
    err.value = e?.message ?? "Error cargando datos"
  } finally {
    loading.value = false
  }
})

function fmt(dt) {
  if (!dt) return ""
  const parsed = new Date(dt)
  return Number.isNaN(parsed.valueOf()) ? `${dt}` : parsed.toLocaleString()
}
</script>

<template>
  <section class="space-y-6">
    <NuxtLink to="/" class="btn btn-outline"><- Cartelera</NuxtLink>

    <div v-if="loading" class="opacity-70 text-sm">Cargando...</div>
    <div v-else-if="err" class="text-red-400 text-sm">{{ err }}</div>

    <div v-else class="grid gap-6 md:grid-cols-[280px,1fr]">
      <img
        :src="movie?.poster || '/fallback.jpg'"
        :alt="movie?.titulo || movie?.title"
        class="w-full max-w-[280px] aspect-[3/4] object-cover rounded-2xl border border-white/10"
      >
      <div class="space-y-4">
        <div>
          <h1 class="text-2xl font-extrabold">{{ movie?.titulo || movie?.title }}</h1>
          <p class="opacity-80 text-sm">
            {{ movie?.clasificacion || movie?.rating || '' }} | {{ movie?.duracion || movie?.duration || 0 }} min
          </p>
        </div>
        <p class="opacity-80">{{ movie?.sinopsis }}</p>

        <div class="card">
          <div class="card-body">
            <h2 class="card-title mb-2">Horarios</h2>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="st in showtimes"
                :key="st.id"
                :to="`/sala?showtime=${st.id}`"
                class="chip hover:brightness-110"
              >
                {{ fmt(st.fechaHora || st.datetime) }}
                <span v-if="st.sala"> | {{ st.sala }}</span>
                <span v-if="st.precio"> | ${{ Number(st.precio).toLocaleString() }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
