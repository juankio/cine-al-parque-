<script setup>
import Navbar from '~/components/Navbar.vue'
import BossNav from '~/components/boss/shared/AdminNav.vue'
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-background text-foreground transition-colors">
      <Navbar />
      <div class="flex min-h-[calc(100vh-56px)]">
        <BossNav class="hidden md:block" />
        <main class="flex-1">
          <UContainer class="py-8 max-w-[1400px]">
            <slot />
          </UContainer>
        </main>
      </div>
    </div>
  </UApp>
</template>
