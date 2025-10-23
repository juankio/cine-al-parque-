<script setup lang="ts">
import { reactive, ref, computed, onMounted, watchEffect, watch } from 'vue'
import { useRoute, navigateTo } from '#imports'
import { useAdminShowtimes } from '~/composables/admin/useAdminShowtimes'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const route = useRoute()
const movieId = computed<string | null>(() => {
  const id = route.params.id
  return (typeof id === 'string' && id.trim()) ? id : null
})

const { list, loading, error, fetchShowtimes, createShowtime, removeShowtime, generateLayout } = useAdminShowtimes()

// ---- Form principal
const form = reactive<{ fechaHora: string; sala: string; price: number }>({
  fechaHora: '',
  sala: '',
  price: 0
})

// ---- Picker elegante (popover + date+time) — sin UCalendar
const calendarOpen = ref(false)
const dateStr = ref('')   // YYYY-MM-DD
const timeStr = ref('')   // HH:mm

// Inicializa cuando abres por primera vez
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

// Label amigable para mostrar en el botón
const fechaHoraLabel = computed(() => {
  if (!form.fechaHora) return ''
  const d = new Date(form.fechaHora)
  return isNaN(+d) ? '' : d.toLocaleString()
})

// Aplica YYYY-MM-DD + HH:mm → form.fechaHora
function applyDateTime() {
  if (!dateStr.value || !timeStr.value) return
  form.fechaHora = `${dateStr.value}T${timeStr.value}`
  calendarOpen.value = false
}

// ---- Carga de funciones
watchEffect(async () => {
  if (!movieId.value) return
  await fetchShowtimes(movieId.value, { page: 1, pageSize: 50, upcoming: true })
})

// Helpers display
const fmtDateTime = (iso?: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(+d) ? '—' : d.toLocaleString()
}
const fmtMoney = (n?: number) => typeof n === 'number' ? n.toLocaleString('es-CO') : '0'

// Crear → agrega y (opcional) navega al editor de layout
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
    if (AUTO_GO_TO_LAYOUT) {
      await navigateTo(`/admin/showtimes/${created._id}/layout`)
    } else {
      await generateLayout(created._id)
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
  <section class="space-y-5">
    <!-- Header -->
    <header class="flex items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Funciones</h1>
        <p class="text-sm text-muted">Crea funciones y configura el layout de sillas.</p>
      </div>

      <UButton to="/admin/movies" variant="outline" color="gray" size="sm">
        ← Volver
      </UButton>
    </header>

    <!-- Falta movieId -->
    <UAlert
      v-if="!movieId"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Falta movieId"
      description="Entra desde /admin/movies → 'Funciones'."
    />

    <template v-else>
      <!-- Form crear -->
      <div class="rounded-2xl border border-default bg-default p-4">
        <form @submit.prevent="create" class="grid gap-3 md:grid-cols-4">
          <!-- Fecha y hora (popover con inputs bonitos) -->
          <UPopover v-model:open="calendarOpen">
            <UButton
              block
              variant="outline"
              color="gray"
              class="justify-start"
              icon="i-heroicons-calendar-days-20-solid"
              :aria-label="fechaHoraLabel || 'Fecha y hora…'"
            >
              <span class="truncate">
                {{ fechaHoraLabel || 'Fecha y hora…' }}
              </span>
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
          <UButton type="submit" color="primary">
            Crear función
          </UButton>
        </form>
      </div>

      <!-- Loading -->
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

      <!-- Error -->
      <UAlert
        v-else-if="error"
        color="gray"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        :description="error"
        title="No se pudo cargar las funciones"
      />

      <!-- Lista -->
      <div v-else class="grid gap-3">
        <div
          v-for="s in list"
          :key="s._id"
          class="rounded-2xl border border-default bg-default p-4 flex items-center justify-between"
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
              color="gray"
            >
              Ver layout (público)
            </UButton>

            <UButton
              size="sm"
              variant="ghost"
              color="gray"
              @click="generateLayout(s._id)"
            >
              Regenerar layout
            </UButton>

            <UButton
              size="sm"
              variant="ghost"
              color="gray"
              @click="del(s._id)"
              icon="i-heroicons-trash"
              title="Eliminar"
            />
          </div>
        </div>

        <div v-if="(list?.length || 0) === 0" class="text-muted">
          Sin funciones aún.
        </div>
      </div>
    </template>
  </section>
</template>
