<script setup>
import SeatGrid from "~/components/SeatGrid.vue"

const route = useRoute()
const picked = ref([])
const seats = ref([])
const rows = ref(8)
const cols = ref(12)
const loading = ref(true)
const errorMsg = ref("")

onMounted(async () => {
  const showtimeId = route.query.showtime
  console.log("🎯 showtimeId:", showtimeId)

  if (!showtimeId) {
    errorMsg.value = "Falta el ID de la función (?showtime=ID)."
    loading.value = false
    return
  }

  try {
    const url = `/api/showtimes/${encodeURIComponent(showtimeId)}/layout`
    console.log("🔌 GET:", url)

    const res = await fetch(url, { headers: { Accept: "application/json" } })
    const ct = res.headers.get("content-type") || ""
    console.log("📦 status:", res.status, "content-type:", ct)

    if (!res.ok) {
      const text = await res.text()
      console.error("❌ Respuesta no OK:\n", text)
      errorMsg.value = `Error ${res.status} al cargar layout.`
      return
    }
    const data = ct.includes("application/json") ? await res.json() : await (async () => { const t = await res.text(); throw new Error("No es JSON:\n" + t) })()
    console.log("🪑 layout crudo:", data)

    // Normalizaciones posibles:
    // 1) { rows, cols, seats: [{ code: 'A1', reserved: true }, ...] }
    // 2) { rows, cols, grid: [[{code, reserved},...], ...] }
    // 3) { seats: { 'A1': true, 'A2': false, ... }, rows, cols }
    const normalized = normalizeLayout(data)
    rows.value = normalized.rows
    cols.value = normalized.cols
    seats.value = normalized.seats
    console.log("✅ layout normalizado:", normalized)
  } catch (err) {
    console.error("💥 Error layout:", err)
    errorMsg.value = "Fallo al cargar layout. Mira consola."
  } finally {
    loading.value = false
  }
})

function normalizeLayout(d) {
  let r = Number(d?.rows) || 8
  let c = Number(d?.cols) || 12
  let list = []

  if (Array.isArray(d?.seats)) {
    // [{ code, reserved }] o [{ id, taken }]
    list = d.seats.map((s, i) => ({
      code: s.code ?? s.id ?? s.seat ?? String(i + 1),
      taken: (typeof s.taken !== "undefined") ? !!s.taken
            : (typeof s.reserved !== "undefined") ? !!s.reserved
            : !s.available
    }))
  } else if (Array.isArray(d?.grid)) {
    // grid 2D → a plano
    list = d.grid.flat().map((s, i) => ({
      code: s.code ?? s.id ?? s.seat ?? String(i + 1),
      taken: (typeof s.taken !== "undefined") ? !!s.taken
            : (typeof s.reserved !== "undefined") ? !!s.reserved
            : !s.available
    }))
    r = d.grid.length || r
    c = d.grid[0]?.length || c
  } else if (d?.seats && typeof d.seats === "object") {
    // mapa { 'A1': true, 'A2': false }
    list = Object.entries(d.seats).map(([code, reserved]) => ({
      code,
      taken: !!reserved
    }))
  }

  return { rows: r, cols: c, seats: list }
}

async function confirm() {
  if (!picked.value.length) return
  try {
    const showtimeId = route.query.showtime
    const res = await fetch(`/api/showtimes/${encodeURIComponent(showtimeId)}/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ seats: picked.value })
    })
    const ct = res.headers.get("content-type") || ""
    if (!res.ok) {
      const text = await res.text()
      console.error("❌ Reserva no OK:", text)
      alert("Error al reservar. Revisa consola.")
      return
    }
    const payload = ct.includes("application/json") ? await res.json() : await res.text()
    console.log("✅ Reserva OK:", payload)
    alert("Reserva confirmada ✅")
  } catch (e) {
    console.error(e)
    alert("Error de red al reservar.")
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-extrabold">Sala al aire libre</h1>
        <p class="opacity-80 text-sm">Selecciona tus puestos, parcero.</p>
      </div>
      <button class="btn btn-primary" :disabled="!picked.length" @click="confirm">
        Confirmar ({{ picked.length }})
      </button>
    </header>

    <div class="card p-6">
      <div class="mx-auto w-full max-w-3xl">
        <div class="mb-4 text-center opacity-80">Pantalla</div>
        <div class="h-2 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20"></div>

        <div class="mt-6">
          <div v-if="loading" class="opacity-70 text-sm">Cargando layout…</div>
          <div v-else-if="errorMsg" class="text-red-400 text-sm">{{ errorMsg }}</div>
          <SeatGrid
            v-else
            :rows="rows"
            :cols="cols"
            v-model:value="picked"
            :seats="seats"
          />
        </div>
      </div>
    </div>
  </section>
</template>
