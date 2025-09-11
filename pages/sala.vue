<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeats } from '@/stores/useSeats'

const route = useRoute()
const router = useRouter()
const seats = useSeats()

const movieId = computed(() => route.query.movie?.toString() || null)
const hora = computed(() => route.query.hora?.toString() || null)

onMounted(() => {
  if (!movieId.value || !hora.value) return
  seats.setContext({ movieId: movieId.value, hora: hora.value })
})

function seatClass (id) {
  return seats.isTaken(id)
    ? 'bg-red-600 cursor-not-allowed'
    : seats.isSelected(id)
      ? 'bg-transparent border-2 border-white'
      : 'bg-gray-700 hover:bg-gray-600'
}

const columns = 3
const tableGrid = computed(() => {
  const out = []
  for (let i = 0; i < seats.tables.length; i += columns) {
    out.push(seats.tables.slice(i, i + columns))
  }
  return out
})

function backToMovie () {
  if (movieId.value) router.push(`/pelicula/${movieId.value}`)
  else router.push('/')
}
</script>

<template>
  <section>
    <header class="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Selecciona tu mesa</h1>
        <p class="text-sm text-gray-300">
          Película:
          <span class="font-semibold">{{ movieId || '—' }}</span>
          <span v-if="hora"> • {{ hora }}</span>
        </p>
      </div>
      <div class="text-right">
        <p class="text-xs text-gray-400">Total puestos: {{ seats.total }}</p>
        <p class="text-xs text-gray-400">Seleccionados: {{ seats.selectedCount }}</p>
      </div>
    </header>

    <div v-if="!movieId || !hora" class="p-4 border border-white/10 rounded bg-gray-800/60 text-gray-200">
      Selecciona una película y horario desde la <NuxtLink to="/" class="underline">cartelera</NuxtLink>.
    </div>

    <div v-else class="space-y-4">
      <div v-for="(row, rIdx) in tableGrid" :key="rIdx" class="grid gap-4" :style="`grid-template-columns: repeat(${columns}, minmax(0, 1fr));`">
        <article v-for="table in row" :key="table.id" class="rounded-xl border border-white/10 bg-gray-800/60 p-4">
          <header class="flex items-center justify-between mb-3">
            <h3 class="font-semibold">Mesa {{ table.id }}</h3>
            <span class="text-xs text-gray-400">{{ table.type }} puestos</span>
          </header>

          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="s in table.seats"
              :key="s"
              class="h-10 rounded flex items-center justify-center text-xs border border-transparent focus:outline-none focus:ring-2 focus:ring-white/60"
              :class="seatClass(seats.seatId(table.id, s))"
              :disabled="seats.isTaken(seats.seatId(table.id, s))"
              @click="seats.toggle(seats.seatId(table.id, s))"
            >
              {{ table.id }}-{{ s }}
            </button>
          </div>
        </article>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <button
          class="px-4 py-2 rounded bg-white text-gray-900 font-semibold disabled:opacity-50"
          :disabled="seats.selectedCount === 0"
          @click="seats.confirm()"
        >
          Confirmar ({{ seats.selectedCount }})
        </button>
        <button class="px-4 py-2 rounded bg-gray-800 border border-gray-600" @click="seats.clearAll()">
          Limpiar todo
        </button>
        <button class="px-4 py-2 rounded bg-gray-800 border border-gray-600" @click="backToMovie">
          Volver a la película
        </button>
      </div>
    </div>
  </section>
</template>
