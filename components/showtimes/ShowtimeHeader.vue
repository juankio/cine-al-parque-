<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import { animate, stagger } from 'animejs'
import type { LayoutStat, ShowtimeInfo } from '~/types/showtime'

const props = defineProps<{
  showtime: ShowtimeInfo | null
  formattedShowtime: string
  seatPrice: number
  stats: LayoutStat[]
  reserveMode: boolean
  selectionCount: number
  selectionTotal: number
  selectionList: string[]
  hasCartItems: boolean
  cartSubtotal: number
  orderTotal: number
  autoRefreshActive: boolean
  lastRefreshLabel: string
  canReserve: boolean
  reserving: boolean
  loadingLayout: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-reserve'): void
  (e: 'refresh'): void
  (e: 'reserve'): void
}>()

const money = (value?: number) => (Number(value || 0)).toLocaleString('es-CO')

const triggerAnimations = async () => {
  await nextTick()
  if (typeof window !== 'undefined') {
    animate('.header-el', {
      opacity: [0, 1],
      translateY: [-10, 0],
      duration: 600,
      delay: stagger(50),
      ease: 'outQuart'
    })
  }
}

onMounted(() => {
  triggerAnimations()
})
</script>

<template>
  <div class="space-y-6">
    <UCard class="overflow-hidden rounded-3xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-xl transition-all duration-500 hover:shadow-primary/5 hover:border-primary/30" :ui="{ body: { padding: 'p-0' } }">
      <div class="p-6 md:p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative">
        <div class="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div class="flex items-center gap-6 relative z-10 header-el opacity-0">
          <div class="h-28 w-20 md:h-36 md:w-24 shrink-0 rounded-2xl border border-border/50 overflow-hidden bg-muted shadow-md">
            <img
              v-if="props.showtime?.movie?.poster"
              :src="props.showtime.movie.poster"
              :alt="props.showtime.movie.titulo"
              class="h-full w-full object-cover"
            >
            <div v-else class="h-full w-full flex items-center justify-center text-xs text-muted-foreground font-medium uppercase tracking-widest text-center px-2">
              Sin poster
            </div>
          </div>
          <div class="min-w-0 space-y-3">
            <div class="flex items-center gap-3">
              <h1 class="text-2xl md:text-3xl font-black tracking-tight text-foreground truncate">
                {{ props.showtime?.movie?.titulo || 'Selecciona tus sillas' }}
              </h1>
              <UBadge v-if="props.showtime?.movie?.clasificacion" size="sm" variant="subtle" color="primary" class="font-bold">
                {{ props.showtime.movie.clasificacion }}
              </UBadge>
            </div>
            <p class="text-sm md:text-base font-medium text-muted-foreground flex items-center gap-2">
              <UIcon name="i-heroicons-calendar-days" class="w-4 h-4" />
              {{ props.formattedShowtime }} 
              <span class="opacity-50">•</span> 
              Sala {{ props.showtime?.sala || '—' }}
            </p>
            <p class="text-sm text-foreground/80 font-medium">
              Precio por silla: <span class="font-bold text-primary">$ {{ money(props.seatPrice) }}</span>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 relative z-10 header-el opacity-0">
          <UButton
            :variant="props.reserveMode ? 'solid' : 'soft'"
            :color="props.reserveMode ? 'primary' : 'neutral'"
            size="md"
            icon="i-heroicons-hand-raised"
            class="font-semibold transition-all"
            @click="emit('toggle-reserve')"
          >
            Modo Reserva: {{ props.reserveMode ? 'ON' : 'OFF' }}
          </UButton>

          <UButton
            variant="ghost"
            color="neutral"
            size="md"
            icon="i-heroicons-arrow-path"
            :loading="props.loadingLayout"
            class="hover:bg-primary/10 hover:text-primary transition-colors"
            @click="emit('refresh')"
          />

          <UButton
            :disabled="!props.canReserve"
            :loading="props.reserving"
            color="primary"
            size="md"
            icon="i-heroicons-ticket"
            class="font-bold px-6 shadow-md"
            @click="emit('reserve')"
          >
            {{ props.reserving ? 'Reservando...' : `Reservar (${props.selectionCount})` }}
          </UButton>
        </div>
      </div>

      <div class="px-6 py-4 md:px-8 bg-muted/30 border-t border-border/50 flex flex-wrap items-center gap-3">
        <UBadge
          v-for="stat in props.stats"
          :key="stat.label"
          color="neutral"
          variant="soft"
          class="header-el opacity-0 font-medium"
        >
          <span class="opacity-70 mr-1">{{ stat.label }}:</span> {{ stat.value }}
        </UBadge>
        <UBadge color="primary" variant="subtle" class="header-el opacity-0 font-bold">
          Seleccionadas: {{ props.selectionCount }}
        </UBadge>
        <UBadge v-if="props.selectionCount || props.hasCartItems" color="primary" variant="solid" class="header-el opacity-0 font-black tracking-wide ml-auto shadow-sm">
          Total: $ {{ money(props.orderTotal) }}
        </UBadge>
      </div>
    </UCard>

    <UCard v-if="props.reserveMode" class="p-6 rounded-2xl border border-primary/20 bg-primary/5 header-el opacity-0">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">Asientos seleccionados</p>
          <p class="text-xl font-black text-foreground">
            {{ props.selectionList.length ? props.selectionList.join(', ') : 'Elige al menos una silla disponible.' }}
          </p>
        </div>
        <div class="sm:text-right">
          <p class="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">Costo estimado</p>
          <p class="text-3xl font-black text-primary">$ {{ money(props.orderTotal) }}</p>
          <p v-if="props.hasCartItems" class="text-xs font-semibold text-muted-foreground mt-1">
            Incluye $ {{ money(props.cartSubtotal) }} en comida.
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
