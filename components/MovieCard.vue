<template>
  <UCard class="group overflow-hidden shadow-sm hover:shadow transition">
    <div class="flex gap-4">
      <!-- Poster -->
      <div class="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-black/10">
        <img
          v-if="movie.poster"
          :src="movie.poster"
          :alt="movie.titulo"
          class="h-full w-full object-cover transition group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div v-else class="flex h-full w-full items-center justify-center text-xs text-neutral-400">
          Sin poster
        </div>

        <UBadge v-if="movie.clasificacion" class="absolute bottom-1 left-1" color="black" variant="solid" size="xs">
          {{ movie.clasificacion }}
        </UBadge>
      </div>

      <!-- Info -->
      <div class="min-w-0 flex-1">
        <h3 class="line-clamp-2 text-base font-semibold">
          {{ movie.titulo }}
        </h3>

        <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {{ movie.duracion ? movie.duracion + ' min · ' : '' }}Cartelera
        </p>

        <p v-if="movie.sinopsis" class="mt-2 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-300">
          {{ movie.sinopsis }}
        </p>

        <!-- Próximos horarios -->
        <div class="mt-3 flex flex-wrap gap-2">
          <UButton
            v-for="s in nextShowtimes"
            :key="s.id || s._id"
            :to="`/showtimes/${s.id || s._id}`"
            size="xs"
            variant="soft"
            color="gray"
            title="Ver asientos y reservar"
          >
            🎟 {{ formatHour(s.fechaHora) }}
            <span class="opacity-60">· {{ s.sala }}</span>
            <span class="ml-1 font-semibold">$ {{ formatPrice(s.price) }}</span>
          </UButton>

          <span v-if="nextShowtimes.length === 0" class="text-xs text-neutral-500">
            No hay horarios próximos
          </span>
        </div>

        <!-- CTA -->
        <div class="mt-4 flex gap-2">
          <UButton :to="movieLink" color="primary" size="sm">Ver detalles</UButton>
          <UButton
            v-if="nextShowtimes.length"
            :to="`/showtimes/${nextShowtimes[0]._id || nextShowtimes[0].id}`"
            variant="outline"
            size="sm"
          >
            Reservar rápido
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  movie: { type: Object, required: true },
  nextShowtimes: { type: Array, default: () => [] }
})

const movieLink = computed(() => `/movies/${props.movie.id}`)

function formatHour (iso) {
  const d = new Date(iso)
  return d.toLocaleString('es-CO', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

function formatPrice (n) {
  const num = Number(n || 0)
  return num.toLocaleString('es-CO')
}
</script>
