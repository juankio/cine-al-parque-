<script setup lang="ts">
const { initialize } = useAuth()
await initialize()
</script>

<template>
  <UApp>
    <!-- ColorScheme se asegura de aplicar la clase 'dark' en <html> al hidratar -->
    <ColorScheme placeholder=" ">
      <div class="min-h-dvh bg-surface text-foreground transition-colors duration-300">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </div>
    </ColorScheme>
  </UApp>
</template>
