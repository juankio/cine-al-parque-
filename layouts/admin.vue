<template>
  <div class="min-h-screen flex flex-col bg-background text-foreground">
    <!-- TOP BAR (tu navbar global) -->
    <Navbar />

    <!-- BODY -->
    <div class="flex flex-1">
      <!-- SIDEBAR ADMIN -->
      <aside
        class="w-64 shrink-0 border-r border-theme bg-surface/80 backdrop-blur hidden md:block"
      >
        <div class="p-3">
          <AdminNav />
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="flex-1 min-w-0 p-4 md:p-6">
        <!-- toggle sidebar on mobile -->
        <div class="md:hidden mb-3">
          <details class="rounded-xl border border-theme bg-surface">
            <summary class="cursor-pointer px-3 py-2 text-sm">Menú admin</summary>
            <div class="p-3 border-t border-theme">
              <AdminNav />
            </div>
          </details>
        </div>

        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Asumiendo que tienes estos componentes en /components y Nuxt los auto-importa.
// Si no, importa explícitamente:
// import Navbar from '~/components/Navbar.vue'
// import AdminNav from '~/components/AdminNav.vue'
</script>
