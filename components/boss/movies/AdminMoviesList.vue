<script setup lang="ts">
import type { AdminMovie } from '~/composables/admin/useAdminMovies'

defineProps<{
  movies: AdminMovie[]
}>()

const emit = defineEmits<{
  edit: [AdminMovie]
  toggle: [AdminMovie]
  delete: [AdminMovie]
}>()
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <AdminMovieCard
      v-for="(movie, index) in movies"
      :key="movie._id"
      :movie="movie"
      :index="index"
      @edit="emit('edit', $event)"
      @toggle="emit('toggle', $event)"
      @delete="emit('delete', $event)"
    />

    <EmptyState
      v-if="movies.length === 0"
      class="sm:col-span-2 lg:col-span-3"
      description="No hay resultados."
    />
  </div>
</template>
