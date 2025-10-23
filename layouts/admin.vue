<script setup>
import Navbar from '~/components/Navbar.vue'
import AdminNav from '~/components/AdminNav.vue'

const openSidebar = ref(false)
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-surface text-foreground transition-colors duration-300">
      <!-- Top navbar -->
      <Navbar />

      <div class="flex min-h-[calc(100vh-64px)]"> <!-- ajusta si tu Navbar es más alto -->
        <!-- Sidebar desktop -->
        <aside class="hidden lg:block w-60 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-surface/80 backdrop-blur">
          <div class="p-3">
            <AdminNav />
          </div>
        </aside>

        <!-- Slideover móvil -->
        <USlideover v-model="openSidebar" side="left">
          <div class="p-3 w-60">
            <AdminNav />
          </div>
        </USlideover>

        <!-- Main content -->
        <main class="flex-1">
          <!-- Top bar solo móvil: botón para abrir sidebar -->
          <div class="lg:hidden sticky top-0 z-10 bg-surface/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-2 p-3">
              <UButton
                icon="i-heroicons-bars-3"
                variant="ghost"
                color="gray"
                @click="openSidebar = true"
                aria-label="Abrir menú"
              />
              <span class="text-sm text-neutral-500">Menú admin</span>
            </div>
          </div>

          <UContainer class="py-6">
            <div class="mx-auto w-full max-w-6xl">
              <slot />
            </div>
          </UContainer>
        </main>
      </div>
    </div>
  </UApp>
</template>
