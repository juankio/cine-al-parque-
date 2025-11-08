<script setup lang="ts">
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
</script>

<template>
  <div class="space-y-4">
    <UCard class="p-4 space-y-4 rounded-2xl border border-default/40 transition hover:border-primary/50 hover:shadow-[0_15px_40px_rgba(225,29,72,0.1)]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-4">
          <div class="h-20 w-16 rounded-xl border border-default/40 overflow-hidden bg-muted/40">
            <img
              v-if="props.showtime?.movie?.poster"
              :src="props.showtime.movie.poster"
              :alt="props.showtime.movie.titulo"
              class="h-full w-full object-cover"
            >
            <div v-else class="h-full w-full flex items-center justify-center text-xs text-muted">
              Sin poster
            </div>
          </div>
          <div class="min-w-0 space-y-1">
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-semibold truncate">
                {{ props.showtime?.movie?.titulo || 'Selecciona tus sillas' }}
              </h1>
              <UBadge v-if="props.showtime?.movie?.clasificacion" size="xs" variant="soft">
                {{ props.showtime.movie.clasificacion }}
              </UBadge>
            </div>
            <p class="text-sm text-muted">
              {{ props.formattedShowtime }} • Sala {{ props.showtime?.sala || '—' }}
            </p>
            <p class="text-xs text-muted">
              Precio por silla: <span class="font-semibold">$ {{ money(props.seatPrice) }}</span>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            :variant="props.reserveMode ? 'solid' : 'outline'"
            :color="props.reserveMode ? 'primary' : 'neutral'"
            size="sm"
            icon="i-heroicons-hand-raised"
            @click="emit('toggle-reserve')"
          >
            {{ props.reserveMode ? 'Modo reserva: ON' : 'Modo reserva: OFF' }}
          </UButton>

          <UPopover mode="hover">
            <UButton
              variant="outline"
              color="neutral"
              size="sm"
              icon="i-heroicons-arrow-path"
              :loading="props.loadingLayout"
              @click="emit('refresh')"
            >
              Refrescar
            </UButton>
            <template #panel>
              <div class="text-xs text-muted p-2 max-w-[220px]">
                Actualiza manualmente cuando notes cambios en la disponibilidad. No habrá refrescos automáticos mientras revisas la página.
              </div>
            </template>
          </UPopover>

          <UButton
            :disabled="!props.canReserve"
            :loading="props.reserving"
            color="primary"
            size="sm"
            icon="i-heroicons-ticket"
            @click="emit('reserve')"
          >
            {{ props.reserving ? 'Reservando...' : `Reservar (${props.selectionCount})` }}
          </UButton>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UBadge
          v-for="stat in props.stats"
          :key="stat.label"
          color="neutral"
          variant="soft"
        >
          <b class="mr-1">{{ stat.label }}:</b> {{ stat.value }}
        </UBadge>
        <UBadge color="primary" variant="soft">
          Seleccionadas: {{ props.selectionCount }}
        </UBadge>
        <UBadge v-if="props.selectionCount" color="primary" variant="soft">
          Boletas: $ {{ money(props.selectionTotal) }}
        </UBadge>
        <UBadge v-if="props.hasCartItems" color="primary" variant="soft">
          Combos: $ {{ money(props.cartSubtotal) }}
        </UBadge>
        <UBadge v-if="props.selectionCount || props.hasCartItems" color="primary" variant="solid">
          Total orden: $ {{ money(props.orderTotal) }}
        </UBadge>
        <UBadge
          :color="props.autoRefreshActive ? 'primary' : 'neutral'"
          :variant="props.autoRefreshActive ? 'solid' : 'soft'"
          icon="i-heroicons-arrow-path"
          class="transition"
        >
          Actualizado: {{ props.lastRefreshLabel }}
        </UBadge>
      </div>
    </UCard>

    <UCard v-if="props.reserveMode" class="p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm text-muted">Asientos seleccionados</p>
          <p class="text-lg font-semibold">
            {{ props.selectionList.length ? props.selectionList.join(', ') : 'Elige al menos una silla disponible.' }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-muted">Total estimado (boletas + combos)</p>
          <p class="text-2xl font-bold">$ {{ money(props.orderTotal) }}</p>
          <p v-if="props.hasCartItems" class="text-xs text-muted">
            Incluye $ {{ money(props.cartSubtotal) }} en comida.
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
