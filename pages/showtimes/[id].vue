<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useRoute, useToast } from '#imports'
import SeatTable from '~/components/public/SeatTable.vue'
import { useShowtimeLayout } from '~/composables/useShowtimeLayout'
import { useAuth } from '~/composables/useAuth'
import { useCombos } from '~/composables/useCombos'
import type { ComboItem } from '~/composables/useCombos'

definePageMeta({ ssr: false })

type ShowtimeInfo = {
  id: string
  movieId: string
  fechaHora: string
  sala?: string
  price?: number
  movie?: {
    id: string
    titulo: string
    poster?: string
    duracion?: number
    clasificacion?: string
    sinopsis?: string
  } | null
}

type CartLine = {
  menuItemId: string
  nombre: string
  unitPrice: number
  qty: number
}

type ReservationSnapshot = {
  id: string
  total: number
  seatsTotal: number
  foodTotal: number
  expiresAt?: string | null
  seats: string[]
  status: 'pending' | 'paid'
  items?: CartLine[]
}

const toast = useToast()
const route = useRoute()
const { user, ensureSession } = useAuth()
const showtimeId = computed(() => String(route.params.id || ''))

const showtime = ref<ShowtimeInfo | null>(null)
const showtimeLoading = ref(false)
const showtimeError = ref<string | null>(null)

async function fetchShowtimeDetails() {
  const id = showtimeId.value
  if (!id) return
  showtimeLoading.value = true
  showtimeError.value = null
  try {
    const data = await $fetch<ShowtimeInfo>(`/api/showtimes/${id}`, { credentials: 'include' })
    showtime.value = data
  } catch (e: any) {
    showtimeError.value = e?.data?.message || e?.message || 'No se pudo cargar la función'
    showtime.value = null
  } finally {
    showtimeLoading.value = false
  }
}

watch(showtimeId, () => {
  if (showtimeId.value) fetchShowtimeDetails()
}, { immediate: true })

const {
  loading, error, tables, totalSeats, takenSeats, freeSeats,
  selected, selectionList,
  fetchLayout, toggleSeat, resetSelection,
  startAutoRefresh, stopAutoRefresh
} = useShowtimeLayout(showtimeId)

const reserveMode = ref(false)
const reserving = ref(false)
const confirming = ref(false)
const autoRefTS = ref<number | null>(null)
const lastRefreshedAt = ref<string | null>(null)
const lastHold = ref<ReservationSnapshot | null>(null)
const holdCountdown = ref<string | null>(null)
const holdTimer = ref<ReturnType<typeof setInterval> | null>(null)

const {
  combos,
  loading: combosLoading,
  error: combosError,
  fetchCombos,
  refresh: refreshCombos
} = useCombos()

const cart = reactive<Record<string, CartLine>>({})
const cartItems = computed(() => Object.values(cart))
const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.qty, 0))
const cartSubtotal = computed(() => cartItems.value.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0))

function setComboQty(combo: ComboItem, qty: number) {
  const normalized = Math.max(0, Math.min(99, Math.round(qty)))
  if (!normalized) {
    delete cart[combo._id]
    return
  }
  cart[combo._id] = {
    menuItemId: combo._id,
    nombre: combo.nombre,
    unitPrice: combo.precio,
    qty: normalized
  }
}
function incrementCombo(combo: ComboItem) {
  const current = cart[combo._id]?.qty || 0
  setComboQty(combo, current + 1)
}
function decrementCombo(combo: ComboItem) {
  const current = cart[combo._id]?.qty || 0
  setComboQty(combo, current - 1)
}
function clearCart() {
  Object.keys(cart).forEach((key) => { delete cart[key] })
}

onMounted(() => {
  fetchLayout()
  startAutoRefresh(10_000)
  fetchCombos({ force: true }).catch(() => {})
})
onBeforeUnmount(() => {
  stopAutoRefresh()
  stopHoldTicker()
})

watch(tables, () => {
  lastRefreshedAt.value = new Date().toISOString()
  pulseAutoRef()
})

watch(reserveMode, async (enabled) => {
  if (!enabled) {
    resetSelection()
    return
  }
  const ok = await requireLogin()
  if (!ok) reserveMode.value = false
})

watch(lastHold, () => {
  if (lastHold.value?.status === 'pending' && lastHold.value.expiresAt) {
    startHoldTicker()
  } else {
    stopHoldTicker()
  }
}, { immediate: true })

const stats = computed(() => ([
  { label: 'Total', value: totalSeats.value },
  { label: 'Ocupadas', value: takenSeats.value },
  { label: 'Libres', value: freeSeats.value }
]))

const seatPrice = computed(() => Number(showtime.value?.price || 0))
const selectionCount = computed(() => selectionList.value.length)
const selectionTotal = computed(() => seatPrice.value * selectionCount.value)
const hasCartItems = computed(() => cartItems.value.length > 0)
const orderTotal = computed(() => selectionTotal.value + cartSubtotal.value)

const formattedShowtime = computed(() => {
  if (!showtime.value?.fechaHora) return 'Horario por confirmar'
  return new Date(showtime.value.fechaHora).toLocaleString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const lastRefreshLabel = computed(() => {
  if (!lastRefreshedAt.value) return '—'
  return new Date(lastRefreshedAt.value).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const holdDescription = computed(() => {
  if (!lastHold.value) return ''
  const code = (lastHold.value.id || '').slice(-6).toUpperCase()
  const prefix = `Código ${code || lastHold.value.id} • $ ${money(lastHold.value.total)}`
  if (lastHold.value.status === 'paid') return `${prefix}. Pago confirmado.`
  if (holdCountdown.value) return `${prefix}. Expira en ${holdCountdown.value}.`
  if (lastHold.value.expiresAt) {
    const time = new Date(lastHold.value.expiresAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    return `${prefix}. Expira a las ${time}.`
  }
  return prefix
})

const canReserve = computed(() => reserveMode.value && selectionCount.value > 0 && !reserving.value)

function money(value?: number) {
  return (Number(value || 0)).toLocaleString('es-CO')
}

async function requireLogin() {
  await ensureSession()
  if (user.value) return true
  toast.add({
    title: 'Inicia sesión para reservar',
    description: 'Necesitas iniciar sesión antes de bloquear tus sillas.',
    color: 'primary',
    icon: 'i-heroicons-lock-closed'
  })
  const redirect = encodeURIComponent(route.fullPath)
  await navigateTo(`/login?redirect=${redirect}`)
  return false
}

function pulseAutoRef() {
  if (autoRefTS.value) return
  autoRefTS.value = window.setTimeout(() => { autoRefTS.value = null }, 1000)
}

function stopHoldTicker() {
  if (holdTimer.value) {
    clearInterval(holdTimer.value)
    holdTimer.value = null
  }
  holdCountdown.value = null
}

function handleHoldExpired() {
  stopHoldTicker()
  if (!lastHold.value) return
  toast.add({
    title: 'Reserva expirada',
    description: 'Los asientos volvieron a estar disponibles. Selecciónalos de nuevo para intentar otra vez.',
    color: 'neutral',
    icon: 'i-heroicons-clock'
  })
  lastHold.value = null
  fetchLayout()
}

function tickHoldCountdown() {
  if (!lastHold.value?.expiresAt) {
    holdCountdown.value = null
    return
  }
  const expires = new Date(lastHold.value.expiresAt).getTime()
  const diff = expires - Date.now()
  if (diff <= 0) {
    holdCountdown.value = '00:00'
    handleHoldExpired()
    return
  }
  const minutes = Math.floor(diff / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)
  holdCountdown.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function startHoldTicker() {
  stopHoldTicker()
  tickHoldCountdown()
  holdTimer.value = setInterval(tickHoldCountdown, 1_000)
}

async function handleReserve() {
  if (!selectionCount.value || reserving.value) return
  if (!(await requireLogin())) return
  reserving.value = true
  try {
    const itemsPayload = cartItems.value.map(item => ({
      menuItemId: item.menuItemId,
      qty: item.qty
    }))
    const cartSnapshot = cartItems.value.map(item => ({ ...item }))
    const body = {
      showtimeId: showtimeId.value,
      seats: selectionList.value,
      ...(itemsPayload.length ? { items: itemsPayload } : {})
    }
    const headers: Record<string, string> = {}
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      headers['Idempotency-Key'] = crypto.randomUUID()
    }
    const response = await $fetch<{
      reservation: { id: string; total: number }
      breakdown: { seatsTotal: number; foodTotal: number }
      expiresAt?: string
    }>('/api/reservations', {
      method: 'POST',
      credentials: 'include',
      body,
      headers
    })
    lastHold.value = {
      id: response.reservation.id,
      total: response.reservation.total,
      seatsTotal: response.breakdown.seatsTotal,
      foodTotal: response.breakdown.foodTotal,
      expiresAt: response.expiresAt ?? null,
      seats: selectionList.value.slice(),
      status: 'pending',
      items: cartSnapshot
    }
    toast.add({
      title: '¡Listo! Bloqueamos tus asientos',
      description: 'Confirma el pago antes de que expire el hold.',
      color: 'green',
      icon: 'i-heroicons-ticket'
    })
    reserveMode.value = false
    resetSelection()
    clearCart()
    fetchLayout()
  } catch (e: any) {
    const status = e?.response?.status || e?.statusCode
    let message = e?.data?.message || e?.message || 'No pudimos completar la reserva'
    if (status === 409) {
      message = 'Alguno de los asientos ya fue tomado. Actualizamos el layout.'
      fetchLayout()
    } else if (status === 401) {
      await requireLogin()
      message = 'Inicia sesión para continuar.'
    }
    toast.add({
      title: 'Reserva no completada',
      description: message,
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle'
    })
  } finally {
    reserving.value = false
  }
}

async function confirmPayment() {
  if (!lastHold.value || lastHold.value.status === 'paid' || confirming.value) return
  if (!(await requireLogin())) return
  confirming.value = true
  try {
    await $fetch('/api/payments/confirm', {
      method: 'POST',
      credentials: 'include',
      body: { reservationId: lastHold.value.id }
    })
    lastHold.value = { ...lastHold.value, status: 'paid', expiresAt: null }
    toast.add({
      title: 'Pago confirmado',
      description: 'Tu reserva quedó marcada como pagada.',
      color: 'green',
      icon: 'i-heroicons-credit-card'
    })
    fetchLayout()
  } catch (e: any) {
    const message = e?.data?.message || e?.message || 'No pudimos confirmar el pago'
    toast.add({
      title: 'Error al confirmar',
      description: message,
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle'
    })
  } finally {
    confirming.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <UAlert
      v-if="showtimeError"
      color="neutral"
      variant="soft"
      icon="i-heroicons-information-circle"
      :description="showtimeError"
      title="Esta función no está disponible"
    >
      <template #actions>
        <UButton size="xs" color="primary" variant="soft" @click="fetchShowtimeDetails">
          Reintentar
        </UButton>
      </template>
    </UAlert>

    <UCard class="p-4 space-y-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-4">
          <div class="h-20 w-16 rounded-xl border border-default/40 overflow-hidden bg-muted/40">
            <img
              v-if="showtime?.movie?.poster"
              :src="showtime.movie.poster"
              :alt="showtime.movie.titulo"
              class="h-full w-full object-cover"
            >
            <div v-else class="h-full w-full flex items-center justify-center text-xs text-muted">
              Sin poster
            </div>
          </div>
          <div class="min-w-0 space-y-1">
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-semibold truncate">
                {{ showtime?.movie?.titulo || 'Selecciona tus sillas' }}
              </h1>
              <UBadge v-if="showtime?.movie?.clasificacion" size="xs" variant="soft">
                {{ showtime.movie.clasificacion }}
              </UBadge>
            </div>
            <p class="text-sm text-muted">
              {{ formattedShowtime }} • Sala {{ showtime?.sala || '—' }}
            </p>
            <p class="text-xs text-muted">
              Precio por silla: <span class="font-semibold">$ {{ money(seatPrice) }}</span>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            :variant="reserveMode ? 'solid' : 'outline'"
            :color="reserveMode ? 'primary' : 'neutral'"
            size="sm"
            icon="i-heroicons-hand-raised"
            @click="reserveMode = !reserveMode"
          >
            {{ reserveMode ? 'Modo reserva: ON' : 'Modo reserva: OFF' }}
          </UButton>

          <UButton
            variant="outline"
            color="neutral"
            size="sm"
            icon="i-heroicons-arrow-path"
            :loading="loading"
            @click="fetchLayout"
          >
            Refrescar
          </UButton>

          <UButton
            :disabled="!canReserve"
            :loading="reserving"
            color="primary"
            size="sm"
            icon="i-heroicons-ticket"
            @click="handleReserve"
          >
            {{ reserving ? 'Reservando...' : `Reservar (${selectionCount})` }}
          </UButton>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UBadge
          v-for="s in stats"
          :key="s.label"
          color="neutral"
          variant="soft"
        >
          <b class="mr-1">{{ s.label }}:</b> {{ s.value }}
        </UBadge>
        <UBadge color="primary" variant="soft">
          Seleccionadas: {{ selectionCount }}
        </UBadge>
        <UBadge v-if="selectionCount" color="primary" variant="soft">
          Boletas: $ {{ money(selectionTotal) }}
        </UBadge>
        <UBadge v-if="hasCartItems" color="primary" variant="soft">
          Combos: $ {{ money(cartSubtotal) }}
        </UBadge>
        <UBadge v-if="selectionCount || hasCartItems" color="primary" variant="solid">
          Total orden: $ {{ money(orderTotal) }}
        </UBadge>
        <UBadge
          :color="autoRefTS ? 'primary' : 'neutral'"
          :variant="autoRefTS ? 'solid' : 'soft'"
          icon="i-heroicons-arrow-path"
          class="transition"
        >
          Actualizado: {{ lastRefreshLabel }}
        </UBadge>
      </div>
    </UCard>

    <UCard v-if="reserveMode" class="p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm text-muted">Asientos seleccionados</p>
          <p class="text-lg font-semibold">
            {{ selectionList.length ? selectionList.join(', ') : 'Elige al menos una silla disponible.' }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-muted">Total estimado (boletas + combos)</p>
          <p class="text-2xl font-bold">$ {{ money(orderTotal) }}</p>
          <p v-if="hasCartItems" class="text-xs text-muted">
            Incluye $ {{ money(cartSubtotal) }} en comida.
          </p>
        </div>
      </div>
    </UCard>

    <UCard class="p-6 space-y-6 rounded-3xl border border-default/40">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-1">
          <p class="text-sm uppercase tracking-wide text-primary/80 font-semibold">Snacks &amp; combos</p>
          <h2 class="text-xl font-semibold">Completa tu orden</h2>
          <p class="text-sm text-muted">
            Selecciona comida o bebidas y las agendaremos con tu reserva.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-heroicons-arrow-top-right-on-square"
            to="/menu"
          >
            Ver menú completo
          </UButton>
          <UButton
            color="neutral"
            variant="soft"
            size="xs"
            icon="i-heroicons-arrow-path"
            :loading="combosLoading"
            @click="refreshCombos()"
          >
            Actualizar
          </UButton>
          <UButton
            v-if="hasCartItems"
            color="neutral"
            variant="outline"
            size="xs"
            icon="i-heroicons-trash"
            @click="clearCart"
          >
            Limpiar
          </UButton>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[280px,1fr]">
        <Motion
          tag="div"
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 0.3 } }"
        >
          <UCard class="h-full border border-dashed border-primary/30 bg-primary/5">
            <div class="space-y-4">
              <div>
                <p class="text-xs uppercase tracking-wide text-primary font-semibold">
                  Resumen
                </p>
                <div class="mt-3 space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>Sillas</span>
                    <b>{{ selectionCount }}</b>
                  </div>
                  <div class="flex justify-between">
                    <span>Combos</span>
                    <b>{{ cartCount }}</b>
                  </div>
                  <div class="flex justify-between text-primary">
                    <span>Total combos</span>
                    <b>$ {{ money(cartSubtotal) }}</b>
                  </div>
                  <div class="flex justify-between text-default">
                    <span>Orden completa</span>
                    <b>$ {{ money(orderTotal) }}</b>
                  </div>
                </div>
              </div>
              <UButton
                block
                color="primary"
                icon="i-heroicons-shopping-bag"
                :disabled="!selectionCount"
                @click="reserveMode = true"
              >
                {{ hasCartItems ? 'Reservar con combos' : 'Regresar a las sillas' }}
              </UButton>
              <p v-if="!selectionCount" class="text-xs text-muted">
                Debes elegir tus sillas antes de confirmar la compra.
              </p>
            </div>
          </UCard>
        </Motion>

        <Motion
          tag="div"
          class="space-y-4"
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.3 } }"
        >
          <UAlert
            v-if="combosError"
            color="neutral"
            variant="soft"
            icon="i-heroicons-exclamation-triangle"
            :description="combosError"
            title="No pudimos cargar los combos"
          />

          <div v-else-if="combosLoading" class="grid gap-4 sm:grid-cols-2">
            <USkeleton v-for="i in 4" :key="i" class="h-32 rounded-2xl" />
          </div>

          <div v-else-if="combos.length" class="grid gap-4 sm:grid-cols-2">
            <Motion
              v-for="(combo, index) in combos"
              :key="combo._id"
              tag="div"
              :initial="{ opacity: 0, y: 18 }"
              :enter="{
                opacity: 1,
                y: 0,
                transition: { delay: 0.05 * index, duration: 0.25 }
              }"
              :hover="{ y: -4, transition: { type: 'spring', stiffness: 250, damping: 20 } }"
            >
              <UCard class="h-full border border-default/40">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-[11px] uppercase tracking-wide text-muted">
                      {{ combo.categoria || 'Combo' }}
                    </p>
                    <h3 class="text-lg font-semibold leading-tight mt-1">
                      {{ combo.nombre }}
                    </h3>
                    <p v-if="combo.descripcion" class="text-sm text-muted mt-1 line-clamp-2">
                      {{ combo.descripcion }}
                    </p>
                  </div>
                  <span class="text-base font-semibold text-primary whitespace-nowrap">
                    $ {{ money(combo.precio) }}
                  </span>
                </div>

                <div class="flex flex-wrap gap-1 mt-3">
                  <UBadge
                    v-for="tag in combo.tags || []"
                    :key="tag"
                    size="xs"
                    variant="soft"
                    color="neutral"
                  >
                    #{{ tag }}
                  </UBadge>
                </div>

                <div class="mt-4 flex items-center justify-between gap-3 border-t border-default/40 pt-3">
                  <span class="text-sm text-muted">
                    {{ cart[combo._id]?.qty ? 'En tu selección' : 'Añadir a la orden' }}
                  </span>
                  <div class="flex items-center gap-2">
                    <UButton
                      icon="i-heroicons-minus"
                      size="xs"
                      variant="outline"
                      color="neutral"
                      :disabled="!(cart[combo._id]?.qty)"
                      @click="decrementCombo(combo)"
                    />
                    <span class="w-7 text-center font-semibold">{{ cart[combo._id]?.qty || 0 }}</span>
                    <UButton
                      icon="i-heroicons-plus"
                      size="xs"
                      color="primary"
                      @click="incrementCombo(combo)"
                    />
                  </div>
                </div>
              </UCard>
            </Motion>
          </div>

          <EmptyState
            v-else
            title="Aún no tenemos combos disponibles"
            description="Estamos actualizando la carta para este showtime."
          />
        </Motion>
      </div>
    </UCard>

    <UAlert
      v-if="lastHold"
      :color="lastHold.status === 'paid' ? 'primary' : 'green'"
      variant="soft"
      icon="i-heroicons-ticket"
      :title="lastHold.status === 'paid' ? 'Reserva confirmada' : '¡Listo! Bloqueamos tus asientos'"
      :description="holdDescription"
    >
      <template #actions>
        <UButton
          v-if="lastHold.status === 'pending'"
          size="xs"
          color="primary"
          :loading="confirming"
          @click="confirmPayment"
        >
          Confirmar pago (demo)
        </UButton>
        <UButton size="xs" variant="ghost" color="neutral" to="/me">
          Ver historial
        </UButton>
      </template>
      <div
        v-if="lastHold.status === 'pending'"
        class="mt-3 flex flex-wrap items-center gap-2 text-xs"
      >
        <UBadge color="primary" variant="soft">
          Expira en: {{ holdCountdown || '—' }}
        </UBadge>
        <span v-if="lastHold.expiresAt" class="text-muted">
          ({{ new Date(lastHold.expiresAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) }})
        </span>
      </div>
      <div
        v-if="lastHold.items?.length"
        class="mt-3 text-xs text-muted"
      >
        <p>Combos incluidos:</p>
        <ul class="list-disc ml-4">
          <li
            v-for="item in lastHold.items"
            :key="item.menuItemId"
          >
            {{ item.qty }} × {{ item.nombre }} — $ {{ money(item.unitPrice * item.qty) }}
          </li>
        </ul>
      </div>
    </UAlert>

    <UCard class="p-3">
      <div class="flex flex-wrap items-center gap-3 text-sm">
        <span class="text-muted mr-1">Leyenda:</span>
        <UBadge color="neutral" variant="outline">Libre</UBadge>
        <UBadge color="primary" variant="solid">Seleccionada</UBadge>
        <UBadge color="neutral" variant="soft" class="opacity-60">Ocupada</UBadge>
      </div>
    </UCard>

    <div v-if="loading" class="grid gap-3">
      <UCard v-for="i in 3" :key="i" class="p-4">
        <USkeleton class="h-5 w-2/3 mb-2" />
        <USkeleton class="h-4 w-1/2" />
      </UCard>
    </div>

    <UAlert
      v-else-if="error"
      color="neutral"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudo cargar el layout"
    >
      <template #actions>
        <UButton size="xs" color="primary" variant="outline" @click="fetchLayout">
          Reintentar
        </UButton>
      </template>
    </UAlert>

    <UCard v-else-if="tables.length === 0" class="p-6 text-muted">
      <p>No hay layout para este showtime (o aún no se ha generado).</p>
      <div class="mt-2 text-xs opacity-80 space-y-1">
        <div><b>ID:</b> {{ showtimeId }}</div>
        <div><b>Última actualización:</b> {{ lastRefreshLabel }}</div>
      </div>
    </UCard>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SeatTable
        v-for="t in tables"
        :key="t.table"
        :table="t"
        :selected-keys="selected"
        :select-enabled="reserveMode"
        @toggle="toggleSeat"
      />
    </div>

    <div
      v-if="reserveMode"
      class="fixed inset-x-0 bottom-0 sm:hidden border-t border-default bg-background/90 backdrop-blur px-4 py-3"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="text-sm flex flex-col">
          <span>Seleccionadas: <b>{{ selectionCount }}</b></span>
          <span v-if="hasCartItems">Combos: <b>{{ cartCount }}</b> · $ {{ money(cartSubtotal) }}</span>
          <span>Total: <b>$ {{ money(orderTotal) }}</b></span>
        </div>
        <div class="flex gap-2">
          <UButton
            variant="outline"
            color="neutral"
            size="sm"
            icon="i-heroicons-arrow-path"
            @click="fetchLayout"
          >
            Refrescar
          </UButton>
          <UButton
            :disabled="!canReserve"
            :loading="reserving"
            color="primary"
            size="sm"
            icon="i-heroicons-ticket"
            @click="handleReserve"
          >
            Reservar
          </UButton>
        </div>
      </div>
    </div>

    <details class="p-2 text-xs opacity-70">
      <summary>Debug</summary>
      <UCard class="mt-2 p-2 overflow-auto">
        <pre class="whitespace-pre-wrap">{{ JSON.stringify({ showtimeId, tables }, null, 2) }}</pre>
      </UCard>
    </details>
  </UContainer>
</template>
