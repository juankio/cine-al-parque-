<script setup lang="ts">
import { useRoute } from '#imports'
import { useAdminShowtimes } from '~/composables/admin/useAdminShowtimes'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const route = useRoute()
const movieId = computed<string | null>(() => {
  const id = route.params.id
  return (typeof id === 'string' && id.trim()) ? id : null
})

const { list, loading, error, fetchShowtimes, createShowtime, removeShowtime, generateLayout } = useAdminShowtimes()

const form = reactive({ fechaHora: '', sala: '', price: 0 })

watchEffect(async () => {
  if (!movieId.value) return
  await fetchShowtimes(movieId.value, { page: 1, pageSize: 50, upcoming: true })
})

// helpers display
const fmtDateTime = (iso?: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(+d) ? '—' : d.toLocaleString()
}
const fmtMoney = (n?: number) => typeof n === 'number' ? n.toLocaleString('es-CO') : '0'

// crear → agrega al instante y (opcional) te lleva al editor de layout
const AUTO_GO_TO_LAYOUT = true // ← pon en false si no quieres redirigir tras crear
async function create() {
  if (!movieId.value) return
  if (!form.fechaHora || !form.sala || !form.price) return

  const created = await createShowtime({
    movieId: movieId.value,
    fechaHora: new Date(form.fechaHora).toISOString(),
    sala: form.sala,
    price: form.price
  })

  Object.assign(form, { fechaHora: '', sala: '', price: 0 })

  if (created?._id) {
    if (AUTO_GO_TO_LAYOUT) {
      await navigateTo(`/admin/showtimes/${created._id}/layout`)
    } else {
      await generateLayout(created._id) // genera sin salir de esta vista
    }
  }
}

async function del(id: string) {
  if (!movieId.value) return
  if (!confirm('¿Eliminar función?')) return
  await removeShowtime(id)
}
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-bold">Funciones</h1>
        <p class="text-sm text-neutral-500">Crea funciones y configura el layout de sillas.</p>
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
        <button type="submit" class="rounded-xl bg-brand px-3 py-2 text-sm font-semibold">Crear función</button>
      </form>

      <div v-if="loading" class="text-neutral-500">Cargando…</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>

      <div v-else class="grid gap-3">
        <div
          v-for="s in list"
          :key="s._id"
          class="rounded-2xl border border-theme bg-surface p-4 flex items-center justify-between"
        >
          <div>
            <p class="font-semibold">{{ fmtDateTime(s.fechaHora) }}</p>
            <p class="text-sm text-neutral-500">
              Sala {{ s.sala || '—' }} · $ {{ fmtMoney(s.price) }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <!-- 🆕 Enlace directo al editor de layout -->
            <NuxtLink
              :to="`/admin/showtimes/${s._id}/layout`"
              class="rounded-lg border border-theme px-2.5 py-1 text-xs hover:bg-brand/10"
              title="Configurar layout de sillas"
            >
              Configurar layout
            </NuxtLink>

            <!-- Ver layout público (opcional) -->
            <NuxtLink
              :to="`/showtimes/${s._id}`"
              class="rounded-lg border border-theme px-2.5 py-1 text-xs hover:bg-brand/10"
            >
              Ver layout (público)
            </NuxtLink>

            <!-- Regenerar layout rápido (sin salir) -->
            <button
              @click="generateLayout(s._id)"
              class="rounded-lg border border-theme px-2.5 py-1 text-xs hover:bg-brand/10"
            >
              Regenerar layout
            </button>

            <button
              @click="del(s._id)"
              class="rounded-lg border border-red-500/40 text-red-400 px-2.5 py-1 text-xs hover:bg-red-500/10"
            >
              Eliminar
            </button>
          </div>
        </div>

        <div v-if="(list?.length || 0) === 0" class="text-neutral-500">Sin funciones aún.</div>
      </div>
    </template>
  </section>
</template>
