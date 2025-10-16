<script setup lang="ts">
import { useRoute } from '#imports'
import { useAdminShowtimes } from '~/composables/admin/useAdminShowtimes' // 👈 Import explícito

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const route = useRoute()
const movieId = computed<string | null>(() => {
  const id = route.params.id
  return (typeof id === 'string' && id.trim()) ? id : null
})

const {
  list, loading, error,
  fetchShowtimes, createShowtime, removeShowtime, generateLayout
} = useAdminShowtimes()

const form = reactive({ fechaHora: '', sala: '', price: 0 })

onMounted(async () => {
  if (!movieId.value) return
  await fetchShowtimes(movieId.value)
})

// helpers
const fmtDateTime = (iso?: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(+d) ? '—' : d.toLocaleString()
}
const fmtMoney = (n?: number) => typeof n === 'number' ? n.toLocaleString('es-CO') : '0'

async function create() {
  if (!movieId.value) return
  if (!form.fechaHora || !form.sala || !form.price) return
  await createShowtime({
    movieId: movieId.value,
    fechaHora: new Date(form.fechaHora).toISOString(),
    sala: form.sala,
    price: form.price
  } as any)
  Object.assign(form, { fechaHora:'', sala:'', price: 0 })
  await fetchShowtimes(movieId.value)
}

async function del(id: string) {
  if (!movieId.value) return
  if (!confirm('¿Eliminar función?')) return
  await removeShowtime(id)
  await fetchShowtimes(movieId.value)
}

async function gen(id: string) {
  if (!movieId.value) return
  await generateLayout(id)
  alert('Layout generado')
}
</script>


<template>
  <section class="space-y-4">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-bold">Funciones</h1>
        <p class="text-sm text-neutral-500">Crea funciones y genera el layout de sillas.</p>
      </div>
      <NuxtLink to="/admin/movies" class="text-sm rounded-lg border border-theme px-3 py-2">← Volver</NuxtLink>
    </header>

    <div v-if="!movieId" class="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-400">
      Falta <b>movieId</b> en la URL. Entra desde <code>/admin/movies</code> → “Funciones”.
    </div>

    <template v-else>
      <form @submit.prevent="create" class="rounded-2xl border border-theme p-4 grid md:grid-cols-4 gap-3 bg-surface">
        <input v-model="form.fechaHora" type="datetime-local" class="rounded-xl border border-theme px-3 py-2 bg-surface"/>
        <input v-model.trim="form.sala" placeholder="Sala" class="rounded-xl border border-theme px-3 py-2 bg-surface"/>
        <input v-model.number="form.price" type="number" min="0" placeholder="Precio" class="rounded-xl border border-theme px-3 py-2 bg-surface"/>
        <button type="submit" class="rounded-xl bg-brand text-white px-3 py-2 text-sm font-semibold">Crear función</button>
      </form>

      <div v-if="loading" class="text-neutral-500">Cargando…</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>

      <div v-else class="grid gap-3">
        <div
          v-for="s in list"
          :key="s?._id || Math.random()"
          class="rounded-2xl border border-theme bg-surface p-4 flex items-center justify-between"
        >
          <div>
            <p class="font-semibold">{{ fmtDateTime(s?.fechaHora) }}</p>
            <p class="text-sm text-neutral-500">
              Sala {{ s?.sala || '—' }} · $ {{ fmtMoney(s?.price) }}
            </p>
          </div>
          <div class="flex gap-2">
            <NuxtLink
              v-if="s?._id"
              :to="`/showtimes/${s._id}`"  
              class="rounded-lg border border-theme px-2.5 py-1 text-xs hover:bg-brand/10">
              Ver layout
            </NuxtLink>
            <button
              v-if="s?._id"
              @click="gen(s._id)"
              class="rounded-lg border border-theme px-2.5 py-1 text-xs hover:bg-brand/10">
              Generar layout
            </button>
            <button
              v-if="s?._id"
              @click="del(s._id)"
              class="rounded-lg border border-red-500/40 text-red-400 px-2.5 py-1 text-xs hover:bg-red-500/10">
              Eliminar
            </button>
          </div>
        </div>

        <div v-if="(list?.length || 0) === 0" class="text-neutral-500">Sin funciones aún.</div>
      </div>
    </template>
  </section>
</template>
