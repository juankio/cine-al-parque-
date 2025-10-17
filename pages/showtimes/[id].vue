<script setup lang="ts">
import SeatTable from '~/components/SeatTable.vue'

definePageMeta({ ssr: false }) // evita fetch en SSR con id vacío

const route = useRoute()
const showtimeId = computed(() => String(route.params.id || '')) // es un Ref<string>

const {
  loading, error, tables, totalSeats, takenSeats, freeSeats,
  selected, selectionList, lastPayload,
  fetchLayout, toggleSeat, startAutoRefresh, stopAutoRefresh
} = useShowtimeLayout(showtimeId) // le pasamos el Ref

onMounted(() => {
  console.log('[page] mounted id =', showtimeId.value)
  fetchLayout()           // ← aquí NO olvides .value en logs; el composable ya lo resuelve
  startAutoRefresh(10000)
})
onBeforeUnmount(stopAutoRefresh)

const reserving = ref(false)
async function onReserve() { alert(`Reservar (demo): ${selectionList.value.join(', ')}`) }
</script>

<template>
  <section class="mx-auto max-w-6xl space-y-6 p-4">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold">Selecciona tus sillas</h1>
        <p class="text-sm text-neutral-500">
          Total: {{ totalSeats }} · Ocupadas: {{ takenSeats }} · Libres: {{ freeSeats }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="fetchLayout" class="rounded-lg border border-theme px-3 py-2 text-sm">Refrescar</button>
        <button
          @click="onReserve"
          :disabled="selectionList.length === 0 || reserving"
          class="rounded-lg bg-brand px-3 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {{ reserving ? 'Creando…' : `Reservar (${selectionList.length})` }}
        </button>
      </div>
    </header>

    <div v-if="loading" class="text-neutral-500">Cargando asientos…</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <div v-else-if="tables.length === 0" class="rounded-2xl border border-theme bg-surface p-4 text-neutral-500">
      No hay layout para este showtime (o aún no se ha generado).
      <div class="mt-2 text-xs opacity-80">
        <div><b>ID:</b> {{ showtimeId }}</div>
        <div><b>Última respuesta:</b> {{ lastPayload ? 'OK' : '—' }}</div>
      </div>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SeatTable
        v-for="t in tables"
        :key="t.table"
        :table="t"
        :selected-keys="selected"
        @toggle="toggleSeat"
      />
    </div>

    <details class="rounded-2xl border border-theme bg-surface p-4 text-xs opacity-80">
      <summary>Debug</summary>
      <pre class="mt-2 whitespace-pre-wrap">{{ lastPayload }}</pre>
    </details>
  </section>
</template>
