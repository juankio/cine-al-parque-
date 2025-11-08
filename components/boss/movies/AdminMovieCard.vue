<script setup lang="ts">
import type { AdminMovie } from '~/composables/admin/useAdminMovies'

const props = defineProps<{
  movie: AdminMovie
  index: number
}>()

const emit = defineEmits<{
  edit: [movie: AdminMovie]
  toggle: [movie: AdminMovie]
  delete: [movie: AdminMovie]
}>()

const fmtMins = (dur?: number) => (dur ? `${dur} min` : '—')
</script>

<template>
  <Motion
    tag="div"
    :initial="{ opacity: 0, y: 28, scale: 0.95 }"
    :enter="{
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: index * 0.05, duration: 0.4, ease: 'easeOut' },
    }"
    :hover="{ translateY: -4, scale: 1.01 }"
  >
    <UCard
      class="group rounded-2xl border border-default/60 cursor-pointer transition hover:bg-primary/5 hover:ring-1 hover:ring-primary/30"
      @click="emit('edit', movie)"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:gap-3">
        <img
          :src="movie.poster || '/favicon.ico'"
          class="h-48 w-full rounded-xl object-cover border border-default/60 bg-neutral-100 dark:bg-neutral-800 sm:h-24 sm:w-16 sm:rounded-lg"
        />

        <div class="min-w-0 flex-1 space-y-3">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
            <div class="min-w-0">
              <div class="font-semibold truncate text-gray-900 dark:text-gray-100">
                {{ movie.titulo }}
              </div>
              <p class="text-xs text-muted">
                {{ movie.clasificacion || '-' }} · {{ fmtMins(movie.duracion) }}
              </p>
            </div>

            <UBadge
              :color="movie.activo ? 'success' : 'neutral'"
              size="xs"
              variant="soft"
              class="w-fit"
              @click.stop="emit('toggle', movie)"
            >
              {{ movie.activo ? 'Activo' : 'Inactivo' }}
            </UBadge>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <UButton
              :to="`/admin/movies/${movie._id}/showtimes`"
              size="xs"
              variant="outline"
              color="success"
              class="w-full sm:w-auto"
              @click.stop
            >
              Funciones
            </UButton>

            <UButton
              size="xs"
              variant="ghost"
              color="neutral"
              class="w-full sm:w-auto"
              @click.stop="emit('edit', movie)"
            >
              Editar
            </UButton>

            <UButton
              size="xs"
              variant="ghost"
              color="primary"
              icon="i-heroicons-trash"
              class="w-full sm:w-auto"
              @click.stop="emit('delete', movie)"
              aria-label="Eliminar"
            />
          </div>
        </div>
      </div>
    </UCard>
  </Motion>
</template>
