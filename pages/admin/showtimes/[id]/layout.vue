<script setup lang="ts">
import { useRoute } from '#imports'
import { useAdminLayout, type PatternCell } from '~/composables/admin/useAdminLayout'
import { useAdminShowtimes } from '~/composables/admin/useAdminShowtimes'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const route = useRoute()
const showtimeId = computed(() => String(route.params.id || ''))

// Traer datos del showtime (sala/price/activo)
const { list, fetchShowtimes } = useAdminShowtimes()
const showtime = computed(() => list.value.find(s => s._id === showtimeId.value) || null)

onMounted(async () => {
  if (!showtime.value) {
    // carga un batch para poder mostrar estado/sala/precio
    await fetchShowtimes('', { page: 1, pageSize: 100 })
  }
})

const { loading, error, generate, setActive } = useAdminLayout()

// ====== Form ======
const rows = ref(6)
const cols = ref(6)
const replace = ref(true)
const prefix = ref('M') // por si tu backend usa prefijo de mesa

// patrón 2/4
const pattern = ref<PatternCell[][]>([])
function initPattern() {
  const r = rows.value, c = cols.value
  pattern.value = Array.from({ length: r }, (_, i) =>
    Array.from({ length: c }, (_, j) => ((i + j) % 2 === 0 ? '4' : '2'))
  )
}
watch([rows, cols], initPattern, { immediate: true })

function toggleCell(r: number, c: number) {
  pattern.value[r][c] = pattern.value[r][c] === '4' ? '2' : '4'
}

const msg = ref<string | null>(null)

async function onGenerate() {
  msg.value = null
  if (!showtimeId.value) return

  try {
    // Enviamos pattern (tu endpoint ya lo soporta) y también prefix/replace
    const res: any = await generate(showtimeId.value, {
      replace: replace.value,
      rows: rows.value,
      cols: cols.value,
      pattern: pattern.value
    } as any)

    // soporta ambos nombres de respuesta
    const tables = typeof res?.tables === 'number' ? res.tables : (res?.createdTables ?? 0)
    const seats  = typeof res?.seats  === 'number' ? res.seats  : (res?.createdSeats ?? 0)

    // fallback final por si cambia el backend
    const fallbackTables = rows.value * cols.value
    const fallbackSeats = pattern.value.flat().reduce((acc, cell) => acc + (cell === '4' ? 4 : 2), 0)

    msg.value = `Layout generado: ${tables || fallbackTables} mesas / ${seats || fallbackSeats} sillas`
  } catch (e) {
    // error ya queda en composable
  }
}

async function onToggleActive() {
  if (!showtimeId.value) return
  const current = !!showtime.value?.['active']
  await setActive(showtimeId.value, !current)
  await fetchShowtimes('', { page: 1, pageSize: 100 })
}

// helpers display
const fmtMoney = (n?: number) => typeof n === 'number' ? n.toLocaleString('es-CO') : '0'
</script>

<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-bold">Layout de sillas</h1>
        <p class="text-sm text-neutral-500">
          Define mesas de 2 o 4 puestos por celda y genera el layout.
        </p>
        <p v-if="showtime" class="mt-1 text-xs text-neutral-500">
          Showtime: <code>{{ showtime._id }}</code> · Sala: <b>{{ showtime.sala }}</b> ·
          Precio: $ {{ fmtMoney(showtime.price) }}
          · Estado:
          <b :class="showtime.active ? 'text-brand' : 'text-neutral-500'">
            {{ showtime.active ? "Activo" : "Inactivo" }}
          </b>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          :to="`/admin/movies/${showtime?.movieId || ''}/showtimes`"
          class="rounded-lg border border-theme px-3 py-2 text-sm"
          >← Volver</NuxtLink
        >
        <NuxtLink
          :to="`/showtimes/${showtimeId}`"
          class="rounded-lg border border-theme px-3 py-2 text-sm"
          >Ver público</NuxtLink
        >
      </div>
    </header>

    <!-- Controles -->
    <div class="rounded-2xl border border-theme bg-surface p-4 grid gap-3 md:grid-cols-6">
      <label class="flex items-center gap-2 text-sm">
        Filas
        <input
          v-model.number="rows"
          type="number"
          min="1"
          max="20"
          class="w-20 rounded-lg border border-theme bg-surface px-2 py-1"
        />
      </label>
      <label class="flex items-center gap-2 text-sm">
        Columnas
        <input
          v-model.number="cols"
          type="number"
          min="1"
          max="20"
          class="w-24 rounded-lg border border-theme bg-surface px-2 py-1"
        />
      </label>
      <label class="flex items-center gap-2 text-sm">
        Reemplazar layout
        <input v-model="replace" type="checkbox" class="h-4 w-4" />
      </label>
      <div class="text-xs text-neutral-500 self-center">
        <span class="inline-block rounded-lg border border-theme px-2 py-1">2</span> =
        mesa de 2 &nbsp;·&nbsp;
        <span class="inline-block rounded-lg border border-brand px-2 py-1 text-brand"
          >4</span
        >
        = mesa de 4
      </div>
      <button
        @click="initPattern"
        class="rounded-lg border border-theme px-3 py-2 text-sm hover:bg-brand/10"
      >
        Reset patrón
      </button>
      <button
        @click="onToggleActive"
        class="rounded-lg px-3 py-2 text-sm"
        :class="
          showtime?.active
            ? 'border border-red-400 text-red-400 hover:bg-red-500/10'
            : 'border border-brand text-brand hover:bg-brand/10'
        "
      >
        {{ showtime?.active ? "Desactivar showtime" : "Activar showtime" }}
      </button>
    </div>

    <!-- Editor de grilla -->
    <div class="rounded-2xl border border-theme bg-surface p-4">
      <div class="mb-2 text-xs text-neutral-500">
        Click en cada celda para alternar entre mesas de <b>2</b> y de <b>4</b>.
      </div>
      <div
        class="inline-grid gap-2"
        :style="{ gridTemplateColumns: `repeat(${cols}, minmax(48px, 1fr))` }"
      >
        <button
          v-for="(cell, idx) in rows * cols"
          :key="idx"
          class="h-12 rounded-xl border text-sm font-semibold transition-colors"
          :class="
            pattern[Math.floor(idx / cols)][idx % cols] === '4'
              ? 'border-brand text-brand hover:bg-brand/10'
              : 'border-theme hover:bg-brand/10'
          "
          @click="toggleCell(Math.floor(idx / cols), idx % cols)"
        >
          {{ pattern[Math.floor(idx / cols)][idx % cols] }}
        </button>
      </div>
    </div>

    <!-- Acciones -->
    <div class="flex items-center gap-2">
      <button
        @click="onGenerate"
        :disabled="loading"
        class="rounded-lg bg-brand px-3 py-2 text-sm font-semibold disabled:opacity-50"
      >
        {{ loading ? "Generando…" : "Generar layout" }}
      </button>
      <span v-if="error" class="text-red-500 text-sm">{{ error }}</span>
      <span v-if="msg" class="text-brand text-sm">{{ msg }}</span>
    </div>
  </section>
</template>
