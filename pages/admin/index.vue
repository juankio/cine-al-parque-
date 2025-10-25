<script setup>
definePageMeta({ layout: 'admin', middleware: ['admin'] })
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <PageHeader
      title="Admin · Dashboard"
      subtitle="Gestiona cartelera, funciones y KPI."
    />

    <div class="grid gap-4 md:grid-cols-3">
  <NuxtLink to="/admin/movies">
    <UCard class="p-6 hover:bg-primary/5 transition rounded-2xl cursor-pointer">
      <div class="flex items-center text-lg font-semibold">
        <span class="text-2xl mr-3">🎬</span> Películas
      </div>
      <p class="text-sm text-muted mt-1">Administra la cartelera</p>
    </UCard>
  </NuxtLink>

  <NuxtLink to="/admin/showtimes">
    <UCard class="p-6 hover:bg-primary/5 transition rounded-2xl cursor-pointer">
      <div class="flex items-center text-lg font-semibold">
        <span class="text-2xl mr-3">🕒</span> Funciones
      </div>
      <p class="text-sm text-muted mt-1">Crea horarios y gestiona salas</p>
    </UCard>
  </NuxtLink>

  <NuxtLink to="/admin/kpi">
    <UCard class="p-6 hover:bg-primary/5 transition rounded-2xl cursor-pointer">
      <div class="flex items-center text-lg font-semibold">
        <span class="text-2xl mr-3">📈</span> KPI
      </div>
      <p class="text-sm text-muted mt-1">Métricas clave del cine</p>
    </UCard>
  </NuxtLink>
</div>

  </UContainer>
</template>
