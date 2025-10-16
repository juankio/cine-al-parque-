<template>
  <article class="group overflow-hidden rounded-2xl border border-theme bg-surface shadow-sm hover:shadow-md transition">
    <div class="flex gap-4 p-4">
      <!-- Poster -->
      <div class="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl border border-theme/60 bg-black/10">
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
        <span v-if="movie.clasificacion"
          class="absolute bottom-1 left-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
          {{ movie.clasificacion }}
        </span>
      </div>

      <!-- Info -->
      <div class="min-w-0 flex-1">
        <h3 class="line-clamp-2 text-base font-semibold text-foreground">
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
          <NuxtLink
            v-for="s in nextShowtimes"
            :key="s.id"
            :to="`/showtimes/${s.id}`"
            class="inline-flex items-center gap-1 rounded-lg border border-theme bg-surface px-2.5 py-1.5 text-xs font-medium hover:bg-brand/10"
            title="Ver asientos y reservar"
          >
            <span>🎟</span>
            <span>{{ formatHour(s.fechaHora) }}</span>
            <span class="opacity-60">· {{ s.sala }}</span>
            <span class="ml-1 font-semibold">$ {{ s.price.toLocaleString('es-CO') }}</span>
          </NuxtLink>

          <span v-if="nextShowtimes.length === 0" class="text-xs text-neutral-500">
            No hay horarios próximos
          </span>
        </div>

        <!-- CTA -->
        <div class="mt-4 flex gap-2">
          <NuxtLink
            :to="movieLink"
            class="rounded-xl bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110">
            Ver detalles
          </NuxtLink>
          <NuxtLink
            v-if="nextShowtimes.length"
            :to="`/showtimes/${nextShowtimes[0].id}`"
            class="rounded-xl border border-theme px-3 py-1.5 text-xs font-semibold hover:bg-brand/10">
            Reservar rápido
          </NuxtLink>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Movie, Showtime } from '~/composables/useMovies'

const props = defineProps<{
  movie: Movie
  nextShowtimes: Showtime[]
}>()

const movieLink = computed(() => `/movies/${props.movie.id}`)

const formatHour = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString('es-CO', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>
