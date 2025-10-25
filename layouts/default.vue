<script setup>
// sin imports, auto-import
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-background text-foreground transition-colors">
      <Navbar />
      <UContainer class="py-8">
        <slot />
      </UContainer>
    </div>
  </UApp>
</template>
