<template>
  <section class="space-y-2">
    <h1 class="text-2xl font-bold">Admin · Dashboard</h1>
    <p class="text-neutral-500">Gestiona cartelera, funciones y KPI.</p>
    <div class="grid gap-3 md:grid-cols-3">
      <NuxtLink
        to="/admin/movies"
        class="rounded-xl border border-theme p-4 hover:bg-brand/10"
        >🎬 Películas</NuxtLink
      >
      <NuxtLink
        to="/admin/showtimes"
        class="rounded-xl border border-theme p-4 hover:bg-brand/10"
        >🕒 Funciones</NuxtLink
      >
      <NuxtLink
        to="/admin/kpi"
        class="rounded-xl border border-theme p-4 hover:bg-brand/10"
        >📈 KPI</NuxtLink
      >
    </div>
  </section>
</template>

<script setup lang="ts">
import Admin from "~/layouts/admin.vue";
definePageMeta({ layout: "admin", middleware: ["admin"] });
</script>
