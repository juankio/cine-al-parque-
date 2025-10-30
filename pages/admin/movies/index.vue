<script setup lang="ts">
import AdminMovieForm from '~/components/boss/shared/AdminFormMovie.vue'
import { useAdminMovies, type AdminMovie } from '~/composables/admin/useAdminMovies'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const {
  list,
  loading,
  error,
  fetchMovies,
  createMovie,
  updateMovie,
  removeMovie
} = useAdminMovies()

// ---------- estado UI ----------
const q = ref('')
const slideOpen = ref(false)
const isEditing = ref(false)
const currentId = ref<string | null>(null)
const confirmDeleteOpen = ref(false)
const toDeleteId = ref<string | null>(null)
const saving = ref(false)

// ---------- form reactivo ----------
const form = reactive<Partial<AdminMovie>>({
  titulo: '',
  poster: '',
  clasificacion: '',
  duracion: undefined,
  sinopsis: '',
  activo: true
})

// helpers
function resetForm() {
  Object.assign(form, {
    titulo: '',
    poster: '',
    clasificacion: '',
    duracion: undefined,
    sinopsis: '',
    activo: true
  })
}

function hydrateFromMovie(m: AdminMovie) {
  Object.assign(form, {
    titulo: m.titulo || '',
    poster: m.poster || '',
    clasificacion: m.clasificacion || '',
    duracion: m.duracion,
    sinopsis: m.sinopsis || '',
    activo: !!m.activo
  })
}

// ---------- lifecycle ----------
onMounted(() => {
  fetchMovies(1, 50)
})

// ---------- computed ----------
const items = computed(() => list.value?.items ?? [])

const filtered = computed(() => {
  const term = q.value.toLowerCase().trim()
  if (!term) return items.value
  return items.value.filter(i =>
    i.titulo?.toLowerCase().includes(term)
  )
})

const fmt = {
  mins: (n?: number) => (n ? `${n} min` : '—')
}

// ---------- acciones ----------
function clearQ() {
  q.value = ''
}

function startCreate() {
  isEditing.value = false
  currentId.value = null
  resetForm()
  slideOpen.value = true
}

function startEdit(m: AdminMovie) {
  isEditing.value = true
  currentId.value = m._id
  resetForm()
  hydrateFromMovie(m)
  slideOpen.value = true
}

async function saveMovie() {
  // validación mínima
  if (!form.titulo?.trim()) {
    alert('El título es obligatorio')
    return
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

async function toggleActivo(m: AdminMovie) {
  await updateMovie(m._id, { activo: !m.activo })
  await fetchMovies(1, 50)
}

function askDelete(m: AdminMovie) {
  toDeleteId.value = m._id
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
    <!-- HEADER -->
    <PageHeader
      title="Películas"
      subtitle="Activa/desactiva para mostrar en cartelera."
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <UInput
            v-model.trim="q"
            type="search"
            placeholder="Buscar…"
            icon="i-heroicons-magnifying-glass-20-solid"
            class="w-64"
          />
          <UButton
            v-if="q"
            variant="ghost"
            color="gray"
            @click="clearQ"
          >
            Limpiar
          </UButton>
          <UButton color="primary" @click="startCreate">
            Nueva
          </UButton>
        </div>
      </template>
    </PageHeader>

    <!-- LOADING STATE -->
    <div v-if="loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="i in 6"
        :key="i"
        class="rounded-2xl border border-default p-4"
      >
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
      </UCard>
    </div>

    <!-- ERROR STATE -->
    <UAlert
      v-else-if="error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudo cargar la lista"
    />

    <!-- LISTA -->
    <div
      v-else
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <UCard
        v-for="m in filtered"
        :key="m._id"
        class="group rounded-2xl border border-default/60 cursor-pointer transition hover:bg-primary/5 hover:ring-1 hover:ring-primary/30"
        @click="startEdit(m)"
      >
        <div class="flex gap-3">
          <!-- Poster -->
          <img
            :src="m.poster || '/favicon.ico'"
            class="h-24 w-16 rounded-lg object-cover border border-default/60 bg-neutral-100 dark:bg-neutral-800 flex-shrink-0"
          />

          <!-- Info -->
          <div class="min-w-0 flex-1 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="font-semibold truncate text-gray-900 dark:text-gray-100">
                  {{ m.titulo }}
                </div>
                <p class="text-xs text-muted">
                  {{ m.clasificacion || '—' }} · {{ fmt.mins(m.duracion) }}
                </p>
              </div>

              <!-- Estado -->
              <UBadge
                :color="m.activo ? 'green' : 'gray'"
                size="xs"
                variant="soft"
                class="shrink-0"
                @click.stop="toggleActivo(m)"
              >
                {{ m.activo ? 'Activo' : 'Inactivo' }}
              </UBadge>
            </div>

            <!-- Botones -->
            <div class="flex flex-wrap gap-2">
              <UButton
                :to="`/admin/movies/${m._id}/showtimes`"
                size="xs"
                variant="outline"
                color="primary"
                @click.stop
              >
                Funciones
              </UButton>

              <UButton
                size="xs"
                variant="outline"
                color="gray"
                @click.stop="startEdit(m)"
              >
                Editar
              </UButton>

              <UButton
                size="xs"
                variant="ghost"
                color="gray"
                icon="i-heroicons-trash"
                @click.stop="askDelete(m)"
                aria-label="Eliminar"
              />
            </div>
          </div>
        </div>
      </UCard>

      <EmptyState
        v-if="(items?.length || 0) === 0"
        description="No hay resultados."
      />
    </div>

    <!-- SLIDEOVER CREAR / EDITAR -->
    <USlideover v-model:open="slideOpen">
      <!-- HEADER -->
      <template #title>
        {{ isEditing ? 'Editar película' : 'Nueva película' }}
      </template>

      <template #description>
        Completa la información para
        {{ isEditing ? 'actualizar la película.' : 'registrar una nueva película.' }}
      </template>

      <!-- BODY -->
      <template #body>
        <div class="p-6 space-y-6">
          <AdminMovieForm v-model="form" />
        </div>
      </template>

      <!-- FOOTER -->
      <template #footer>
        <div class="flex items-center justify-between w-full">
          <div class="text-xs text-gray-500 truncate">
            {{ isEditing ? 'Editando:' : 'Creando:' }}
            <b>{{ form.titulo || '(sin título)' }}</b>
          </div>

          <div class="flex gap-2">
            <UButton
              variant="ghost"
              @click="slideOpen = false"
            >
              Cancelar
            </UButton>

            <UButton
              color="primary"
              :loading="saving"
              @click="saveMovie"
            >
              {{ isEditing ? 'Guardar cambios' : 'Crear' }}
            </UButton>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- CONFIRMAR ELIMINAR -->
    <ConfirmModal
      v-model:open="confirmDeleteOpen"
      title="¿Eliminar película?"
      description="Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      @confirm="doDelete"
    />
  </UContainer>
</template>
