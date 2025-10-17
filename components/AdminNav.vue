<template>
  <aside
    class="w-56 shrink-0 border-r border-theme bg-surface/70 backdrop-blur p-3 space-y-2"
  >
    <NuxtLink to="/admin" class="block rounded-lg px-3 py-2 text-sm hover:bg-brand/10"
      >Dashboard</NuxtLink
    >
    <NuxtLink
      to="/admin/movies"
      class="block rounded-lg px-3 py-2 text-sm hover:bg-brand/10"
      >Películas</NuxtLink
    >
    <NuxtLink
      to="/admin/menu-items"
      class="block rounded-lg px-3 py-2 text-sm hover:bg-brand/10"
      >Menú</NuxtLink
    >
    <NuxtLink
      to="/admin/ingredients"
      class="block rounded-lg px-3 py-2 text-sm hover:bg-brand/10"
      >Ingredientes</NuxtLink
    >
    <NuxtLink
      to="/admin/recipes"
      class="block rounded-lg px-3 py-2 text-sm hover:bg-brand/10"
      >Recetas</NuxtLink
    >
    <NuxtLink to="/admin/kpi" class="block rounded-lg px-3 py-2 text-sm hover:bg-brand/10"
      >KPI</NuxtLink
    >
  </aside>
</template>
