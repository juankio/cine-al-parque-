<template>
  <section class="space-y-8 relative w-full px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
    <div class="flex items-center justify-between border-b border-border/50 pb-5">
      <h2 class="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
        <UIcon name="i-heroicons-sparkles" class="text-primary w-8 h-8" /> Combos Destacados
      </h2>
      <UButton v-if="!loading" size="sm" variant="ghost" color="neutral" @click="emit('refresh')" class="hover:bg-primary/10 hover:text-primary transition-colors font-medium">Actualizar</UButton>
    </div>

    <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="i in 6" :key="i" class="h-40 w-full rounded-3xl animate-pulse" />
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
        class="combo-card flex flex-col h-full rounded-3xl border border-border bg-background/60 backdrop-blur-xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 opacity-0 group overflow-hidden"
        :ui="{ body: { padding: 'p-6' } }"
      >
        <div class="relative z-10 flex flex-col h-full gap-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                <UIcon name="i-heroicons-fire-solid" class="w-4 h-4" /> Top Ventas
              </div>
              <h3 class="font-black text-xl truncate group-hover:text-primary transition-colors text-foreground">{{ c.nombre }}</h3>
            </div>
            <div class="text-right shrink-0">
              <p class="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Precio</p>
              <p class="text-2xl font-black text-foreground">$ {{ (c.precio || 0).toLocaleString('es-CO') }}</p>
            </div>
          </div>

          <p v-if="c.descripcion" class="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed">{{ c.descripcion }}</p>

          <div class="flex flex-wrap gap-2 mt-auto pt-4">
            <UBadge v-if="c.categoria" size="sm" variant="subtle" color="primary" class="capitalize font-bold tracking-wide">{{ c.categoria }}</UBadge>
            <span v-for="t in c.tags" :key="t" class="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1 text-[11px] font-bold tracking-wide text-muted-foreground bg-muted/50">
              #{{ t }}
            </span>
          </div>
          
          <div class="pt-5 border-t border-border/50 mt-2 flex items-center justify-between">
            <span class="text-[11px] text-foreground font-black flex items-center gap-2 uppercase tracking-widest">
              <UIcon name="i-heroicons-bolt-solid" class="w-5 h-5 text-primary" /> Listo en Minutos
            </span>
            <UButton size="md" to="/menu" variant="soft" color="primary" class="font-bold rounded-xl px-5 shadow-sm hover:scale-105 transition-transform" trailing-icon="i-heroicons-arrow-right">Pedir Ahora</UButton>
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
    animate('.combo-card', { opacity: [0, 1], translateY: [30, 0], delay: stagger(100), duration: 800, ease: 'outQuart' })
  }
}

onMounted(() => { if (!props.loading && props.combos.length) animateCards() })
watch(() => props.loading, (n) => { if (!n && props.combos.length) setTimeout(animateCards, 50) })
</script>
