<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

// Composables
const { list, loading, error, fetchShowtimes, createShowtime, removeShowtime, generateLayout } = useAdminShowtimes()

// Form crear función
const form = reactive<{ movieId: string | null; fechaHora: string; sala: string; price: number }>({
  movieId: null,
  fechaHora: '',
  sala: '',
  price: 0
})

// cargar próximas funciones
onMounted(() => {
  fetchShowtimes('', { page: 1, pageSize: 50, upcoming: true })
})

const creating = ref(false)
const openDelete = ref(false)
const deleteId = ref<string | null>(null)

function askDelete(id: string) {
  deleteId.value = id
  openDelete.value = true
}

async function onCreate() {
  if (!form.movieId || !form.fechaHora || !form.sala || !form.price) return
  creating.value = true
  try {
    const created = await createShowtime({
      movieId: form.movieId,
      fechaHora: new Date(form.fechaHora).toISOString(),
      sala: form.sala,
      price: form.price
    })
    // reset
    Object.assign(form, { movieId: null, fechaHora: '', sala: '', price: 0 })
    // refrescar lista
    await fetchShowtimes('', { page: 1, pageSize: 50, upcoming: true })
    // opcional: generar layout inicial
    if (created?._id) await generateLayout(created._id)
  } finally {
    creating.value = false
  }
}

async function onDelete() {
  if (!deleteId.value) return
  await removeShowtime(deleteId.value)
  deleteId.value = null
  await fetchShowtimes('', { page: 1, pageSize: 50, upcoming: true })
}

const fmtDateTime = (iso?: string) => iso ? new Date(iso).toLocaleString('es-CO') : '—'
const fmtMoney = (n?: number) => (typeof n === 'number' ? n : 0).toLocaleString('es-CO')
</script>

<template>
  <UContainer class="py-6 space-y-6">
    <PageHeader
      title="Funciones"
      subtitle="Crea funciones y configura el layout de sillas."
    >
      <template #actions>
        <UButton to="/admin/movies" variant="outline" color="gray" size="sm">← Volver a Películas</UButton>
      </template>
    </PageHeader>

    <!-- Crear función -->
    <UCard class="p-4">
      <form class="grid gap-3 md:grid-cols-5 items-end" @submit.prevent="onCreate">
        <!-- Película -->
        <UFormGroup label="Película" class="md:col-span-2">
          <!-- Tu componente existente -->
          <AdminMovieSelect v-model="form.movieId" />
        </UFormGroup>

        <!-- Fecha/hora -->
        <UFormGroup label="Fecha y hora">
          <FieldDateTime v-model="form.fechaHora" />
        </UFormGroup>

        <!-- Sala -->
        <UFormGroup label="Sala">
          <UInput v-model.trim="form.sala" placeholder="Sala" />
        </UFormGroup>

        <!-- Precio -->
        <UFormGroup label="Precio">
          <UInput v-model.number="form.price" type="number" min="0" placeholder="0" />
        </UFormGroup>

        <div class="md:col-span-5 flex justify-end">
          <UButton type="submit" color="primary" :loading="creating">
            Crear función
          </UButton>
        </div>
      </form>
    </UCard>

    <!-- Estado -->
    <LoadingSkeleton v-if="loading" :rows="3" />
    <UAlert
      v-else-if="error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudieron cargar las funciones"
    />

    <!-- Lista -->
    <AdminList
      v-else
      :items="list"
      empty-description="Sin funciones aún."
    >
      <template #item="{ item: s }">
        <ItemCard>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="font-semibold">{{ fmtDateTime(s.fechaHora) }}</p>
              <p class="text-sm text-muted">
                Sala {{ s.sala || '—' }} · $ {{ fmtMoney(s.price) }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                :to="`/admin/showtimes/${s._id}/layout`"
                variant="outline"
                color="primary"
                size="sm"
                title="Configurar layout de sillas"
              >
                Configurar layout
              </UButton>

              <UButton
                :to="`/showtimes/${s._id}`"
                variant="outline"
                color="gray"
                size="sm"
              >
                Ver público
              </UButton>

              <UButton
                variant="soft"
                color="gray"
                size="sm"
                @click="askDelete(s._id)"
                icon="i-heroicons-trash"
                title="Eliminar"
              />
            </div>
          </div>
        </ItemCard>
      </template>
    </AdminList>

    <!-- Confirm delete -->
    <ConfirmModal
      v-model:open="openDelete"
      title="¿Eliminar función?"
      description="Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      @confirm="onDelete"
    />
  </UContainer>
</template>
