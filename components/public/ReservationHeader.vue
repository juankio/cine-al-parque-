<script setup lang="ts">
defineProps<{ total: number; taken: number; free: number }>()
</script>

<template>
  <div>
    <h1 class="text-2xl font-extrabold">Selecciona tus sillas</h1>
    <p class="text-sm text-muted">
      Total: {{ total }} · Ocupadas: {{ taken }} · Libres: {{ free }}
    </p>
  </div>
</template>
