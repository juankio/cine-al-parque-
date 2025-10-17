<script setup lang="ts">
import SeatTable from '~/components/SeatTable.vue'

// ⚠️ Fuerza client-only para evitar que el fetch ocurra en SSR
definePageMeta({ ssr: false })

const route = useRoute()
const showtimeId = computed(() => String(route.params.id || ''))

const {
  loading, error, tables, totalSeats, takenSeats, freeSeats,
  selected, selectionList, lastPayload,
  fetchLayout, toggleSeat,
  startAutoRefresh, stopAutoRefresh
} = useShowtimeLayout(showtimeId)

// Dispara en cliente, ya con el id real
onMounted(() => {
  console.log('[page] mounted id =', showtimeId.value)
  fetchLayout()              // 1ra carga inmediata
  startAutoRefresh(10000)    // refresh cada 10s
})
onBeforeUnmount(stopAutoRefresh)

const reserving = ref(false)
async function onReserve () { alert(`Reservar (demo): ${selectionList.value.join(', ')}`) }
</script>

<template>
  <section class="mx-auto max-w-6xl space-y-6 p-4">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold">Selecciona tus sillas</h1>
        <p class="text-sm text-neutral-500">Total: {{ totalSeats }} · Ocupadas: {{ takenSeats }} · Libres: {{ freeSeats }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="fetchLayout" class="rounded-lg border border-theme px-3 py-2 text-sm">Refrescar</button>
        <button @click="onReserve" :disabled="selectionList.length===0 || reserving"
                class="rounded-lg bg-brand px-3 py-2 text-sm font-semibold disabled:opacity-50">
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
      <SeatTable v-for="t in tables" :key="t.table" :table="t" :selected-keys="selected" @toggle="toggleSeat" />
    </div>

    <div class="rounded-2xl border border-theme bg-surface p-4">
      <h3 class="mb-1 font-semibold">Tu selección</h3>
      <p v-if="selectionList.length===0" class="text-neutral-500">No has elegido sillas.</p>
      <div v-else class="flex flex-wrap gap-2">
        <span v-for="k in selectionList" :key="k" class="rounded-lg border border-brand/30 bg-brand/10 px-2 py-1 text-xs text-brand">{{ k }}</span>
      </div>
    </div>

    <details class="rounded-2xl border border-theme bg-surface p-4 text-xs opacity-80">
      <summary>Debug</summary>
      <pre class="mt-2 whitespace-pre-wrap">{{ lastPayload }}</pre>
    </details>
  </section>
</template>
