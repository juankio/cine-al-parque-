<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from '#imports'
import SeatTable from '~/components/public/SeatTable.vue'
import { useShowtimeLayout } from '~/composables/useShowtimeLayout'

definePageMeta({ ssr: false })

const route = useRoute()
const showtimeId = computed(() => String(route.params.id || ''))

const {
  loading, error, tables, totalSeats, takenSeats, freeSeats,
  selected, selectionList, lastPayload,
  fetchLayout, toggleSeat, startAutoRefresh, stopAutoRefresh
} = useShowtimeLayout(showtimeId)

onMounted(() => {
  fetchLayout()
  startAutoRefresh(10_000)
})
onBeforeUnmount(stopAutoRefresh)

/* ===== Reserva ===== */
const reserveMode = ref(false)
const reserving = ref(false)
const autoRefTS = ref<number | null>(null)

watch(reserveMode, (on) => {
  if (!on) selected.value.clear()
})

/* Pequeña animación/indicador cuando refresca solo */
function pulseAutoRef() {
  if (autoRefTS.value) return
  autoRefTS.value = window.setTimeout(() => { autoRefTS.value = null }, 1000)
}

async function onReserve () {
  reserving.value = true
  // Simulación de reserva (demo)
  await new Promise(r => setTimeout(r, 800))
  alert(`Reservar (demo): ${selectionList.value.join(', ')}`)
  reserving.value = false
}

/* Helper UI */
const stats = computed(() => ([
  { label: 'Total', value: totalSeats.value },
  { label: 'Ocupadas', value: takenSeats.value },
  { label: 'Libres', value: freeSeats.value }
]))
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <!-- HEADER -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-semibold">Selecciona tus sillas</h1>
        <div class="hidden sm:flex items-center gap-2">
          <UBadge v-for="s in stats" :key="s.label" color="neutral" variant="soft">
            <b class="mr-1">{{ s.label }}:</b> {{ s.value }}
          </UBadge>
          <UBadge
            :color="autoRefTS ? 'primary' : 'neutral'"
            :variant="autoRefTS ? 'solid' : 'soft'"
            icon="i-heroicons-arrow-path"
            class="transition"
            title="Auto-refresh cada 10s"
          >
            Auto
          </UBadge>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Toggle reserva -->
        <UButton
          :variant="reserveMode ? 'solid' : 'outline'"
          :color="reserveMode ? 'primary' : 'neutral'"
          size="sm"
          icon="i-heroicons-hand-raised"
          @click="reserveMode = !reserveMode"
        >
          {{ reserveMode ? 'Modo reserva: ON' : 'Modo reserva: OFF' }}
        </UButton>

        <!-- Refrescar -->
        <UButton
          variant="outline"
          color="neutral"
          size="sm"
          icon="i-heroicons-arrow-path"
          @click="fetchLayout().then(pulseAutoRef)"
        >
          Refrescar
        </UButton>

        <!-- Reservar -->
        <UButton
          :disabled="selectionList.length === 0 || reserving || !reserveMode"
          :loading="reserving"
          color="primary"
          size="sm"
          icon="i-heroicons-ticket"
          @click="onReserve"
        >
          {{ reserving ? 'Reservando…' : `Reservar (${selectionList.length})` }}
        </UButton>
      </div>
    </div>

    <!-- LEYENDA -->
    <UCard class="p-3">
      <div class="flex flex-wrap items-center gap-3 text-sm">
        <span class="text-muted mr-1">Leyenda:</span>
        <UBadge color="neutral" variant="outline">Libre</UBadge>
        <UBadge color="primary" variant="solid">Seleccionada</UBadge>
        <UBadge color="neutral" variant="soft" class="opacity-60">Ocupada</UBadge>
      </div>
    </UCard>

    <!-- LOADING -->
    <div v-if="loading" class="grid gap-3">
      <UCard v-for="i in 3" :key="i" class="p-4">
        <USkeleton class="h-5 w-2/3 mb-2" />
        <USkeleton class="h-4 w-1/2" />
      </UCard>
    </div>

    <!-- ERROR -->
    <UAlert
      v-else-if="error"
      color="neutral"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudo cargar el layout"
    >
      <template #actions>
        <UButton size="xs" color="primary" variant="outline" @click="fetchLayout">Reintentar</UButton>
      </template>
    </UAlert>

    <!-- VACÍO -->
    <UCard v-else-if="tables.length === 0" class="p-6 text-muted">
      <p>No hay layout para este showtime (o aún no se ha generado).</p>
      <div class="mt-2 text-xs opacity-80 space-y-1">
        <div><b>ID:</b> {{ showtimeId }}</div>
        <div><b>Última respuesta:</b> {{ lastPayload ? 'OK' : '—' }}</div>
      </div>
    </UCard>

    <!-- LAYOUT -->
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

    <!-- FOOTER STICKY (mobile) -->
    <div
      v-if="reserveMode"
      class="fixed inset-x-0 bottom-0 sm:hidden border-t border-default bg-background/90 backdrop-blur px-4 py-3"
    >
      <div class="flex items-center justify-between gap-3">
        <span class="text-sm">Seleccionadas: <b>{{ selectionList.length }}</b></span>
        <div class="flex gap-2">
          <UButton
            variant="outline"
            color="neutral"
            size="sm"
            icon="i-heroicons-arrow-path"
            @click="fetchLayout().then(pulseAutoRef)"
          >
            Refrescar
          </UButton>
          <UButton
            :disabled="selectionList.length === 0 || reserving"
            :loading="reserving"
            color="primary"
            size="sm"
            icon="i-heroicons-ticket"
            @click="onReserve"
          >
            Reservar
          </UButton>
        </div>
      </div>
    </div>

    <!-- DEBUG -->
    <details class="p-2 text-xs opacity-70">
      <summary>Debug</summary>
      <UCard class="mt-2 p-2 overflow-auto">
        <pre class="whitespace-pre-wrap">{{ lastPayload }}</pre>
      </UCard>
    </details>
  </UContainer>
</template>
