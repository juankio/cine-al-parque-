<script setup lang="ts">
const model = defineModel<{ fechaHora: string; sala: string; price: number }>({ required: true })
</script>

<template>
  <div class="grid gap-3 md:grid-cols-4">
    <FieldDateTime v-model="model.fechaHora" />
    <UInput v-model.trim="model.sala" placeholder="Sala" />
    <UInput v-model.number="model.price" type="number" min="0" placeholder="Precio" />
    <UButton type="submit" color="primary">Crear función</UButton>
  </div>
</template>
