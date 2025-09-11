<script setup>
import { computed } from 'vue'
import { useSeats } from '@/stores/useSeats'
const seats = useSeats()

const byTable = computed(() => {
  const map = {}
  for (const t of seats.tables) map[t.id] = []
  for (const id of seats.takenIds) {
    const [tableId, seatKey] = id.split('-')
    if (!map[tableId]) map[tableId] = []
    map[tableId].push(seatKey)
  }
  return map
})
</script>

<template>
  <section>
    <h2 class="text-2xl font-bold mb-4">Admin — Ocupación actual</h2>

    <div class="mb-2 text-sm text-gray-300">
      Contexto:
      <b>{{ seats.movieId || '—' }}</b>
      <span v-if="seats.hora"> • {{ seats.hora }}</span>
    </div>

    <div class="mb-4 text-sm text-gray-300">
      Puestos ocupados: <b>{{ seats.takenIds.length }}</b> / {{ seats.total }}
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <article v-for="t in seats.tables" :key="t.id" class="rounded-xl border border-white/10 bg-gray-800/60 p-4">
        <header class="flex items-center justify-between mb-2">
          <h3 class="font-semibold">
            Mesa {{ t.id }} <span class="text-xs text-gray-400">({{ t.type }} puestos)</span>
          </h3>
          <span class="text-xs text-gray-400">Ocupados: {{ (byTable[t.id] || []).length }}</span>
        </header>
        <div class="flex flex-wrap gap-2">
          <span v-for="s in (byTable[t.id] || [])" :key="s" class="px-2 py-1 rounded bg-red-600 text-white text-xs">
            {{ t.id }}-{{ s }}
          </span>
          <p v-if="!(byTable[t.id] || []).length" class="text-gray-400 text-sm">Sin ocupados</p>
        </div>
      </article>
    </div>
  </section>
</template>
