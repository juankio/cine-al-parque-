<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAdminMovies, type AdminMovie } from '~/composables/admin/useAdminMovies'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const { list, loading, error, fetchMovies, createMovie, updateMovie, removeMovie } = useAdminMovies()

const q = ref('')
const openCreate = ref(false)
const openEdit = ref(false)
const currentId = ref<string | null>(null)

const form = reactive<Partial<AdminMovie>>({
  titulo: '',
  poster: '',
  clasificacion: '',
  duracion: undefined,
  sinopsis: '',
  activo: true
})

onMounted(() => { fetchMovies(1, 50) })

const filtered = computed(() => {
  const items = list.value?.items || []
  const term = q.value.toLowerCase()
  return term ? items.filter(i => i.titulo.toLowerCase().includes(term)) : items
})

function startEdit(m: AdminMovie) {
  currentId.value = m._id
  Object.assign(form, {
    titulo: m.titulo || '',
    poster: m.poster || '',
    clasificacion: m.clasificacion || '',
    duracion: m.duracion,
    sinopsis: m.sinopsis || '',
    activo: !!m.activo
  })
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

function clearQ () { q.value = '' }
</script>

<template>
  <section class="space-y-5">
    <!-- Header -->
    <header class="flex items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Películas</h1>
        <p class="text-sm text-muted">Activa/desactiva para mostrar en cartelera.</p>
      </div>

      <div class="flex items-center gap-2">
        <UInput
          v-model.trim="q"
          type="search"
          placeholder="Buscar…"
          icon="i-heroicons-magnifying-glass-20-solid"
          class="w-64"
        />
        <UButton v-if="q" variant="ghost" color="gray" @click="clearQ">Limpiar</UButton>
        <UButton color="primary" @click="openCreate = true">
          Nueva
        </UButton>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="grid gap-3">
      <div v-for="i in 6" :key="i" class="rounded-2xl border border-default p-4">
        <div class="flex gap-3">
          <USkeleton class="h-20 w-14 rounded-lg" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-5 w-2/3" />
            <USkeleton class="h-4 w-1/2" />
            <div class="flex gap-2 pt-2">
              <USkeleton class="h-7 w-20" />
              <USkeleton class="h-7 w-20" />
              <USkeleton class="h-7 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <UAlert
      v-else-if="error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudo cargar la lista"
    />

    <!-- Listado -->
    <div v-else class="grid gap-3">
      <div
        v-for="m in filtered"
        :key="m.id"
        class="rounded-2xl border border-default bg-default p-4 flex gap-3"
      >
        <img
          :src="m.poster || '/favicon.ico'"
          class="h-20 w-14 rounded-lg object-cover border border-default/60"
        />
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold">{{ m.titulo }}</h3>
          <p class="text-xs text-muted">
            {{ m.clasificacion || "—" }} · {{ m.duracion ? m.duracion + " min" : "—" }}
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <UButton
              :to="`/admin/movies/${m._id}/showtimes`"
              size="xs"
              variant="outline"
              color="primary"
            >
              Funciones
            </UButton>

            <UButton
              size="xs"
              variant="outline"
              color="gray"
              @click="startEdit(m)"
            >
              Editar
            </UButton>

            <UButton
              size="xs"
              :variant="m.activo ? 'solid' : 'outline'"
              :color="m.activo ? 'primary' : 'gray'"
              @click="toggleActivo(m)"
            >
              {{ m.activo ? "Activo" : "Inactivo" }}
            </UButton>

            <UButton
              size="xs"
              variant="ghost"
              color="gray"
              @click="del(m)"
              icon="i-heroicons-trash"
              title="Eliminar"
            />
          </div>
        </div>
      </div>

      <div v-if="(list?.items?.length || 0) === 0" class="text-muted">
        No hay resultados.
      </div>
    </div>

    <!-- Crear (UModal v4) -->
    <UModal
      v-model:open="openCreate"
      title="🎬 Nueva película"
      description="Completa la información para registrar una nueva película."
    >
      <template #body>
        <form @submit.prevent="create" class="space-y-3">
          <UInput v-model.trim="form.titulo" placeholder="Título" />
          <UInput v-model.trim="form.poster" placeholder="URL del poster" />
          <div class="grid grid-cols-2 gap-3">
            <UInput v-model.trim="form.clasificacion" placeholder="Clasificación" />
            <UInput v-model.number="form.duracion" type="number" placeholder="Duración (min)" />
          </div>
          <UTextarea v-model.trim="form.sinopsis" placeholder="Sinopsis" :rows="4" />
        </form>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            variant="subtle"
            color="neutral"
            @click="openCreate = false"
          />
          <UButton
            label="Crear"
            color="primary"
            @click="create"
          />
        </div>
      </template>
    </UModal>

    <!-- Editar (UModal v4) -->
    <UModal
      v-model:open="openEdit"
      title="✏️ Editar película"
      description="Modifica los datos de la película seleccionada."
    >
      <template #body>
        <form @submit.prevent="saveEdit" class="space-y-3">
          <UInput v-model.trim="form.titulo" placeholder="Título" />
          <UInput v-model.trim="form.poster" placeholder="URL del poster" />
          <div class="grid grid-cols-2 gap-3">
            <UInput v-model.trim="form.clasificacion" placeholder="Clasificación" />
            <UInput v-model.number="form.duracion" type="number" placeholder="Duración (min)" />
          </div>
          <UTextarea v-model.trim="form.sinopsis" placeholder="Sinopsis" :rows="4" />

          <label class="inline-flex items-center gap-2 text-sm pt-1">
            <UCheckbox v-model="form.activo" /> Activo en cartelera
          </label>
        </form>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            variant="subtle"
            color="neutral"
            @click="openEdit = false"
          />
          <UButton
            label="Guardar"
            color="primary"
            @click="saveEdit"
          />
        </div>
      </template>
    </UModal>
  </section>
</template>
