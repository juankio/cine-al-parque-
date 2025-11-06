<template>
  <UCard class="rounded-2xl p-6 bg-gradient-to-r from-primary/10 to-transparent border-none">
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
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

function onUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

