<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { computed, onMounted, ref, watch } from 'vue'
import anime from 'animejs'

const route = useRoute()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const { user, logout, fetchMe } = useAuth()
const me = computed(() => user.value ?? null)
const isMenuOpen = ref(false)

onMounted(() => {
  if (!user.value) fetchMe().catch(() => {})
})

const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const baseItems = computed(() => [
  { label: 'Inicio', icon: 'i-heroicons-home', to: '/' },
  { label: 'Reservas', icon: 'i-heroicons-ticket', to: '/reservations' },
  { label: 'Combos', icon: 'i-heroicons-sparkles', to: '/menu' },
])

const navItems = computed(() => {
  const items = [...baseItems.value]
  if (me.value?.isAdmin) {
    items.push({ label: 'Admin', icon: 'i-heroicons-shield-check', to: '/admin' })
  }
  return items
})

const menuRef = ref<HTMLElement | null>(null)

watch(isMenuOpen, (newVal) => {
  if (newVal) {
    anime({
      targets: menuRef.value,
      opacity: [0, 1],
      translateY: [-10, 0],
      duration: 300,
      easing: 'easeOutExpo'
    })
  }
})
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b border-[var(--ui-border)] bg-background/80 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="flex items-center gap-2 transition-opacity hover:opacity-80">
          <UAvatar icon="i-heroicons-film-solid" size="sm" class="bg-primary text-white" />
          <span class="text-sm font-semibold tracking-tight">Cine al Parque</span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">
          <UButton
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            variant="ghost"
            color="neutral"
            :icon="item.icon"
            class="text-sm font-medium transition-colors"
            :class="[route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to)) ? 'bg-[var(--ui-bg-elevated)] text-[var(--ui-text-highlighted)]' : '']"
          >
            {{ item.label }}
          </UButton>
        </nav>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          :icon="isDark ? 'i-heroicons-moon-solid' : 'i-heroicons-sun-solid'"
          aria-label="Toggle theme"
          @click="toggleTheme"
        />

        <div class="hidden md:flex items-center gap-2">
          <template v-if="me">
            <UButton to="/me" variant="soft" color="neutral" class="rounded-full pl-1 pr-3">
              <template #leading>
                <UAvatar :alt="me.name" size="xs" class="bg-primary/10 text-primary">
                  {{ me.name?.[0]?.toUpperCase() || 'U' }}
                </UAvatar>
              </template>
              <span class="text-sm font-medium max-w-[120px] truncate">{{ me.name }}</span>
            </UButton>
            <UButton icon="i-heroicons-arrow-right-start-on-rectangle" variant="ghost" color="neutral" @click="logout" />
          </template>
          <template v-else>
            <UButton to="/login" color="primary" variant="solid" class="shadow-sm">Entrar</UButton>
          </template>
        </div>

        <!-- Mobile Menu Toggle -->
        <UButton
          class="md:hidden"
          variant="ghost"
          color="neutral"
          :icon="isMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
          @click="isMenuOpen = !isMenuOpen"
        />
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-show="isMenuOpen" ref="menuRef" class="md:hidden border-b border-[var(--ui-border)] bg-background">
      <div class="space-y-1 px-4 pb-4 pt-2">
        <UButton
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          block
          variant="ghost"
          color="neutral"
          :icon="item.icon"
          class="justify-start"
          @click="isMenuOpen = false"
        >
          {{ item.label }}
        </UButton>
        
        <div class="my-2 border-t border-[var(--ui-border)]"></div>
        
        <template v-if="me">
          <UButton block to="/me" variant="soft" color="neutral" class="justify-start" @click="isMenuOpen = false">
            <template #leading>
              <UAvatar :alt="me.name" size="xs" />
            </template>
            Perfil
          </UButton>
          <UButton block variant="ghost" color="error" icon="i-heroicons-arrow-right-start-on-rectangle" class="justify-start mt-1" @click="() => { logout(); isMenuOpen = false; }">
            Cerrar sesión
          </UButton>
        </template>
        <template v-else>
          <UButton block to="/login" color="primary" variant="solid" class="justify-center mt-2" @click="isMenuOpen = false">
            Entrar
          </UButton>
        </template>
      </div>
    </div>
  </header>
</template>
