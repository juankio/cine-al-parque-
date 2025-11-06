<template>
  <Motion tag="section" v-bind="sectionProps">
    <Motion tag="div" class="flex items-center justify-between mb-3" v-bind="headerMotion">
      <h2 class="text-xl font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-bolt" class="text-primary" /> En vivo hoy
      </h2>
      <UButton
        v-if="hasSections"
        size="xs"
        variant="ghost"
        color="gray"
        :loading="props.loading"
        @click="emit('refresh')"
      >Actualizar</UButton>
    </Motion>

    <div v-if="props.loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Motion
        v-for="i in 6"
        :key="i"
        tag="div"
        v-bind="skeletonMotion(i)"
      >
        <USkeleton class="h-20 rounded-xl" />
      </Motion>
    </div>

    <UAlert
      v-else-if="props.error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="props.error"
      title="No se pudieron cargar las funciones"
    />

    <div v-else-if="hasSections" class="space-y-5">
      <Motion
        v-for="(section, sectionIndex) in props.sections"
        :key="section.id"
        tag="div"
        class="space-y-3"
        v-bind="listMotion(sectionIndex)"
      >
        <Motion tag="div" class="flex items-center justify-between" v-bind="subheaderMotion(sectionIndex)">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">{{ section.label }}</h3>
        </Motion>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Motion
            v-for="(s, cardIndex) in section.items"
            :key="s._id"
            tag="div"
            class="motion-card h-full"
            v-bind="cardMotion(cardIndex)"
          >
            <UCard class="motion-card__inner rounded-2xl h-full border border-default/40 bg-white/90 dark:bg-slate-900/90 shadow-[0_12px_30px_rgba(15,23,42,.18)] dark:shadow-[0_18px_36px_rgba(0,0,0,.4)] backdrop-blur transition hover:border-primary/60">
              <div class="flex flex-col sm:flex-row gap-4 sm:gap-3 items-start sm:items-center">
                <img :src="s.poster || '/favicon.ico'" class="w-full sm:w-20 h-40 sm:h-24 object-cover rounded-lg border border-default/60" />
                <div class="min-w-0 flex-1 space-y-2 text-left">
                  <div class="font-medium text-base truncate sm:truncate-none">{{ s.titulo || 'Sin titulo' }}</div>
                  <div class="text-xs sm:text-sm text-muted">
                    {{ fmtTime(s.fechaHora) }} • Sala {{ s.sala || '-' }} • $ {{ money(s.price) }}
                  </div>
                  <div class="pt-1">
                    <UButton
                      :to="`/showtimes/${s._id}`"
                      class="w-full sm:w-auto"
                      size="sm"
                      color="primary"
                      variant="solid"
                    >Reservar</UButton>
                  </div>
                </div>
              </div>
            </UCard>
          </Motion>
        </div>
      </Motion>
    </div>

    <EmptyState v-else description="No hay funciones proximas en las proximas 48 horas." />
  </Motion>
</template>

<script setup lang="ts">
import type { PublicShowtime } from '~/composables/useShowtimes'
import { useAttrs, computed } from 'vue'

interface LiveSection {
  id: string
  label: string
  items: PublicShowtime[]
}

const props = defineProps<{
  loading: boolean
  error: string | null
  sections: LiveSection[]
}>()

const emit = defineEmits<{
  (event: 'refresh'): void
}>()

const hasSections = computed(() => props.sections.length > 0)

type MotionPreset = {
  initial: Record<string, any>
  enter: Record<string, any>
  hover?: Record<string, any>
}

const attrs = useAttrs()

const rollBottom = (delay = 0): MotionPreset => ({
  initial: {
    opacity: 0,
    y: 40,
    rotateX: -65,
    scale: 0.94,
    transformOrigin: 'bottom center',
  },
  enter: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      delay,
      type: 'spring',
      stiffness: 190,
      damping: 20,
      mass: 0.9,
    },
  },
})

const withHoverTilt = (preset: MotionPreset): MotionPreset => ({
  ...preset,
  hover: {
    scale: 1.02,
    rotateX: -2,
    rotateY: 2,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
})

const sectionMotion = rollBottom(0.05)
const headerMotion = { ...rollBottom(0.08), visibleOnce: true }
const skeletonMotion = (index: number) => ({ ...rollBottom(0.1 + index * 0.05), visibleOnce: true })
const listMotion = (index: number) => ({ ...rollBottom(0.12 + index * 0.08), visibleOnce: true })
const subheaderMotion = (index: number) => ({ ...rollBottom(0.14 + index * 0.08), visibleOnce: true })
const cardMotion = (index: number) => ({
  ...withHoverTilt(rollBottom(0.18 + index * 0.06)),
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

function money(n?: number) {
  return (Number(n || 0)).toLocaleString('es-CO')
}
</script>

