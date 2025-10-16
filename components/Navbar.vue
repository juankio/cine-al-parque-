<template>
  <header class="sticky top-0 z-40 border-b border-theme bg-surface/80 backdrop-blur">
    <nav class="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand/20 text-sm font-bold text-brand">🎬</span>
        <span class="text-sm font-semibold tracking-wide text-foreground">Cine al Parque</span>
      </NuxtLink>

      <!-- Usuario + toggle -->
      <div class="flex items-center gap-3">
       

        <template v-if="me">
          <!-- Email clickeable que lleva a /me -->
          <NuxtLink
            to="/me"
            class="hidden sm:inline-block rounded-lg bg-brand/10 px-2.5 py-1 text-xs text-foreground hover:bg-brand/20 transition-colors"
            title="Ver mi cuenta"
          >
            {{ me.email }}
          </NuxtLink>

          <!-- Botón admin -->
          <NuxtLink
            v-if="me.isAdmin"
            to="/admin"
            class="rounded-lg px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand/10 transition-colors"
          >
            Admin
          </NuxtLink>
          <ThemeToggle />
          <!-- Botón salir -->
          <button
            @click="logout"
            class="rounded-lg px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Salir
          </button>
        </template>

        <template v-else>
          <NuxtLink
            to="/login"
            class="rounded-lg px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand/10 transition-colors"
          >
            Entrar
          </NuxtLink>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import ThemeToggle from '~/components/ThemeToggle.vue'

const { user, logout, fetchMe } = useAuth()
const me = computed(() => user.value ?? null)

// Si no hay user cargado, lo trae del backend
onMounted(() => {
  if (!user.value) fetchMe().catch(() => {})
})
</script>
