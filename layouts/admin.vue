<script setup>
import { ref } from 'vue'
import Navbar from '~/components/Navbar.vue'
import BossNav from '~/components/boss/shared/AdminNav.vue'

const mobileNavOpen = ref(false)
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-background text-foreground transition-colors">
      <Navbar />
      <div class="flex min-h-[calc(100vh-56px)]">
        <Motion
          tag="div"
          :initial="{ opacity: 0, x: -16 }"
          :enter="{ opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } }"
          class="hidden lg:flex h-full"
        >
          <BossNav class="h-full" />
        </Motion>

        <main class="flex-1 bg-background">
          <UContainer class="py-6 sm:py-8 max-w-[1400px] space-y-4">
            <Motion
              tag="div"
              :initial="{ opacity: 0, y: -10 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }"
              class="md:hidden flex items-center justify-between rounded-2xl border border-default/60 bg-default/70 backdrop-blur px-4 py-3 shadow-lg shadow-black/5"
            >
              <div>
                <p class="text-sm font-semibold text-foreground">Panel de administración</p>
                <p class="text-xs text-muted/80">Gestiona películas, menú e ingredientes</p>
              </div>
              <UButton
                variant="soft"
                color="primary"
                icon="i-heroicons-bars-3"
                aria-label="Abrir navegación"
                @click="mobileNavOpen = true"
              />
            </Motion>

            <Motion
              tag="div"
              :initial="{ opacity: 0, y: 18 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }"
            >
              <slot />
            </Motion>
          </UContainer>
        </main>
      </div>

      <USlideover
        v-model:open="mobileNavOpen"
        side="left"
        class="lg:hidden max-w-xs"
        :ui="{ body: 'p-0', header: 'hidden', footer: 'hidden' }"
      >
        <template #body>
          <Motion
            tag="div"
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } }"
            class="flex flex-col h-full"
          >
            <div class="flex items-center justify-between px-4 py-3 border-b border-default/60 bg-background/80 backdrop-blur">
              <span class="text-sm font-semibold">Menú admin</span>
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-heroicons-x-mark"
                aria-label="Cerrar navegación"
                @click="mobileNavOpen = false"
              />
            </div>
            <BossNav class="flex-1 overflow-auto" />
          </Motion>
        </template>
      </USlideover>
    </div>
  </UApp>
</template>
