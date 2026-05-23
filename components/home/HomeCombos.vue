<template>
  <section class="space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
        <UIcon name="i-heroicons-sparkles" class="text-primary w-8 h-8" /> Combos Destacados
      </h2>
      <UButton v-if="!loading" size="sm" variant="ghost" color="neutral" @click="emit('refresh')" class="hover:bg-primary/10 hover:text-primary transition-colors font-medium">Actualizar</UButton>
    </div>

    <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="i in 6" :key="i" class="h-36 w-full rounded-2xl animate-pulse" />
    </div>

    <EmptyState
      v-else-if="error"
      is-error
      title="Error de Conexión"
      :description="error"
    >
      <template #actions>
        <UButton color="primary" variant="soft" icon="i-heroicons-arrow-path" @click="emit('refresh')">Reintentar conexión</UButton>
      </template>
    </EmptyState>

    <div v-else-if="combos.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="c in combos" :key="c._id"
        class="combo-card flex flex-col h-full rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 opacity-0 group overflow-hidden"
        :ui="{ body: { padding: 'p-5' } }"
      >
        <div class="relative z-10 flex flex-col h-full gap-4">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                <UIcon name="i-heroicons-fire" class="w-4 h-4" /> Recomendado
              </div>
              <h3 class="font-bold text-lg truncate group-hover:text-primary transition-colors">{{ c.nombre }}</h3>
            </div>
            <div class="text-right shrink-0">
              <p class="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Desde</p>
              <p class="text-xl font-black text-foreground">$ {{ (c.precio || 0).toLocaleString('es-CO') }}</p>
            </div>
          </div>

          <p v-if="c.descripcion" class="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed">{{ c.descripcion }}</p>

          <div class="flex flex-wrap gap-2 mt-auto pt-3">
            <UBadge v-if="c.categoria" size="sm" variant="subtle" color="primary" class="capitalize font-bold tracking-wide">{{ c.categoria }}</UBadge>
            <span v-for="t in c.tags" :key="t" class="inline-flex items-center gap-1 rounded-lg border border-border/50 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-muted-foreground bg-muted/50">
              #{{ t }}
            </span>
          </div>
          
          <div class="pt-4 border-t border-border/50 mt-2 flex items-center justify-between">
            <span class="text-xs text-muted-foreground font-bold flex items-center gap-2 uppercase tracking-wide">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500" /> Entrega Rápida
            </span>
            <UButton size="md" to="/menu" variant="soft" color="primary" class="font-bold rounded-xl px-5" trailing-icon="i-heroicons-arrow-right">Ver Menú</UButton>
          </div>
        </div>
      </UCard>
    </div>

    <EmptyState v-else description="Aún no hay combos configurados en el sistema." />
  </section>
</template>

<script setup lang="ts">
import { animate, stagger } from 'animejs'
import { onMounted, watch } from 'vue'

const props = defineProps<{
  loading: boolean, error: string | null, combos: { _id: string, nombre: string, precio: number, categoria?: string, tags?: string[], descripcion?: string }[]
}>()

const emit = defineEmits<{ (e: 'refresh'): void }>()
const isClient = typeof window !== 'undefined'

const animateCards = () => {
  if (isClient) {
    animate('.combo-card', { opacity: [0, 1], scale: [0.95, 1], delay: stagger(100), duration: 800, ease: 'outBack' })
  }
}

onMounted(() => { if (!props.loading && props.combos.length) animateCards() })
watch(() => props.loading, (n) => { if (!n && props.combos.length) setTimeout(animateCards, 50) })
</script>
