<script setup lang="ts">
import type { AdminMovie } from '~/composables/admin/useAdminMovies'
const model = defineModel<Partial<AdminMovie>>({ default: {} })
</script>

<template>
  <div class="space-y-3">
    <UInput v-model.trim="model.titulo" placeholder="Título" />
    <UInput v-model.trim="model.poster" placeholder="URL poster" />
    <div class="grid grid-cols-2 gap-3">
      <UInput v-model.trim="model.clasificacion" placeholder="Clasificación" />
      <UInput v-model.number="model.duracion" type="number" placeholder="Duración (min)" />
    </div>
    <UTextarea v-model.trim="model.sinopsis" placeholder="Sinopsis" :rows="4" />
    <label class="inline-flex items-center gap-2 text-sm">
      <UCheckbox v-model="model.activo" /> Activo en cartelera
    </label>
  </div>
</template>
