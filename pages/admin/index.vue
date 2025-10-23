<template>
  <section class="space-y-3">
    <h1 class="text-2xl font-bold">Admin · Dashboard</h1>
    <p class="text-muted">Gestiona cartelera, funciones y KPI.</p>

    <div class="grid gap-3 md:grid-cols-3">
      <UButton
        to="/admin/movies"
        block
        size="lg"
        variant="soft"
        color="primary"
        class="justify-start rounded-xl py-6"
      >
        <span class="text-xl mr-2">🎬</span> Películas
      </UButton>

      <UButton
        to="/admin/showtimes"
        block
        size="lg"
        variant="soft"
        color="primary"
        class="justify-start rounded-xl py-6"
      >
        <span class="text-xl mr-2">🕒</span> Funciones
      </UButton>

      <UButton
        to="/admin/kpi"
        block
        size="lg"
        variant="soft"
        color="primary"
        class="justify-start rounded-xl py-6"
      >
        <span class="text-xl mr-2">📈</span> KPI
      </UButton>
    </div>
  </section>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: ['admin'] })
</script>
