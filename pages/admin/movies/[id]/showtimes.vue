<script setup lang="ts">
import { reactive, ref, computed, watchEffect } from 'vue'
import { useRoute, navigateTo } from '#imports'
import { useAdminShowtimes } from '~/composables/admin/useAdminShowtimes'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const route = useRoute()
const movieId = computed<string | null>(() => {
  const id = route.params.id
  return (typeof id === 'string' && id.trim()) ? id : null
})

const { list, loading, error, fetchShowtimes, createShowtime, removeShowtime, generateLayout } = useAdminShowtimes()

const form = reactive<{ fechaHora: string; sala: string; price: number }>({ fechaHora: '', sala: '', price: 0 })

const calendarOpen = ref(false)
const dateStr = ref('')
const timeStr = ref('')

watchEffect(async () => {
  if (!movieId.value) return
  await fetchShowtimes(movieId.value, { page: 1, pageSize: 50, upcoming: true })
})

watch(calendarOpen, (open) => {
  if (open && (!dateStr.value || !timeStr.value)) {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    dateStr.value = `${y}-${m}-${d}`
    timeStr.value = `${hh}:${mm}`
  }
})

const fechaHoraLabel = computed(() => {
  if (!form.fechaHora) return ''
  const d = new Date(form.fechaHora)
  return isNaN(+d) ? '' : d.toLocaleString('es-CO')
})

function applyDateTime() {
  if (!dateStr.value || !timeStr.value) return
  form.fechaHora = `${dateStr.value}T${timeStr.value}`
  calendarOpen.value = false
}

const fmtDateTime = (iso?: string) => iso ? new Date(iso).toLocaleString('es-CO') : '—'
const fmtMoney = (n?: number) => (typeof n === 'number' ? n : 0).toLocaleString('es-CO')

const AUTO_GO_TO_LAYOUT = true
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
  dateStr.value = ''
  timeStr.value = ''

  if (created?._id) {
    if (AUTO_GO_TO_LAYOUT) navigateTo(`/admin/showtimes/${created._id}/layout`)
    else await generateLayout(created._id)
  }
}

async function del(id: string) {
  if (!movieId.value) return
  await removeShowtime(id)
  await fetchShowtimes(movieId.value, { page: 1, pageSize: 50, upcoming: true })
}
</script>

<template>
  <UContainer class="py-6 space-y-5">
    <PageHeader title="Funciones" subtitle="Crea funciones y configura el layout de sillas.">
      <template #actions>
        <UButton to="/admin/movies" variant="outline" color="neutral" size="sm">← Volver</UButton>
      </template>
    </PageHeader>

    <UAlert
      v-if="!movieId"
      color="neutral"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Falta movieId"
      description="Entra desde /admin/movies → 'Funciones'."
    />

    <template v-else>
      <!-- Crear -->
      <UCard class="p-4">
        <form @submit.prevent="create" class="grid gap-3 md:grid-cols-4">
          <UPopover v-model:open="calendarOpen">
            <UButton
              block
              variant="outline"
              color="neutral"
              class="justify-start"
              icon="i-heroicons-calendar-days-20-solid"
              :aria-label="fechaHoraLabel || 'Fecha y hora…'"
            >
              <span class="truncate">{{ fechaHoraLabel || 'Fecha y hora…' }}</span>
            </UButton>
            <template #content>
              <div class="p-3 w-72 space-y-3">
                <UInput v-model="dateStr" type="date" />
                <UInput v-model="timeStr" type="time" />
                <div class="flex justify-end gap-2 pt-1">
                  <UButton label="Cancelar" variant="subtle" color="neutral" @click="calendarOpen = false" />
                  <UButton label="Aceptar" color="primary" @click="applyDateTime" />
                </div>
              </div>
            </template>
          </UPopover>

          <UInput v-model.trim="form.sala" placeholder="Sala" />
          <UInput v-model.number="form.price" type="number" min="0" placeholder="Precio" />
          <UButton type="submit" color="primary">Crear función</UButton>
        </form>
      </UCard>

      <!-- Estado -->
      <div v-if="loading" class="grid gap-3">
        <div v-for="i in 4" :key="i" class="rounded-2xl border border-default p-4">
          <div class="flex items-center justify-between">
            <div class="space-y-2 w-1/2">
              <USkeleton class="h-5 w-3/4" />
              <USkeleton class="h-4 w-1/2" />
            </div>
            <div class="flex gap-2">
              <USkeleton class="h-8 w-24" />
              <USkeleton class="h-8 w-24" />
              <USkeleton class="h-8 w-24" />
            </div>
          </div>
        </div>
      </div>

      <UAlert
        v-else-if="error"
        color="neutral"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        :description="error"
        title="No se pudo cargar las funciones"
      />

      <!-- Lista -->
      <div v-else class="grid gap-3">
        <ItemCard
          v-for="s in list"
          :key="s._id"
          class="p-4 flex items-center justify-between"
        >
          <div>
            <p class="font-semibold">{{ fmtDateTime(s.fechaHora) }}</p>
            <p class="text-sm text-muted">Sala {{ s.sala || '—' }} · $ {{ fmtMoney(s.price) }}</p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              :to="`/admin/showtimes/${s._id}/layout`"
              size="sm"
              variant="outline"
              color="primary"
              title="Configurar layout de sillas"
            >
              Configurar layout
            </UButton>

            <UButton
              :to="`/showtimes/${s._id}`"
              size="sm"
              variant="outline"
              color="neutral"
            >
              Ver público
            </UButton>

            <UButton
              size="sm"
              variant="ghost"
              color="neutral"
              @click="generateLayout(s._id)"
            >
              Regenerar layout
            </UButton>

            <UButton
              size="sm"
              variant="ghost"
              color="neutral"
              @click="del(s._id)"
              icon="i-heroicons-trash"
              title="Eliminar"
            />
          </div>
        </ItemCard>

        <EmptyState v-if="(list?.length || 0) === 0" description="Sin funciones aún." />
      </div>
    </template>
  </UContainer>
</template>
