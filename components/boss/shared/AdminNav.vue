<script setup>
const route = useRoute()

const items = computed(() => ([
  [
    { label: 'Dashboard',    to: '/admin',            icon: 'i-heroicons-home',         active: route.path === '/admin' },
    { label: 'Películas',    to: '/admin/movies',     icon: 'i-heroicons-film',         active: route.path.startsWith('/admin/movies') },
    { label: 'Menú',         to: '/admin/menu', icon: 'i-heroicons-list-bullet',  active: route.path.startsWith('/admin/menu') },
    { label: 'Ingredientes', to: '/admin/ingredients',icon: 'i-heroicons-cube',         active: route.path.startsWith('/admin/ingredients') },
    { label: 'Recetas',      to: '/admin/recipes',    icon: 'i-heroicons-book-open',    active: route.path.startsWith('/admin/recipes') },
    { label: 'KPI',          to: '/admin/kpi',        icon: 'i-heroicons-chart-bar',    active: route.path.startsWith('/admin/kpi') }
  ]
]))
</script>

<template>
  <aside class="w-72 shrink-0 border-r border-default bg-default/80 backdrop-blur p-5">
    <UNavigationMenu
      orientation="vertical"
      highlight
      highlight-color="primary"
      :items="items"
      class="
        data-[orientation=vertical]:w-full
        gap-2
        [&_a]:text-base md:[&_a]:text-lg
        [&_a]:font-medium
        [&_a]:py-2
        [&_svg]:w-5 [&_svg]:h-5
      "
    />
  </aside>
</template>
