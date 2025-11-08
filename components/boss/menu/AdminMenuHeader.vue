<script setup lang="ts">
const query = defineModel<string>('query', { default: '' })
const emit = defineEmits<{ create: [] }>()
</script>

<template>
  <Motion
    tag="div"
    :initial="{ opacity: 0, y: -12 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }"
  >
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-muted">panel</p>
        <h1 class="text-2xl font-semibold">Menú</h1>
        <p class="text-sm text-muted">Gestiona productos, estados y recetas vinculadas.</p>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <UInput
          v-model.trim="query"
          placeholder="Buscar producto…"
          icon="i-heroicons-magnifying-glass-20-solid"
          class="w-full sm:w-64"
        />
        <UButton
          color="primary"
          class="w-full sm:w-auto"
          @click="emit('create')"
        >
          Nuevo
        </UButton>
      </div>
    </div>
  </Motion>
</template>
