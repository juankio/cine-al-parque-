<template>
  <Motion tag="section" v-bind="sectionProps">
    <Motion tag="h2" class="text-xl font-semibold mb-3" v-bind="headerMotion">En cartelera</Motion>

    <div v-if="props.loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Motion
        v-for="i in 6"
        :key="i"
        tag="div"
        v-bind="skeletonMotion(i)"
      >
        <USkeleton class="h-56 rounded-2xl" />
      </Motion>
    </div>

    <UAlert
      v-else-if="props.error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="props.error"
      title="No se pudo cargar la cartelera"
    />

    <div v-else-if="props.filtered.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Motion
        v-for="(m, idx) in props.filtered"
        :key="m.id"
        tag="div"
        class="motion-card h-full"
        v-bind="cardMotion(idx)"
      >
        <UCard class="motion-card__inner rounded-2xl hover:bg-muted/30 transition h-full">
          <img :src="m.poster || '/favicon.ico'" class="w-full h-48 object-cover rounded-lg border border-default/60" />
          <div class="mt-3">
            <div class="font-semibold truncate">{{ m.titulo }}</div>
            <div class="text-xs text-muted">
              {{ m.clasificacion || '-' }} - {{ m.duracion ? `${m.duracion} min` : '-' }}
            </div>

            <div class="mt-2 flex flex-wrap gap-2">
              <UButton
                v-for="s in props.upcomingShowtimes(m.id, 3)"
                :key="s.id"
                size="xs"
                variant="outline"
                color="primary"
                :to="`/showtimes/${s.id}`"
              >
                {{ fmtTime(s.fechaHora) }}
              </UButton>
            </div>
          </div>
        </UCard>
      </Motion>
    </div>

    <EmptyState v-else description="No hay peliculas que coincidan con tu busqueda." />
  </Motion>
</template>

<script setup lang="ts">
import type { Movie, Showtime } from '~/composables/useMovies'
import { useAttrs, computed } from 'vue'

const props = defineProps<{
  loading: boolean
  error: string | null
  filtered: Movie[]
  upcomingShowtimes: (movieId: string, limit?: number) => Showtime[]
}>()

type MotionPreset = {
  initial: Record<string, any>
  visible: Record<string, any>
  hover?: Record<string, any>
}

const attrs = useAttrs()

const rollBottom = (delay = 0): MotionPreset => ({
  initial: {
    opacity: 0,
    y: 40,
    rotateX: -60,
    scale: 0.95,
    transformOrigin: 'bottom center',
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      delay,
      type: 'spring',
      stiffness: 190,
      damping: 21,
      mass: 0.9,
    },
  },
})

const withHoverTilt = (preset: MotionPreset): MotionPreset => ({
  ...preset,
  hover: {
    scale: 1.025,
    rotateX: -1.4,
    rotateY: 1.4,
    transition: {
      type: 'spring',
      stiffness: 240,
      damping: 19,
    },
  },
})

const sectionMotion = rollBottom(0.05)
const headerMotion = { ...rollBottom(0.07), visibleOnce: true }
const skeletonMotion = (index: number) => ({ ...rollBottom(0.09 + index * 0.05), visibleOnce: true })
const cardMotion = (index: number) => ({
  ...withHoverTilt(rollBottom(0.12 + index * 0.06)),
  visibleOnce: true,
})

const sectionProps = computed(() => ({
  ...attrs,
  ...sectionMotion,
  visibleOnce: true,
}))

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}
</script>

