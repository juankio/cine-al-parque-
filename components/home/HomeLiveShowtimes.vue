<template>
  <section class="space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
        <UIcon name="i-heroicons-bolt" class="text-primary w-8 h-8" /> En vivo hoy
      </h2>
      <UButton
        v-if="hasSections"
        size="sm"
        variant="ghost"
        color="neutral"
        :loading="props.loading"
        @click="emit('refresh')"
        class="hover:bg-primary/10 hover:text-primary transition-colors font-medium"
      >
        Actualizar
      </UButton>
    </div>

    <div v-if="props.loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="animate-pulse">
        <USkeleton class="h-32 w-full rounded-2xl" />
      </div>
    </div>

    <EmptyState
      v-else-if="props.error"
      is-error
      title="Estado del Sistema: Fuera de Línea"
      :description="props.error"
    >
      <template #actions>
        <UButton color="primary" variant="soft" icon="i-heroicons-arrow-path" @click="emit('refresh')">Reintentar conexión</UButton>
      </template>
    </EmptyState>

    <div v-else-if="hasSections" class="space-y-10">
      <div
        v-for="section in props.sections"
        :key="section.id"
        class="space-y-5"
      >
        <div class="flex items-center gap-3">
          <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{{ section.label }}</h3>
          <div class="h-px flex-1 bg-border/50"></div>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="s in section.items"
            :key="s._id"
            class="live-card h-full rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 opacity-0 group"
            :ui="{ body: { padding: 'p-5' } }"
          >
            <div class="flex gap-5 items-start">
              <div class="relative w-24 h-32 shrink-0 rounded-xl border border-border/50 overflow-hidden bg-muted group-hover:shadow-lg transition-all duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img :src="s.poster || '/favicon.ico'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div class="flex flex-col flex-1 h-full min-w-0 py-1">
                <div class="font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">{{ s.titulo || 'Sin título' }}</div>
                <div class="text-sm text-muted-foreground mt-2 space-y-1.5 font-medium">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-clock" class="w-4 h-4 opacity-70" />
                    {{ fmtTime(s.fechaHora) }}
                  </div>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4 opacity-70" />
                    Sala {{ s.sala || '-' }}
                  </div>
                  <div class="flex items-center gap-2 text-primary font-bold">
                    <UIcon name="i-heroicons-banknotes" class="w-4 h-4" />
                    $ {{ money(s.price) }}
                  </div>
                </div>
                <div class="mt-auto pt-4">
                  <UButton
                    :to="`/showtimes/${s._id}`"
                    class="w-full justify-center rounded-xl font-bold tracking-wide"
                    size="md"
                    color="primary"
                    variant="soft"
                  >
                    Reservar ahora
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <EmptyState v-else description="No hay funciones programadas en las próximas 48 horas." />
  </section>
</template>

<script setup lang="ts">
import { animate, stagger } from 'animejs'
import { onMounted, watch, computed } from 'vue'

const props = defineProps<{
  loading: boolean
  error: string | null
  sections: { id: string, label: string, items: any[] }[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const isClient = typeof window !== 'undefined'
const hasSections = computed(() => props.sections && props.sections.length > 0)

const fmtTime = (dateStr: string) => {
  if (!dateStr) return '--:--'
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const money = (val?: number) => {
  return (val || 0).toLocaleString('es-CO')
}

const animateShowtimes = () => {
  if (isClient) {
    animate('.live-card', {
      opacity: [0, 1],
      translateX: [-20, 0],
      duration: 800,
      delay: stagger(100),
      ease: 'outQuart'
    })
  }
}

onMounted(() => {
  if (!props.loading && props.sections.length) animateShowtimes()
})

watch(() => props.loading, (n) => {
  if (!n && props.sections.length) setTimeout(animateShowtimes, 50)
})
</script>
