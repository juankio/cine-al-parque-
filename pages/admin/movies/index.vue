<template>
  <section class="space-y-4">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-bold">Películas</h1>
        <p class="text-sm text-neutral-500">
          Activa/descativa para mostrar en cartelera.
        </p>
      </div>
      <div class="flex gap-2">
        <input
          v-model.trim="q"
          type="search"
          placeholder="Buscar…"
          class="rounded-xl border border-theme px-3 py-2 text-sm bg-surface"
        />
        <button
          @click="openCreate = true"
          class="rounded-xl bg-brand text-white px-3 py-2 text-sm font-semibold"
        >
          Nueva
        </button>
      </div>
    </header>

    <div v-if="loading" class="text-neutral-500">Cargando…</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <div v-else class="grid gap-3">
      <div
        v-for="m in filtered"
        :key="m.id"
        class="rounded-2xl border border-theme bg-surface p-4 flex gap-3"
      >
        <img
          :src="m.poster || '/favicon.ico'"
          class="h-20 w-14 rounded-lg object-cover border border-theme/60"
        />
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold">{{ m.titulo }}</h3>
          <p class="text-xs text-neutral-500">
            {{ m.clasificacion || "—" }} · {{ m.duracion ? m.duracion + " min" : "—" }}
          </p>
          <div class="mt-2 flex gap-2">
            <NuxtLink
              :to="`/admin/movies/${m._id}/showtimes`"
              class="rounded-lg border border-theme px-2.5 py-1 text-xs hover:bg-brand/10"
              >Funciones</NuxtLink
            >
            <button
              @click="startEdit(m)"
              class="rounded-lg border border-theme px-2.5 py-1 text-xs hover:bg-brand/10"
            >
              Editar
            </button>
            <button
              @click="toggleActivo(m)"
              class="rounded-lg px-2.5 py-1 text-xs"
              :class="
                m.activo
                  ? 'border border-green-500/40 text-green-400 hover:bg-green-500/10'
                  : 'border border-neutral-500/40 text-neutral-400 hover:bg-neutral-500/10'
              "
            >
              {{ m.activo ? "Activo" : "Inactivo" }}
            </button>
            <button
              @click="del(m)"
              class="rounded-lg border border-red-500/40 text-red-400 px-2.5 py-1 text-xs hover:bg-red-500/10"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <div v-if="(list?.items?.length || 0) === 0" class="text-neutral-500">
        No hay resultados.
      </div>
    </div>

    <!-- Crear -->
    <dialog v-if="openCreate" class="fixed inset-0 grid place-items-center bg-black/40">
      <div class="w-full max-w-md rounded-2xl border border-theme bg-surface p-4">
        <h3 class="font-semibold mb-2">Nueva película</h3>
        <form @submit.prevent="create">
          <input
            v-model.trim="form.titulo"
            placeholder="Título"
            class="w-full mb-2 rounded-xl border border-theme px-3 py-2 bg-surface"
          />
          <input
            v-model.trim="form.poster"
            placeholder="URL poster"
            class="w-full mb-2 rounded-xl border border-theme px-3 py-2 bg-surface"
          />
          <div class="grid grid-cols-2 gap-2 mb-2">
            <input
              v-model.trim="form.clasificacion"
              placeholder="Clasificación"
              class="rounded-xl border border-theme px-3 py-2 bg-surface"
            />
            <input
              v-model.number="form.duracion"
              type="number"
              placeholder="Duración (min)"
              class="rounded-xl border border-theme px-3 py-2 bg-surface"
            />
          </div>
          <textarea
            v-model.trim="form.sinopsis"
            placeholder="Sinopsis"
            class="w-full h-24 rounded-xl border border-theme px-3 py-2 bg-surface"
          ></textarea>
          <div class="mt-3 flex justify-end gap-2">
            <button
              type="button"
              @click="openCreate = false"
              class="rounded-xl border border-theme px-3 py-1.5 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-xl bg-brand text-white px-3 py-1.5 text-sm font-semibold"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </dialog>

    <!-- Editar -->
    <dialog v-if="openEdit" class="fixed inset-0 grid place-items-center bg-black/40">
      <div class="w-full max-w-md rounded-2xl border border-theme bg-surface p-4">
        <h3 class="font-semibold mb-2">Editar película</h3>
        <form @submit.prevent="saveEdit">
          <input
            v-model.trim="form.titulo"
            placeholder="Título"
            class="w-full mb-2 rounded-xl border border-theme px-3 py-2 bg-surface"
          />
          <input
            v-model.trim="form.poster"
            placeholder="URL poster"
            class="w-full mb-2 rounded-xl border border-theme px-3 py-2 bg-surface"
          />
          <div class="grid grid-cols-2 gap-2 mb-2">
            <input
              v-model.trim="form.clasificacion"
              placeholder="Clasificación"
              class="rounded-xl border border-theme px-3 py-2 bg-surface"
            />
            <input
              v-model.number="form.duracion"
              type="number"
              placeholder="Duración (min)"
              class="rounded-xl border border-theme px-3 py-2 bg-surface"
            />
          </div>
          <textarea
            v-model.trim="form.sinopsis"
            placeholder="Sinopsis"
            class="w-full h-24 rounded-xl border border-theme px-3 py-2 bg-surface"
          ></textarea>
          <label class="mt-2 inline-flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="form.activo" /> Activo en cartelera
          </label>
          <div class="mt-3 flex justify-end gap-2">
            <button
              type="button"
              @click="openEdit = false"
              class="rounded-xl border border-theme px-3 py-1.5 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-xl bg-brand text-white px-3 py-1.5 text-sm font-semibold"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Admin from '~/layouts/admin.vue'
import { useAdminMovies, type AdminMovie } from '~/composables/admin/useAdminMovies'

definePageMeta({ layout: 'admin', middleware: ['admin'] })


const { list, loading, error, fetchMovies, createMovie, updateMovie, removeMovie } = useAdminMovies()
const q = ref('')

const openCreate = ref(false)
const openEdit = ref(false)
const currentId = ref<string | null>(null)

const form = reactive<Partial<AdminMovie>>({
  titulo: '', poster: '', clasificacion: '', duracion: undefined, sinopsis: '', activo: true
})

onMounted(() => { fetchMovies(1, 50) })

const filtered = computed(() => {
  const items = list.value?.items || []
  const term = q.value.toLowerCase()
  return term ? items.filter(i => i.titulo.toLowerCase().includes(term)) : items
})

function startEdit(m: AdminMovie) {
  currentId.value = m._id
  Object.assign(form, m)
  openEdit.value = true
}

async function create() {
  await createMovie(form)
  openCreate.value = false
  Object.assign(form, { titulo:'', poster:'', clasificacion:'', duracion: undefined, sinopsis:'', activo:true })
  await fetchMovies(1, 50)
}

async function saveEdit() {
  if (!currentId.value) return
  await updateMovie(currentId.value, form)
  openEdit.value = false
  await fetchMovies(1, 50)
}

async function toggleActivo(m: AdminMovie) {
  await updateMovie(m._id, { activo: !m.activo })
  await fetchMovies(1, 50)
}

async function del(m: AdminMovie) {
  if (!confirm('¿Eliminar película?')) return
  await removeMovie(m.id)
  await fetchMovies(1, 50)
}
</script>
