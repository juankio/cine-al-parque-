<template>
  <Motion tag="section" v-bind="sectionProps">
    <Motion tag="div" class="flex items-center justify-between mb-3" v-bind="headerMotion">
      <div class="text-xl font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-fire" class="text-primary" /> Combos para hoy
      </div>
      <UButton
        v-if="!props.loading"
        size="xs"
        variant="ghost"
        color="gray"
        @click="emit('refresh')"
      >
        Actualizar
      </UButton>
    </Motion>

    <div v-if="props.loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Motion
        v-for="i in 6"
        :key="i"
        tag="div"
        v-bind="skeletonMotion(i)"
      >
        <USkeleton class="h-28 rounded-2xl" />
      </Motion>
    </div>

    <div v-else-if="props.error" class="space-y-2">
      <UAlert
        color="gray"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        :description="props.error"
        title="No se pudieron cargar los combos"
      />
      <UButton size="xs" color="primary" variant="soft" @click="emit('refresh')">
        Reintentar
      </UButton>
    </div>

    <div v-else-if="props.combos.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Motion
        v-for="(c, idx) in props.combos"
        :key="c._id"
        tag="div"
        class="motion-card h-full"
        v-bind="cardMotion(idx)"
      >
        <UCard class="motion-card__inner rounded-2xl h-full border border-default/40 bg-gradient-to-b from-default/40 to-transparent hover:border-primary/60 transition">
          <div class="flex flex-col gap-4 h-full">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 space-y-1">
                <p class="text-[11px] uppercase tracking-wide text-muted flex items-center gap-1">
                  <UIcon name="i-heroicons-sparkles" class="text-primary" />
                  Recomendado
                </p>
                <div class="font-semibold text-base truncate">{{ c.nombre }}</div>
              </div>
              <div class="text-right shrink-0">
                <p class="text-[11px] text-muted">Desde</p>
                <p class="text-lg font-bold text-primary">$ {{ money(c.precio) }}</p>
              </div>
            </div>

            <p v-if="c.descripcion" class="text-sm text-muted leading-snug line-clamp-2">
              {{ c.descripcion }}
            </p>

            <div class="flex flex-wrap gap-2 text-xs">
              <UBadge
                v-if="c.categoria"
                size="sm"
                variant="soft"
                color="primary"
                class="capitalize px-2.5 py-1 rounded-full text-[11px]"
              >
                {{ c.categoria }}
              </UBadge>
              <span
                v-for="t in (c.tags || [])"
                :key="t"
                class="inline-flex items-center gap-1 rounded-full border border-default/30 px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted"
              >
                <UIcon name="i-heroicons-hashtag" class="text-primary/70" />
                {{ t }}
              </span>
            </div>

            <div class="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-default/40">
              <span class="text-xs text-muted">
                Listo en minutos
              </span>
              <UButton
                size="sm"
                color="primary"
                :to="`/menu`"
                variant="solid"
                icon="i-heroicons-arrow-right"
                trailing
              >
                Ver
              </UButton>
            </div>
          </div>
        </UCard>
      </Motion>
    </div>

    <EmptyState v-else description="Aun no hay combos disponibles." />
  </Motion>
</template>

<script setup lang="ts">
import { useAttrs, computed } from 'vue'

interface ComboItem {
  _id: string
  nombre: string
  precio: number
  categoria?: string
  tags?: string[]
}

const props = defineProps<{
  loading: boolean
  error: string | null
  combos: ComboItem[]
}>()

const emit = defineEmits<{
  (event: 'refresh'): void
}>()

type MotionPreset = {
  initial: Record<string, any>
  enter: Record<string, any>
  hover?: Record<string, any>
}

const attrs = useAttrs()

const rollBottom = (delay = 0): MotionPreset => ({
  initial: {
    opacity: 0,
    y: 38,
    rotateX: -55,
    scale: 0.95,
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
      stiffness: 195,
      damping: 20,
      mass: 0.9,
    },
  },
})

const withHoverLift = (preset: MotionPreset): MotionPreset => ({
  ...preset,
  hover: {
    scale: 1.03,
    rotateX: -1.6,
    rotateY: 1.6,
    transition: {
      type: 'spring',
      stiffness: 240,
      damping: 18,
    },
  },
})

const sectionMotion = rollBottom(0.05)
const headerMotion = { ...rollBottom(0.07), visibleOnce: true }
const skeletonMotion = (index: number) => ({ ...rollBottom(0.09 + index * 0.04), visibleOnce: true })
const cardMotion = (index: number) => ({
  ...withHoverLift(rollBottom(0.12 + index * 0.06)),
  visibleOnce: true,
})

const sectionProps = computed(() => ({
  ...attrs,
  ...sectionMotion,
  visibleOnce: true,
}))

function money(n?: number) {
  return (Number(n || 0)).toLocaleString('es-CO')
}
</script>

