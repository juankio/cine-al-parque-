<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <UIcon name="i-heroicons-fire" class="text-primary" /> Combos para hoy
      </h2>
      <UButton v-if="!loading" size="sm" variant="ghost" color="neutral" @click="emit('refresh')">Actualizar</UButton>
    </div>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="i in 6" :key="i" class="h-32 w-full rounded-xl animate-pulse" />
    </div>

    <div v-else-if="error" class="space-y-2">
      <UAlert color="error" variant="soft" icon="i-heroicons-exclamation-triangle" :description="error" title="Error" />
      <UButton size="sm" color="primary" variant="soft" @click="emit('refresh')">Reintentar</UButton>
    </div>

    <div v-else-if="combos.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="c in combos" :key="c._id"
        class="combo-card flex flex-col h-full rounded-xl border border-border bg-background transition-all hover:shadow-md hover:border-primary/50 opacity-0 group overflow-hidden"
      >
        <div class="relative z-10 flex flex-col h-full gap-3 p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5" /> Recomendado
              </div>
              <h3 class="font-semibold text-base truncate">{{ c.nombre }}</h3>
            </div>
            <div class="text-right shrink-0">
              <p class="text-[10px] uppercase text-muted-foreground font-semibold">Desde</p>
              <p class="text-lg font-bold">$ {{ (c.precio || 0).toLocaleString('es-CO') }}</p>
            </div>
          </div>

          <p v-if="c.descripcion" class="text-sm text-muted-foreground line-clamp-2">{{ c.descripcion }}</p>

          <div class="flex flex-wrap gap-1.5 mt-auto pt-2 text-xs">
            <UBadge v-if="c.categoria" size="sm" variant="subtle" color="primary" class="capitalize font-medium">{{ c.categoria }}</UBadge>
            <span v-for="t in c.tags" :key="t" class="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground bg-secondary/50">
              #{{ t }}
            </span>
          </div>
          
          <div class="pt-3 border-t border-border mt-2 flex items-center justify-between">
            <span class="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" /> Listo rápido
            </span>
            <UButton size="sm" to="/menu" variant="soft" trailing-icon="i-heroicons-arrow-right">Menú</UButton>
          </div>
        </div>
      </UCard>
    </div>

    <EmptyState v-else description="Aún no hay combos." />
  </section>
</template>

<script setup lang="ts">
import { animate, createTimeline, stagger, random } from 'animejs';
import { onMounted, watch } from 'vue'

const props = defineProps<{
  loading: boolean, error: string | null, combos: { _id: string, nombre: string, precio: number, categoria?: string, tags?: string[], descripcion?: string }[]
}>()

const emit = defineEmits<{ (e: 'refresh'): void }>()
const isClient = typeof window !== 'undefined'

const animateCards = () => {
  if (isClient) {
    animate('.combo-card', { opacity: [0, 1], scale: [0.95, 1], delay: stagger(100), duration: 600, ease: 'outBack' })
    }
}

onMounted(() => { if (!props.loading && props.combos.length) animateCards() })
watch(() => props.loading, (n) => { if (!n && props.combos.length) setTimeout(animateCards, 50) })
</script>

