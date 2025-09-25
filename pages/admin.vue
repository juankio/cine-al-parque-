<script setup>

definePageMeta({ middleware: 'auth' })

// Demo visual. Sustituir por datos reales del back
const stats = ref([
  { label: 'Reservas hoy', value: 47, sub: 'Corte 9:00 PM' },
  { label: 'Ocupacion', value: '62%', sub: 'Todas las funciones' },
  { label: 'Funciones activas', value: 3, sub: 'Hoy' }
])
</script>

<template>
  <section class="space-y-6">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-extrabold">Panel Admin</h1>
        <p class="opacity-80 text-sm">Resumen rapido de la jornada.</p>
      </div>
      <NuxtLink to="/" class="btn btn-outline">Volver</NuxtLink>
    </header>

    <div class="grid sm:grid-cols-3 gap-4">
      <KpiCard v-for="s in stats" :key="s.label" :label="s.label" :value="s.value" :sub="s.sub" />
    </div>

    <div class="card">
      <div class="card-body">
        <h2 class="card-title mb-2">Peliculas</h2>
        <div class="flex flex-wrap gap-2">
          <button class="btn btn-primary">Crear</button>
          <button class="btn btn-outline">Editar</button>
          <button class="btn btn-outline">Eliminar</button>
        </div>
      </div>
    </div>
  </section>
</template>
