<script setup lang="ts">
const query = defineModel<string>('query', { default: '' })

const emit = defineEmits<{
  create: []
}>()
</script>

<template>
  <PageHeader
    title="Películas"
    subtitle="Activa/desactiva para mostrar en cartelera."
  >
    <template #actions>
      <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <UInput
            v-model.trim="query"
            type="search"
            placeholder="Buscar…"
            icon="i-heroicons-magnifying-glass-20-solid"
            class="w-full sm:w-64"
          />
          <UButton
            v-if="query"
            variant="ghost"
            color="neutral"
            class="w-full sm:w-auto"
            @click="query = ''"
          >
            Limpiar
          </UButton>
        </div>
        <UButton
          color="primary"
          class="w-full sm:w-auto"
          @click="emit('create')"
        >
          Nueva
        </UButton>
      </div>
    </template>
  </PageHeader>
</template>
