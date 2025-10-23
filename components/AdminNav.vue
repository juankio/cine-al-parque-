<template>
  <aside class="w-56 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-surface/80 backdrop-blur p-3 rounded-r-xl">
    <UVerticalNavigation
      :links="[
        { label: 'Dashboard', to: '/admin', icon: 'i-heroicons-home' },
        { label: 'Películas', to: '/admin/movies', icon: 'i-heroicons-film' },
        { label: 'Menú', to: '/admin/menu-items', icon: 'i-heroicons-list-bullet' },
        { label: 'Ingredientes', to: '/admin/ingredients', icon: 'i-heroicons-cube' },
        { label: 'Recetas', to: '/admin/recipes', icon: 'i-heroicons-book-open' },
        { label: 'KPI', to: '/admin/kpi', icon: 'i-heroicons-chart-bar' }
      ]"
    />
  </aside>
</template>
