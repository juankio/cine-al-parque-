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

// Estado del modo reserva
const reserveMode = ref(false)
const reserving = ref(false)

watch(reserveMode, (on) => {
  if (!on) selected.value.clear()
})

async function onReserve () {
  reserving.value = true
  // Simulación de reserva (demo)
  await new Promise(r => setTimeout(r, 800))
  alert(`Reservar (demo): ${selectionList.value.join(', ')}`)
  reserving.value = false
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <!-- Header compacto con stats + acciones -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <ReservationHeader
        :total="totalSeats"
        :taken="takenSeats"
        :free="freeSeats"
      />

      <div class="flex items-center gap-3">
        <!-- Toggle de reserva reutilizable -->
        <SwitchReserve v-model="reserveMode" />

        <!-- Botón refrescar -->
        <UButton variant="outline" color="gray" size="sm" @click="fetchLayout">
          Refrescar
        </UButton>

        <!-- Botón reservar -->
        <UButton
          :disabled="selectionList.length === 0 || reserving || !reserveMode"
          :loading="reserving"
          color="primary"
          size="sm"
          @click="onReserve"
        >
          {{ reserving ? 'Reservando…' : `Reservar (${selectionList.length})` }}
        </UButton>
      </div>
    </div>

    <!-- Estado: cargando -->
    <div v-if="loading" class="grid gap-3">
      <UCard v-for="i in 3" :key="i" class="p-4">
        <USkeleton class="h-5 w-2/3 mb-2" />
        <USkeleton class="h-4 w-1/2" />
      </UCard>
    </div>

    <!-- Error -->
    <UAlert
      v-else-if="error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudo cargar el layout"
    />

    <!-- Sin layout -->
    <UCard v-else-if="tables.length === 0" class="p-4 text-muted">
      <p>No hay layout para este showtime (o aún no se ha generado).</p>
      <div class="mt-2 text-xs opacity-80 space-y-1">
        <div><b>ID:</b> {{ showtimeId }}</div>
        <div><b>Última respuesta:</b> {{ lastPayload ? 'OK' : '—' }}</div>
      </div>
    </UCard>

    <!-- Layout de sillas -->
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

    <!-- Debug (plegado) -->
    <UCard class="p-0">
      <details class="p-4 text-xs opacity-80">
        <summary>Debug</summary>
        <pre class="mt-2 whitespace-pre-wrap">{{ lastPayload }}</pre>
      </details>
    </UCard>
  </UContainer>
</template>
