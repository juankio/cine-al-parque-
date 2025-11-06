<template>
  <section>
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-bolt" class="text-primary" /> En vivo hoy
      </h2>
      <UButton
        v-if="hasSections"
        size="xs"
        variant="ghost"
        color="gray"
        :loading="props.loading"
        @click="emit('refresh')"
      >Actualizar</UButton>
    </div>

    <div v-if="props.loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="i in 6" :key="i" class="h-20 rounded-xl" />
    </div>

    <UAlert
      v-else-if="props.error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="props.error"
      title="No se pudieron cargar las funciones"
    />

    <div v-else-if="hasSections" class="space-y-5">
      <div v-for="section in props.sections" :key="section.id" class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">{{ section.label }}</h3>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <UCard v-for="s in section.items" :key="s._id" class="rounded-2xl">
            <div class="flex gap-3 items-start">
              <img :src="s.poster || '/favicon.ico'" class="w-14 h-20 object-cover rounded-lg border border-default/60" />
              <div class="min-w-0 flex-1">
                <div class="font-medium truncate">{{ s.titulo || 'Sin titulo' }}</div>
                <div class="text-xs text-muted mt-0.5">
                  {{ fmtTime(s.fechaHora) }} - Sala {{ s.sala || '-' }} - $ {{ money(s.price) }}
                </div>
                <div class="mt-2">
                  <UButton
                    :to="`/showtimes/${s._id}`"
                    size="xs"
                    color="primary"
                    variant="solid"
                  >Reservar</UButton>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <EmptyState v-else description="No hay funciones proximas en las proximas 48 horas." />
  </section>
</template>

<script setup lang="ts">
import type { PublicShowtime } from '~/composables/useShowtimes'

interface LiveSection {
  id: string
  label: string
  items: PublicShowtime[]
}

const props = defineProps<{
  loading: boolean
  error: string | null
  sections: LiveSection[]
}>()

const emit = defineEmits<{
  (event: 'refresh'): void
}>()

const hasSections = computed(() => props.sections.length > 0)

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function money(n?: number) {
  return (Number(n || 0)).toLocaleString('es-CO')
}
</script>

