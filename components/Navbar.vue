<script setup lang="ts">
import { animate } from 'animejs';
import { useAuth } from '~/composables/useAuth'
import { onMounted, ref, computed, watch } from 'vue'

const route = useRoute()

const { user, logout, fetchMe } = useAuth()
const me = computed(() => user.value ?? null)

const isClient = typeof window !== 'undefined'
const isMenuOpen = ref(false)
const menuRef = ref<Element | null>(null)
const scrolled = ref(false)

onMounted(() => {
  if (!user.value) fetchMe().catch(() => {})
  
  if (isClient) {
    animate('header', {
        translateY: [-50, 0],
        opacity: [0, 1],
        ease: 'outExpo',
        duration: 800,
    })

    window.addEventListener('scroll', () => {
      scrolled.value = window.scrollY > 50
    })
  }
})

const baseItems = computed(() => [
  { label: 'Inicio', icon: 'i-heroicons-home', to: '/' },
  { label: 'Reservas', icon: 'i-heroicons-ticket', to: '/reservations' },
  { label: 'Combos', icon: 'i-heroicons-shopping-bag', to: '/menu' },
])

const navItems = computed(() => {
  const items = [...baseItems.value]
  if (me.value?.isAdmin) {
    items.push({ label: 'Admin', icon: 'i-heroicons-shield-check', to: '/admin' })
  }
  return items
})

watch(isMenuOpen, (newVal) => {
  if (newVal && isClient) {
    animate(menuRef.value, {
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 300,
        ease: 'outExpo'
      })
    }
})
</script>

<template>
  <header 
    class="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b"
    :class="scrolled ? 'bg-[#020202]/80 backdrop-blur-xl border-white/10 shadow-lg' : 'bg-transparent border-transparent'"
  >
    <div class="mx-auto flex h-20 max-w-[1800px] items-center justify-between px-6 lg:px-8">
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="flex items-center gap-3 transition-opacity hover:opacity-80 group">
          <UIcon name="i-heroicons-ticket" class="w-8 h-8 text-primary" />
          <span class="text-xl font-black tracking-tight text-white drop-shadow-md">Cine al Parque</span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-2 text-sm font-semibold tracking-wide transition-all px-4 py-2.5 rounded-lg hover:bg-white/10"
            :class="[route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to)) ? 'bg-white/10 shadow-inner border border-white/5' : '']"
          >
            <UIcon 
              :name="item.icon" 
              class="w-5 h-5 transition-colors" 
              :class="route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to)) ? 'text-primary' : 'text-white/60 group-hover:text-white'" 
            />
            <span :class="route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to)) ? 'text-white' : 'text-white/60 group-hover:text-white'">
              {{ item.label }}
            </span>
          </NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-3">
        <!-- Quitamos Theme Toggle para forzar oscuro inmersivo -->

        <div class="hidden md:flex items-center gap-3">
          <template v-if="me">
            <UButton to="/me" variant="soft" color="neutral" class="rounded-full pl-1.5 pr-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all">
              <template #leading>
                <UAvatar :alt="me.name" size="sm" class="bg-primary text-white shadow-inner font-bold">
                  {{ me.name?.[0]?.toUpperCase() || 'U' }}
                </UAvatar>
              </template>
              <span class="text-sm font-semibold max-w-[120px] truncate">{{ me.name }}</span>
            </UButton>
            <UButton icon="i-heroicons-arrow-right-start-on-rectangle" variant="ghost" color="neutral" class="text-white/70 hover:text-error hover:bg-error/10" @click="logout" />
          </template>
          <template v-else>
            <UButton to="/login" color="primary" variant="solid" class="shadow-lg shadow-primary/20 font-bold px-6 py-2 rounded-full uppercase tracking-widest text-[10px]">
              Entrar
            </UButton>
          </template>
        </div>

        <!-- Mobile Menu Toggle -->
        <UButton
          class="md:hidden text-white hover:bg-white/10"
          variant="ghost"
          color="neutral"
          :icon="isMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
          @click="isMenuOpen = !isMenuOpen"
        />
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-show="isMenuOpen" ref="menuRef" class="md:hidden border-b border-white/10 bg-[#020202]/95 backdrop-blur-3xl absolute w-full left-0 top-full">
      <div class="space-y-2 px-6 pb-6 pt-4">
        <UButton
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          block
          variant="ghost"
          color="neutral"
          :icon="item.icon"
          class="justify-start text-white/80 hover:text-white hover:bg-white/5 font-medium py-3"
          @click="isMenuOpen = false"
        >
          {{ item.label }}
        </UButton>
        
        <div class="my-4 border-t border-white/10"></div>
        
        <template v-if="me">
          <UButton block to="/me" variant="soft" color="neutral" class="justify-start bg-white/5 text-white hover:bg-white/10 py-3" @click="isMenuOpen = false">
            <template #leading>
              <UAvatar :alt="me.name" size="sm" class="bg-primary text-white" />
            </template>
            Mi Perfil
          </UButton>
          <UButton block variant="ghost" color="error" icon="i-heroicons-arrow-right-start-on-rectangle" class="justify-start mt-2 py-3 hover:bg-error/10" @click="() => { logout(); isMenuOpen = false; }">
            Cerrar sesión
          </UButton>
        </template>
        <template v-else>
          <UButton block to="/login" color="primary" variant="solid" class="justify-center mt-4 py-3 font-bold uppercase tracking-widest text-xs rounded-xl" @click="isMenuOpen = false">
            Entrar
          </UButton>
        </template>
      </div>
    </div>
  </header>
</template>
