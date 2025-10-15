<template>
  <section class="space-y-2">
    <h1 class="text-2xl font-extrabold tracking-tight">Inicio (protegido)</h1>
    <p class="text-sm text-neutral-400">
      Solo los usuarios logueados pueden ver esto.
    </p>

    <div class="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <h2 class="text-base font-semibold">Bienvenido 👋</h2>
      <p class="text-sm text-neutral-300">
        Ya tienes la sesión activa. Usa el menú de arriba para navegar.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ auth: true })
</script>
