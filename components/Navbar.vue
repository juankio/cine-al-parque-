<script setup>
import { useAuth } from '~/composables/useAuth'

const { user, logout, fetchMe } = useAuth()
const me = computed(() => user.value ?? null)

onMounted(() => {
  if (!user.value) fetchMe().catch(() => {})
})

const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

const isDark = computed(() => colorMode.preference === 'dark')
</script>


<template>
  <header class="sticky top-0 z-40 border-b border-default bg-surface/80 backdrop-blur transition-colors">
    <UContainer>
      <nav class="flex h-14 items-center justify-between gap-3">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
          <span
            class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary"
          >
            🎬
          </span>
          <span class="text-sm font-semibold tracking-wide">Cine al Parque</span>
        </NuxtLink>

        <!-- Derecha: tema + usuario -->
        <div class="flex items-center gap-2">
          <!-- Toggle de tema -->
          <UButton
  :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
  variant="ghost"
  color="gray"
  size="sm"
  class="gap-2"
  @click="toggleTheme"
>
  <span class="hidden sm:inline text-xs">{{ isDark ? 'Oscuro' : 'Claro' }}</span>
</UButton>


          <!-- Usuario o login -->
          <template v-if="me">
            <NuxtLink to="/me" class="flex items-center gap-2">
              <UAvatar
                :alt="me.name"
                size="xs"
                class="bg-primary/10 text-primary"
              >
                {{ me.name?.[0]?.toUpperCase() || 'U' }}
              </UAvatar>
              <span class="hidden sm:inline text-xs">{{ me.name }}</span>
            </NuxtLink>

            <UButton
              size="sm"
              variant="ghost"
              color="gray"
              icon="i-heroicons-arrow-right-start-on-rectangle"
              @click="logout"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            />
          </template>

          <template v-else>
            <UButton to="/login" size="sm" color="primary" variant="soft">
              Entrar
            </UButton>
          </template>
        </div>
      </nav>
    </UContainer>
  </header>
</template>
