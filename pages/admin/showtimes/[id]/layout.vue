<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from '#imports'
import { useAdminLayout, type PatternCell } from '~/composables/admin/useAdminLayout'
import { useAdminShowtimes } from '~/composables/admin/useAdminShowtimes'

import LayoutHeader from '~/components/boss/layout/LayoutHeader.vue'
import LayoutToolbar from '~/components/boss/layout/LayoutToolbar.vue'
import LayoutActions from '~/components/boss/layout/LayoutActions.vue'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

/* ====== contexto ====== */
const route = useRoute()
const showtimeId = computed(() => String(route.params.id || ''))

const { list, fetchShowtimes } = useAdminShowtimes()
const showtime = computed(() => list.value.find(s => s._id === showtimeId.value) || null)
onMounted(async () => { if (!showtime.value) await fetchShowtimes('', { page: 1, pageSize: 100 }) })

const { loading, error, generate, setActive } = useAdminLayout()

/* ====== estado layout ====== */
const rows = ref(6)
const cols = ref(6)
const replace = ref(true)
const pattern = ref<PatternCell[][]>([])

function initPattern(fill: 'alt'|'2'|'4'|'empty' = 'alt') {
  const r = rows.value, c = cols.value
  pattern.value = Array.from({ length: r }, (_, i) =>
    Array.from({ length: c }, (_, j) => {
      if (fill === '2') return '2'
      if (fill === '4') return '4'
      if (fill === 'empty') return '2'
      return ((i + j) % 2 === 0) ? '4' : '2'
    })
  )
}
watch([rows, cols], () => initPattern('alt'), { immediate: true })

function toggleCell(r: number, c: number) {
  pattern.value[r][c] = pattern.value[r][c] === '4' ? '2' : '4'
}

/* totales */
const totalMesas  = computed(() => rows.value * cols.value)
const totalSillas = computed(() => pattern.value.flat().reduce((a,c) => a + (c==='4'?4:2), 0))

/* acciones backend */
const msg = ref<string | null>(null)

async function onGenerate() {
  msg.value = null
  if (!showtimeId.value) return
  try {
    const res: any = await generate(showtimeId.value, {
      replace: replace.value, rows: rows.value, cols: cols.value, pattern: pattern.value
    } as any)
    const mesas = typeof res?.tables === 'number' ? res.tables : (res?.createdTables ?? totalMesas.value)
    const sillas = typeof res?.seats  === 'number' ? res.seats  : (res?.createdSeats  ?? totalSillas.value)
    msg.value = `Layout generado: ${mesas} mesas · ${sillas} sillas`
  } catch (e) { /* ya mostramos error */ }
}

async function onToggleActive() {
  if (!showtimeId.value) return
  const state = !!showtime.value?.['active']
  await setActive(showtimeId.value, !state)
  await fetchShowtimes('', { page: 1, pageSize: 100 })
}
</script>

<template>
  <UContainer class="py-6 space-y-5">
    <!-- Header resumen -->
    <LayoutHeader
      :showtime="showtime"
      :showtime-id="showtimeId"
      :total-mesas="totalMesas"
      :total-sillas="totalSillas"
    />

    <!-- Toolbar / controles -->
    <LayoutToolbar
      v-model:rows="rows"
      v-model:cols="cols"
      v-model:replace="replace"
      :active="!!showtime?.active"
      @init-pattern="initPattern"
      @toggle-active="onToggleActive"
    />

    <!-- Editor grilla -->
    <AdminGridLayout :rows="rows" :cols="cols" :pattern="pattern" @toggle="toggleCell" />

    <!-- Acciones -->
    <LayoutActions
      :loading="loading"
      :error="error || ''"
      :message="msg || ''"
      @generate="onGenerate"
    />
  </UContainer>
</template>
