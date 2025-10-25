<script setup lang="ts">
import AdminMovieForm from '~/components/boss/shared/AdminFormMovie.vue'
import { useAdminMovies, type AdminMovie } from '~/composables/admin/useAdminMovies'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const { list, loading, error, fetchMovies, createMovie, updateMovie, removeMovie } = useAdminMovies()

const q = ref('')
const openCreate = ref(false)
const openEdit = ref(false)
const openDelete = ref(false)
const currentId = ref<string | null>(null)
const toDeleteId = ref<string | null>(null)

const form = reactive<Partial<AdminMovie>>({
  titulo: '',
  poster: '',
  clasificacion: '',
  duracion: undefined,
  sinopsis: '',
  activo: true
})

onMounted(() => fetchMovies(1, 50))

const items = computed(() => list.value?.items ?? [])
const filtered = computed(() => {
  const term = q.value.toLowerCase()
  return term ? items.value.filter(i => i.titulo?.toLowerCase().includes(term)) : items.value
})

function clearQ() { q.value = '' }

function startCreate() {
  Object.assign(form, { titulo: '', poster: '', clasificacion: '', duracion: undefined, sinopsis: '', activo: true })
  openCreate.value = true
}

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

function askDelete(m: AdminMovie) {
  toDeleteId.value = m._id
  openDelete.value = true
}

async function doDelete() {
  if (!toDeleteId.value) return
  await removeMovie(toDeleteId.value)
  toDeleteId.value = null
  await fetchMovies(1, 50)
}

const fmt = {
  mins: (n?: number) => (n ? `${n} min` : '—')
}
</script>

<template>
  <UContainer class="py-6 space-y-5">
    <!-- Header -->
    <PageHeader title="Películas" subtitle="Activa/desactiva para mostrar en cartelera.">
      <template #actions>
        <div class="flex items-center gap-2">
          <UInput
            v-model.trim="q"
            type="search"
            placeholder="Buscar…"
            icon="i-heroicons-magnifying-glass-20-solid"
            class="w-64"
          />
          <UButton v-if="q" variant="ghost" color="gray" @click="clearQ">Limpiar</UButton>
          <UButton color="primary" @click="startCreate">Nueva</UButton>
        </div>
      </template>
    </PageHeader>

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
      <ItemCard
        v-for="m in filtered"
        :key="m._id"
        class="p-4"
      >
        <div class="flex gap-3">
          <img
            :src="m.poster || '/favicon.ico'"
            class="h-20 w-14 rounded-lg object-cover border border-default/60"
          />
          <div class="min-w-0 flex-1">
            <h3 class="font-semibold truncate">{{ m.titulo }}</h3>
            <p class="text-xs text-muted">
              {{ m.clasificacion || '—' }} · {{ fmt.mins(m.duracion) }}
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
                {{ m.activo ? 'Activo' : 'Inactivo' }}
              </UButton>

              <UButton
                size="xs"
                variant="ghost"
                color="gray"
                @click="askDelete(m)"
                icon="i-heroicons-trash"
                title="Eliminar"
              />
            </div>
          </div>
        </div>
      </ItemCard>

      <EmptyState
        v-if="(items?.length || 0) === 0"
        description="No hay resultados."
      />
    </div>

    <!-- Crear -->
    <UModal
      v-model:open="openCreate"
      title="🎬 Nueva película"
      description="Completa la información para registrar una nueva película."
    >
      <template #body>
        <AdminMovieForm v-model="form" />
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="Cancelar" variant="subtle" color="neutral" @click="openCreate = false" />
          <UButton label="Crear" color="primary" @click="create" />
        </div>
      </template>
    </UModal>

    <!-- Editar -->
    <UModal
      v-model:open="openEdit"
      title="✏️ Editar película"
      description="Modifica los datos de la película seleccionada."
    >
      <template #body>
        <AdminMovieForm v-model="form" />
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="Cancelar" variant="subtle" color="neutral" @click="openEdit = false" />
          <UButton label="Guardar" color="primary" @click="saveEdit" />
        </div>
      </template>
    </UModal>

    <!-- Eliminar -->
    <ConfirmModal
      v-model:open="openDelete"
      title="¿Eliminar película?"
      description="Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      @confirm="doDelete"
    />
  </UContainer>
</template>
