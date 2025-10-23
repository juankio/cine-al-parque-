<script setup lang="ts">
import SeatTable from '~/components/SeatTable.vue'

definePageMeta({ ssr: false })

const route = useRoute()
const showtimeId = computed(() => String(route.params.id || ''))

const {
  loading, error, tables, totalSeats, takenSeats, freeSeats,
  selected, selectionList, lastPayload,
  fetchLayout, toggleSeat, startAutoRefresh, stopAutoRefresh
} = useShowtimeLayout(showtimeId)

onMounted(() => {
  console.log('[page] mounted id =', showtimeId.value)
  fetchLayout()
  startAutoRefresh(10000)
})
onBeforeUnmount(stopAutoRefresh)

const reserving = ref(false)
const reserveMode = ref(false) // 🔥 este es el switch

watch(reserveMode, (on) => {
  if (!on) selected.value.clear() // limpia selección si apagas el switch
})

async function onReserve() {
  alert(`Reservar (demo): ${selectionList.value.join(', ')}`)
}
</script>

<template>
  <section class="mx-auto max-w-6xl space-y-6 p-4">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold">Selecciona tus sillas</h1>
        <p class="text-sm text-neutral-500">
          Total: {{ totalSeats }} · Ocupadas: {{ takenSeats }} · Libres: {{ freeSeats }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- 🔘 switch reservar -->
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="reserveMode" class="peer sr-only" />
          <span
            class="inline-flex h-6 w-11 items-center rounded-full border border-theme bg-surface transition
                   peer-checked:bg-brand peer-checked:border-brand"
          >
            <span
              class="ml-1 h-4 w-4 rounded-full bg-foreground/60 transition translate-x-0 peer-checked:translate-x-5"
            ></span>
          </span>
          <span>Reservar</span>
        </label>

        <button @click="fetchLayout" class="rounded-lg border border-theme px-3 py-2 text-sm">
          Refrescar
        </button>

        <button
          @click="onReserve"
          :disabled="selectionList.length === 0 || reserving"
          class="rounded-lg bg-brand px-3 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {{ reserving ? 'Creando…' : `Reservar (${selectionList.length})` }}
        </button>
      </div>
    </header>

    <!-- Estado -->
    <div v-if="loading" class="text-neutral-500">Cargando asientos…</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <div
      v-else-if="tables.length === 0"
      class="rounded-2xl border border-theme bg-surface p-4 text-neutral-500"
    >
      No hay layout para este showtime (o aún no se ha generado).
      <div class="mt-2 text-xs opacity-80">
        <div><b>ID:</b> {{ showtimeId }}</div>
        <div><b>Última respuesta:</b> {{ lastPayload ? 'OK' : '—' }}</div>
      </div>
    </div>

    <!-- Layout -->
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

    <details class="rounded-2xl border border-theme bg-surface p-4 text-xs opacity-80">
      <summary>Debug</summary>
      <pre class="mt-2 whitespace-pre-wrap">{{ lastPayload }}</pre>
    </details>
  </section>
</template>
