<template>
  <section class="space-y-4">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-bold">Funciones</h1>
        <p class="text-sm text-neutral-500">
          Lista global. Filtra por película o crea nuevas.
        </p>
      </div>
    </header>

    <!-- Crear rápida -->
    <form
      @submit.prevent="create"
      class="rounded-2xl border border-theme p-4 grid md:grid-cols-5 gap-3 bg-surface"
    >
      <AdminMovieSelect v-model="form.movieId" />
      <input
        v-model="form.fechaHora"
        type="datetime-local"
        class="rounded-xl border border-theme px-3 py-2 bg-surface"
      />
      <input
        v-model.trim="form.sala"
        placeholder="Sala"
        class="rounded-xl border border-theme px-3 py-2 bg-surface"
      />
      <input
        v-model.number="form.price"
        type="number"
        min="0"
        placeholder="Precio"
        class="rounded-xl border border-theme px-3 py-2 bg-surface"
      />
      <button type="submit" class="rounded-xl bg-brand px-3 py-2 text-sm font-semibold">
        Crear función
      </button>
    </form>

    <!-- Filtros -->
    <div class="flex flex-wrap items-center gap-3">
      <label class="text-sm text-neutral-500">Filtrar por película:</label>
      <AdminMovieSelect v-model="filterMovieId" />
      <button
        @click="applyFilter"
        class="rounded-lg border border-theme px-2.5 py-1 text-xs hover:bg-brand/10"
      >
        Aplicar
      </button>
      <button
        @click="clearFilter"
        class="rounded-lg border border-theme px-2.5 py-1 text-xs hover:bg-brand/10"
      >
        Limpiar
      </button>
    </div>

    <div v-if="loading" class="text-neutral-500">Cargando…</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <div v-else>
      <div v-if="list.length === 0" class="text-neutral-500">Sin funciones aún.</div>
      <div v-else class="grid gap-3">
        <div
          v-for="s in list"
          :key="s._id"
          class="rounded-2xl border border-theme bg-surface p-4 flex items-center justify-between"
        >
          <div>
            <p class="font-semibold">{{ fmtDateTime(s.fechaHora) }}</p>
            <p class="text-sm text-neutral-500">
              Sala {{ s.sala }} · $ {{ fmtMoney(s.price) }}
            </p>
            <p class="text-xs text-neutral-500">showtimeId: {{ s._id }}</p>
          </div>
          <div class="flex gap-2">
            <NuxtLink
              :to="`/showtimes/${s._id}`"
              class="rounded-lg border border-theme px-2.5 py-1 text-xs hover:bg-brand/10"
              >Ver layout</NuxtLink
            >
            <button
              @click="onGen(s._id)"
              class="rounded-lg border border-theme px-2.5 py-1 text-xs hover:bg-brand/10"
            >
              Generar layout
            </button>
            <NuxtLink
              :to="`/admin/movies/${s.movieId}/showtimes`"
              class="rounded-lg border border-theme px-2.5 py-1 text-xs hover:bg-brand/10"
              >Funciones de la peli</NuxtLink
            >
            <button
              @click="onDelete(s._id)"
              class="rounded-lg border border-red-500/40 text-red-400 px-2.5 py-1 text-xs hover:bg-red-500/10"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import AdminMovieSelect from "~/components/AdminMovieSelect.vue";
import { useShowtimeLayout } from '~/composables/useShowtimeLayout'

import { useAdminShowtimes } from "~/composables/admin/useAdminShowtimes";

definePageMeta({ layout: "admin", middleware: ["admin"] });

const {
  list,
  loading,
  error,
  fetchShowtimes,
  createShowtime,
  removeShowtime,
  generateLayout,
} = useAdminShowtimes();

// crear rápida
const form = reactive<{
  movieId: string | null;
  fechaHora: string;
  sala: string;
  price: number;
}>({
  movieId: null,
  fechaHora: "",
  sala: "",
  price: 0,
});
async function create() {
  if (!form.movieId || !form.fechaHora || !form.sala || !form.price) return;
  const created = await createShowtime({
    movieId: form.movieId,
    fechaHora: new Date(form.fechaHora).toISOString(),
    sala: form.sala,
    price: form.price,
  });
  if (created?._id) {
    // genera layout automático
    await generateLayout(created._id);
    // limpia form
    Object.assign(form, { movieId: null, fechaHora: "", sala: "", price: 0 });
  }
}

// filtro
const filterMovieId = ref<string | null>(null);
async function applyFilter() {
  await fetchShowtimes(filterMovieId.value || undefined);
}
async function clearFilter() {
  filterMovieId.value = null;
  await fetchShowtimes();
}

// helpers
const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return isNaN(+d) ? "—" : d.toLocaleString();
};
const fmtMoney = (n: number) => (typeof n === "number" ? n.toLocaleString("es-CO") : "0");

// init
onMounted(() => fetchShowtimes());
</script>
