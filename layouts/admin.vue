<script setup>
import Navbar from '~/components/Navbar.vue'
import AdminNav from '~/components/AdminNav.vue'
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-default text-default">
      <Navbar />
      <div class="flex min-h-[calc(100vh-56px)]">
        <AdminNav />
        <main class="flex-1">
          <UContainer class="py-8 max-w-[1400px]">
            <div class="w-full">
              <slot />
            </div>
          </UContainer>
        </main>
      </div>
    </div>
  </UApp>
</template>
