<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const { user, logout, fetchMe } = useAuth()
const me = computed(() => user.value ?? null)

onMounted(() => {
  if (!user.value) fetchMe().catch(() => {})
})

const baseItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Inicio',
    icon: 'i-heroicons-home-modern',
    to: '/',
    active: route.path === '/',
  },
 
  {
    label: 'Reservas',
    icon: 'i-heroicons-ticket',
    to: '/reservations',
    active: route.path.startsWith('/reservations'),
  },
  {
    label: 'Combos',
    icon: 'i-heroicons-sparkles',
    to: '/menu',
    active: route.path.startsWith('/menu'),
  },
])

const navItems = computed<NavigationMenuItem[]>(() => {
  const items = [...baseItems.value]
  if (me.value?.isAdmin) {
    items.push({
      label: 'Admin',
      icon: 'i-heroicons-shield-check',
      to: '/admin',
      active: route.path.startsWith('/admin'),
    })
  }
  return items
})
</script>

<template>
  <UHeader
    :links="navItems"
    mode="drawer"
    :menu="{
      direction: 'bottom',
      snapPoints: [0.5, 0.85],
      activeSnapPoint: 0.5,
      content: { class: 'rounded-t-3xl max-h-[85vh]' },
    }"
    class="border-b border-default bg-default/90 backdrop-blur supports-[backdrop-filter]:bg-default/70"
  >
    <template #title>
      <NuxtLink to="/" class="flex items-center gap-2">
        <UAvatar
          icon="i-heroicons-film-20-solid"
          size="sm"
          class="rounded-xl bg-primary/15 text-primary"
        />
        <span class="hidden sm:inline text-base font-semibold tracking-tight">
          Cine al Parque
        </span>
      </NuxtLink>
    </template>

    <UNavigationMenu :items="navItems" class="hidden lg:flex" />

    <template #right>
      <UButton
        variant="ghost"
        color="gray"
        aria-label="Cambiar tema"
        @click="toggleTheme"
      >
        <UIcon
          :name="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
          class="text-lg"
        />
      </UButton>

      <template v-if="me">
        <NuxtLink
          to="/me"
          class="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-muted/50"
        >
          <UAvatar
            :alt="me.name"
            size="sm"
            class="bg-primary/10 text-primary"
          >
            {{ me.name?.[0]?.toUpperCase() || 'U' }}
          </UAvatar>
          <span class="text-sm font-medium max-w-[120px] truncate">
            {{ me.name }}
          </span>
        </NuxtLink>
        <UButton
          icon="i-heroicons-arrow-right-start-on-rectangle"
          variant="ghost"
          color="gray"
          aria-label="Cerrar sesión"
          @click="logout"
        />
      </template>

      <template v-else>
        <UButton to="/login" color="primary" variant="soft">
          Entrar
        </UButton>
      </template>
    </template>

    <template #content="{ close }">
      <div class="px-4 py-4 space-y-4">
        <UNavigationMenu
          :items="navItems"
          orientation="vertical"
          class="-mx-2 rounded-xl border border-default/40"
        />

        <div class="grid gap-2">
          <template v-if="me">
            <UButton block color="primary" variant="soft" to="/me" @click="close">
              Perfil
            </UButton>
            <UButton block color="red" variant="ghost" @click="logout">
              Cerrar sesión
            </UButton>
          </template>
          <template v-else>
            <UButton block color="primary" to="/login" @click="close">
              Entrar
            </UButton>
          </template>
        </div>
      </div>
    </template>
  </UHeader>
</template>
