<script setup>
// sin imports, auto-import
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-background text-foreground transition-colors flex flex-col">
      <Navbar />
      <!-- El main debe expandirse, eliminamos el UContainer global para permitir Full-Bleed -->
      <main class="flex-1 w-full">
        <slot />
      </main>
    </div>
  </UApp>
</template>
