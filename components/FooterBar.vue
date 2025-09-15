<template>
  <footer class="border-t border-white/10">
    <div class="max-w-6xl mx-auto px-6 py-6 text-sm opacity-80 flex flex-col sm:flex-row gap-2 items-center justify-between">
      <p>© {{ new Date().getFullYear() }} Cine al Parque</p>
      <div class="flex items-center gap-3">
        <NuxtLink to="/politica" class="hover:underline">Política</NuxtLink>
        <NuxtLink to="/contacto" class="hover:underline">Contacto</NuxtLink>
      </div>
    </div>
  </footer>
</template>
