<script setup lang="ts">
import AdminMovieForm from '~/components/boss/shared/AdminFormMovie.vue'
import AdminMoviesHeader from '~/components/boss/movies/AdminMoviesHeader.vue'
import AdminMoviesSkeleton from '~/components/boss/movies/AdminMoviesSkeleton.vue'
import AdminMoviesList from '~/components/boss/movies/AdminMoviesList.vue'
import { useAdminMovies, type AdminMovie } from '~/composables/admin/useAdminMovies'
definePageMeta({ layout: 'admin', middleware: ['admin'] })
const { list, loading, error, fetchMovies, createMovie, updateMovie, removeMovie } = useAdminMovies()
const q = ref(''), slideOpen = ref(false), isEditing = ref(false), currentId = ref<string | null>(null), confirmDeleteOpen = ref(false), toDeleteId = ref<string | null>(null), saving = ref(false)
const form = reactive<Partial<AdminMovie>>({
  titulo: '',
  poster: '',
  clasificacion: '',
  duracion: undefined,
  sinopsis: '',
  activo: true,
})
const resetForm = () =>
  Object.assign(form, {
    titulo: '',
    poster: '',
    clasificacion: '',
    duracion: undefined,
    sinopsis: '',
    activo: true,
  })
const hydrateFromMovie = (movie: AdminMovie) =>
  Object.assign(form, {
    titulo: movie.titulo || '',
    poster: movie.poster || '',
    clasificacion: movie.clasificacion || '',
    duracion: movie.duracion,
    sinopsis: movie.sinopsis || '',
    activo: !!movie.activo,
  })
onMounted(() => fetchMovies(1, 50))
const items = computed(() => list.value?.items ?? [])
const filtered = computed(() => {
  const term = q.value.toLowerCase().trim()
  return term ? items.value.filter(i => i.titulo?.toLowerCase().includes(term)) : items.value
})
function startCreate() {
  isEditing.value = false
  currentId.value = null
  resetForm()
  slideOpen.value = true
}
function startEdit(movie: AdminMovie) {
  isEditing.value = true
  currentId.value = movie._id
  resetForm()
  hydrateFromMovie(movie)
  slideOpen.value = true
}
async function saveMovie() {
  if (!form.titulo?.trim()) {
    return alert('El título es obligatorio')
  }
  saving.value = true
  try {
    if (isEditing.value && currentId.value) {
      await updateMovie(currentId.value, form)
    } else {
      await createMovie(form)
    }
    slideOpen.value = false
    await fetchMovies(1, 50)
  } catch (err) {
    console.error(err)
    alert('No se pudo guardar la película')
  } finally {
    saving.value = false
  }
}
async function toggleActivo(movie: AdminMovie) {
  await updateMovie(movie._id, { activo: !movie.activo })
  await fetchMovies(1, 50)
}
function askDelete(movie: AdminMovie) {
  toDeleteId.value = movie._id
  confirmDeleteOpen.value = true
}
async function doDelete() {
  if (!toDeleteId.value) return
  await removeMovie(toDeleteId.value)
  toDeleteId.value = null
  confirmDeleteOpen.value = false
  await fetchMovies(1, 50)
}
</script>
<template>
  <UContainer class="py-8 space-y-6">
    <AdminMoviesHeader
      v-model:query="q"
      @create="startCreate"
    />
    <AdminMoviesSkeleton v-if="loading" />
    <UAlert
      v-else-if="error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudo cargar la lista"
    />

    <AdminMoviesList
      v-else
      :movies="filtered"
      @edit="startEdit"
      @toggle="toggleActivo"
      @delete="askDelete"
    />
    <USlideover v-model:open="slideOpen">
      <template #title>
        {{ isEditing ? 'Editar película' : 'Nueva película' }}
      </template>
      <template #description>
        Completa la información para
        {{ isEditing ? 'actualizar la película.' : 'registrar una nueva película.' }}
      </template>
      <template #body>
        <div class="p-6 space-y-6">
          <AdminMovieForm v-model="form" />
        </div>
      </template>
      <template #footer>
        <div class="flex items-center justify-between w-full">
          <div class="text-xs text-gray-500 truncate">
            {{ isEditing ? 'Editando:' : 'Creando:' }}
            <b>{{ form.titulo || '(sin título)' }}</b>
          </div>
          <div class="flex gap-2">
            <UButton variant="ghost" @click="slideOpen = false">Cancelar</UButton>
            <UButton color="primary" :loading="saving" @click="saveMovie">
              {{ isEditing ? 'Guardar cambios' : 'Crear' }}
            </UButton>
          </div>
        </div>
      </template>
    </USlideover>

    <ConfirmModal
      v-model:open="confirmDeleteOpen"
      title="¿Eliminar película?"
      description="Esta acción no se puede deshacer."
      confirm-label="Eliminar"
      @confirm="doDelete"
    />
  </UContainer>
</template>

