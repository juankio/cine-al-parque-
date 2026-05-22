<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <UIcon name="i-heroicons-bolt" class="text-primary" /> En vivo hoy
      </h2>
      <UButton
        v-if="hasSections"
        size="sm"
        variant="ghost"
        color="neutral"
        :loading="props.loading"
        @click="emit('refresh')"
      >
        Actualizar
      </UButton>
    </div>

    <div v-if="props.loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="animate-pulse">
        <USkeleton class="h-28 w-full rounded-xl" />
      </div>
    </div>

    <UAlert
      v-else-if="props.error"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="props.error"
      title="No se pudieron cargar las funciones"
    />

    <div v-else-if="hasSections" class="space-y-8">
      <div
        v-for="section in props.sections"
        :key="section.id"
        class="space-y-4"
      >
        <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{{ section.label }}</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="s in section.items"
            :key="s._id"
            class="live-card h-full rounded-xl border border-border bg-background transition-all hover:shadow-md hover:border-primary/50 opacity-0"
            :ui="{ body: { padding: 'p-4' } }"
          >
            <div class="flex gap-4 items-start">
              <img :src="s.poster || '/favicon.ico'" class="w-20 h-28 object-cover rounded-lg border border-border" />
              <div class="flex flex-col flex-1 h-full min-w-0">
                <div class="font-medium text-base truncate">{{ s.titulo || 'Sin título' }}</div>
                <div class="text-sm text-muted-foreground mt-1 space-y-0.5">
                  <div class="flex items-center gap-1">
                    <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
                    {{ fmtTime(s.fechaHora) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />
                    Sala {{ s.sala || '-' }}
                  </div>
                  <div class="flex items-center gap-1 font-medium text-primary">
                    <UIcon name="i-heroicons-banknotes" class="w-3.5 h-3.5" />
                    $ {{ money(s.price) }}
                  </div>
                </div>
                <div class="mt-auto pt-3">
                  <UButton
                    :to="`/showtimes/${s._id}`"
                    class="w-full justify-center"
                    size="sm"
                    color="primary"
                    variant="soft"
                  >
                    Reservar
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <EmptyState v-else description="No hay funciones próximas en las próximas 48 horas." />
  </section>
</template>

<script setup lang="ts">
import type { PublicShowtime } from '~/composables/useShowtimes'
import { computed, onMounted, watch } from 'vue'
import anime from 'animejs'

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

const animateCards = () => {
  anime({
    targets: '.live-card',
    opacity: [0, 1],
    translateX: [-15, 0],
    delay: anime.stagger(80),
    duration: 600,
    easing: 'easeOutCubic'
  })
}

onMounted(() => {
  if (!props.loading && hasSections.value) {
    animateCards()
  }
})

watch(() => props.loading, (newLoading) => {
  if (!newLoading && hasSections.value) {
    setTimeout(animateCards, 50)
  }
})

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function money(n?: number) {
  return (Number(n || 0)).toLocaleString('es-CO')
}
</script>

