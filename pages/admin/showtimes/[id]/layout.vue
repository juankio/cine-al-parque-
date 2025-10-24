<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from '#imports'
import { useAdminLayout, type PatternCell } from '~/composables/admin/useAdminLayout'
import { useAdminShowtimes } from '~/composables/admin/useAdminShowtimes'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const route = useRoute()
const showtimeId = computed(() => String(route.params.id || ''))

// Showtime info
const { list, fetchShowtimes } = useAdminShowtimes()
const showtime = computed(() => list.value.find(s => s._id === showtimeId.value) || null)

onMounted(async () => {
  if (!showtime.value) {
    await fetchShowtimes('', { page: 1, pageSize: 100 })
  }
})

const { loading, error, generate, setActive } = useAdminLayout()

// ====== Form ======
const rows = ref(6)
const cols = ref(6)
const replace = ref(true)
const prefix = ref('M')

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
    const res: any = await generate(showtimeId.value, {
      replace: replace.value,
      rows: rows.value,
      cols: cols.value,
      pattern: pattern.value
    } as any)

    const tables = typeof res?.tables === 'number' ? res.tables : (res?.createdTables ?? 0)
    const seats  = typeof res?.seats  === 'number' ? res.seats  : (res?.createdSeats ?? 0)

    const fallbackTables = rows.value * cols.value
    const fallbackSeats = pattern.value.flat().reduce((acc, cell) => acc + (cell === '4' ? 4 : 2), 0)

    msg.value = `Layout generado: ${tables || fallbackTables} mesas / ${seats || fallbackSeats} sillas`
  } catch (e) {}
}

async function onToggleActive() {
  if (!showtimeId.value) return
  const current = !!showtime.value?.['active']
  await setActive(showtimeId.value, !current)
  await fetchShowtimes('', { page: 1, pageSize: 100 })
}

const fmtMoney = (n?: number) => typeof n === 'number' ? n.toLocaleString('es-CO') : '0'
</script>

<template>
  <section class="space-y-5">
    <!-- Header -->
    <header class="flex items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Layout de sillas</h1>
        <p class="text-sm text-muted">Define mesas de 2 o 4 puestos por celda y genera el layout.</p>

        <p v-if="showtime" class="mt-1 text-xs text-muted">
          Showtime: <code>{{ showtime._id }}</code> · Sala: <b>{{ showtime.sala }}</b> ·
          Precio: $ {{ fmtMoney(showtime.price) }}
          · Estado:
          <b :class="showtime.active ? 'text-primary' : 'text-gray-500'">
            {{ showtime.active ? 'Activo' : 'Inactivo' }}
          </b>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          :to="`/admin/movies/${showtime?.movieId || ''}/showtimes`"
          color="gray"
          variant="outline"
          size="sm"
        >
          ← Volver
        </UButton>
        <UButton
          :to="`/showtimes/${showtimeId}`"
          color="primary"
          variant="outline"
          size="sm"
        >
          Ver público
        </UButton>
      </div>
    </header>

    <!-- Controles -->
    <UCard class="p-4">
      <div class="grid gap-3 md:grid-cols-6">
        <UFormGroup label="Filas" class="flex items-center gap-2 text-sm">
          <UInput v-model.number="rows" type="number" min="1" max="20" class="w-24" />
        </UFormGroup>

        <UFormGroup label="Columnas" class="flex items-center gap-2 text-sm">
          <UInput v-model.number="cols" type="number" min="1" max="20" class="w-24" />
        </UFormGroup>

        <UCheckbox v-model="replace" label="Reemplazar layout" />

        <div class="text-xs text-muted self-center">
          <span class="inline-block rounded-lg border border-default px-2 py-1">2</span> =
          mesa de 2 &nbsp;·&nbsp;
          <span class="inline-block rounded-lg border border-primary px-2 py-1 text-primary">4</span>
          = mesa de 4
        </div>

        <UButton
          label="Reset patrón"
          variant="outline"
          color="gray"
          @click="initPattern"
        />
        <UButton
          :label="showtime?.active ? 'Desactivar showtime' : 'Activar showtime'"
          :color="showtime?.active ? 'red' : 'primary'"
          variant="outline"
          @click="onToggleActive"
        />
      </div>
    </UCard>

    <!-- Editor de grilla -->
    <UCard>
      <p class="mb-3 text-xs text-muted">
        Click en cada celda para alternar entre mesas de <b>2</b> y <b>4</b>.
      </p>

      <div
        class="inline-grid gap-2"
        :style="{ gridTemplateColumns: `repeat(${cols}, minmax(48px, 1fr))` }"
      >
        <UButton
          v-for="(cell, idx) in rows * cols"
          :key="idx"
          :label="pattern[Math.floor(idx / cols)][idx % cols]"
          :variant="pattern[Math.floor(idx / cols)][idx % cols] === '4' ? 'outline' : 'soft'"
          :color="pattern[Math.floor(idx / cols)][idx % cols] === '4' ? 'primary' : 'gray'"
          class="h-12 text-sm font-semibold"
          @click="toggleCell(Math.floor(idx / cols), idx % cols)"
        />
      </div>
    </UCard>

    <!-- Acciones -->
    <div class="flex items-center gap-3">
      <UButton
        :label="loading ? 'Generando…' : 'Generar layout'"
        color="primary"
        :loading="loading"
        @click="onGenerate"
      />
      <span v-if="error" class="text-red-500 text-sm">{{ error }}</span>
      <span v-if="msg" class="text-primary text-sm">{{ msg }}</span>
    </div>
  </section>
</template>
