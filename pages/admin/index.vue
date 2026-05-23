<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { animate, stagger } from 'animejs'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

type AdminCard = {
  title: string
  description: string
  icon: string
  to: string
  badge: {
    text: string
    color: string
  }
}

type AdminSection = {
  title: string
  icon: string
  cards: AdminCard[]
}

const sections: AdminSection[] = [
  {
    title: 'Operación Principal',
    icon: 'i-heroicons-film',
    cards: [
      {
        title: 'Cartelera',
        description: 'Películas, sinopsis, duración y edades.',
        icon: 'i-heroicons-video-camera',
        to: '/admin/movies',
        badge: { text: 'En sala', color: 'primary' },
      },
      {
        title: 'Funciones',
        description: 'Horarios, mesas y reservas activas.',
        icon: 'i-heroicons-clock',
        to: '/admin/showtimes',
        badge: { text: 'En vivo', color: 'green' },
      },
      {
        title: 'Escáner QR',
        description: 'Validación y check-in de reservas.',
        icon: 'i-heroicons-qr-code',
        to: '/admin/reservations/scan',
        badge: { text: 'Nuevo', color: 'emerald' },
      },
      {
        title: 'Métricas (KPI)',
        description: 'Ventas, ocupación y conversión.',
        icon: 'i-heroicons-chart-bar',
        to: '/admin/kpi',
        badge: { text: 'Analítica', color: 'neutral' },
      },
    ],
  },
  {
    title: 'Cocina & Punto de Venta',
    icon: 'i-heroicons-fire',
    cards: [
      {
        title: 'Ingredientes',
        description: 'Stock, costo y alertas de insumos.',
        icon: 'i-heroicons-archive-box',
        to: '/admin/ingredients',
        badge: { text: 'Bodega', color: 'amber' },
      },
      {
        title: 'Recetas',
        description: 'Costeo por porción y merma.',
        icon: 'i-heroicons-beaker',
        to: '/admin/recipes',
        badge: { text: 'Cocina', color: 'violet' },
      },
      {
        title: 'Menú Público',
        description: 'Productos visibles para el cliente.',
        icon: 'i-heroicons-sparkles',
        to: '/admin/menu',
        badge: { text: 'App', color: 'primary' },
      },
    ],
  },
]

onMounted(() => {
  if (typeof window !== 'undefined') {
    animate('.admin-header', {
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 800,
      ease: 'outQuart'
    })

    animate('.admin-section', {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      delay: stagger(150),
      ease: 'outQuart'
    })

    animate('.admin-card', {
      opacity: [0, 1],
      scale: [0.95, 1],
      translateY: [20, 0],
      duration: 600,
      delay: stagger(50, { start: 300 }),
      ease: 'outBack'
    })
  }
})
</script>

<template>
  <UContainer class="py-8 space-y-12">
    <!-- Header -->
    <header class="admin-header opacity-0 space-y-2 pb-6 border-b border-border/50">
      <h1 class="text-3xl font-bold flex items-center gap-3 text-foreground tracking-tight">
        <UIcon name="i-heroicons-squares-2x2" class="text-primary w-8 h-8" />
        Panel Administrativo
      </h1>
      <p class="text-base text-muted-foreground max-w-2xl">
        Centro de control para operaciones de cine, inventario y métricas en tiempo real.
      </p>
    </header>

    <!-- Sections -->
    <div class="space-y-10">
      <section
        v-for="section in sections"
        :key="section.title"
        class="admin-section opacity-0 space-y-5"
      >
        <div class="flex items-center gap-2">
          <UIcon :name="section.icon" class="text-primary text-xl" />
          <h2 class="text-sm font-bold uppercase tracking-wider text-foreground">
            {{ section.title }}
          </h2>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <NuxtLink
            v-for="card in section.cards"
            :key="card.title"
            :to="card.to"
            class="block h-full group"
          >
            <UCard
              class="admin-card opacity-0 h-full rounded-2xl border border-border/60 bg-background transition-all duration-300 hover:shadow-lg hover:border-primary/40 group-hover:-translate-y-1"
              :ui="{ body: { padding: 'p-5' } }"
            >
              <div class="flex flex-col h-full gap-4">
                <div class="flex items-start justify-between">
                  <div class="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-300">
                    <UIcon :name="card.icon" class="w-6 h-6" />
                  </div>
                  <UBadge :color="card.badge.color as any" variant="subtle" size="sm" class="uppercase text-[10px] tracking-widest font-bold">
                    {{ card.badge.text }}
                  </UBadge>
                </div>
                
                <div class="space-y-1.5 mt-auto">
                  <h3 class="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                    {{ card.title }}
                  </h3>
                  <p class="text-sm text-muted-foreground leading-snug">
                    {{ card.description }}
                  </p>
                </div>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </section>
    </div>
  </UContainer>
</template>
