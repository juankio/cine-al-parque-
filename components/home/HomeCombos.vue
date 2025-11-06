<template>
  <Motion tag="section" v-bind="sectionProps">
    <Motion tag="h2" class="text-xl font-semibold mb-3 flex items-center gap-2" v-bind="headerMotion">
      <UIcon name="i-heroicons-fire" class="text-primary" /> Combos para hoy
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

    <UAlert
      v-else-if="props.error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="props.error"
      title="No se pudieron cargar los combos"
    />

    <div v-else-if="props.combos.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Motion
        v-for="(c, idx) in props.combos"
        :key="c._id"
        tag="div"
        class="motion-card h-full"
        v-bind="cardMotion(idx)"
      >
        <UCard class="motion-card__inner rounded-2xl hover:bg-primary/5 transition h-full">
          <div class="flex items-start justify-between">
            <div class="min-w-0">
              <div class="font-semibold truncate">{{ c.nombre }}</div>
              <div class="text-xs text-muted mt-0.5">
                $ {{ money(c.precio) }} <span v-if="c.categoria">- {{ c.categoria }}</span>
              </div>
              <div class="mt-1 flex flex-wrap gap-1">
                <UBadge v-for="t in (c.tags || [])" :key="t" size="xs" variant="soft">#{{ t }}</UBadge>
              </div>
            </div>
            <UButton size="xs" color="primary" :to="`/menu`" variant="outline">Ver</UButton>
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

type MotionPreset = {
  initial: Record<string, any>
  visible: Record<string, any>
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
  visible: {
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

