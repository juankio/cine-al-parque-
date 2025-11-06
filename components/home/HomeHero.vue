<template>
  <Motion
    tag="div"
    v-bind="heroProps"
  >
    <UCard class="rounded-2xl p-6 border border-default/60 bg-default/80 backdrop-blur-sm shadow-lg">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Cine al Parque</h1>
          <p class="text-sm text-muted mt-1">
            Compra tu combo, elige funcion y reserva tu mesa en minutos.
          </p>
        </div>
        <UInput
          :model-value="props.modelValue"
          class="w-full md:w-96"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Buscar pelicula..."
          @update:model-value="onUpdate"
        />
      </div>
    </UCard>
  </Motion>
</template>

<script setup lang="ts">
import { useAttrs, computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const attrs = useAttrs()

const heroMotion = {
  initial: {
    opacity: 0,
    y: 42,
    rotateX: -65,
    scale: 0.92,
    transformOrigin: 'bottom center',
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      delay: 0.08,
      type: 'spring',
      stiffness: 210,
      damping: 18,
      mass: 0.9,
    },
  },
  hover: {
    scale: 1.01,
    rotateX: -1,
    rotateY: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
}

const heroProps = computed(() => ({
  ...attrs,
  ...heroMotion,
  visibleOnce: true,
}))

function onUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

