<template>
  <UApp>
    <div class="min-h-screen bg-surface text-foreground transition-colors">
      <Navbar />
      <UContainer class="py-8">
        <slot />
      </UContainer>
    </div>
  </UApp>
</template>
