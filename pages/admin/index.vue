<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

type AdminCard = {
  title: string
  description: string
  icon: string
  to: string
  badge: {
    text: string
    className: string
  }
}

type AdminSection = {
  title: string
  icon: string
  cards: AdminCard[]
}

const sections: AdminSection[] = [
  {
    title: 'Operacion',
    icon: 'i-heroicons-film',
    cards: [
      {
        title: 'Cartelera',
        description: 'Peliculas, sinopsis, duracion y edades.',
        icon: 'i-heroicons-clapperboard',
        to: '/admin/movies',
        badge: {
          text: 'En sala',
          className:
            'text-[11px] leading-none font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2.5 py-1 rounded-md',
        },
      },
      {
        title: 'Funciones',
        description: 'Horarios, mesas y reservas activas.',
        icon: 'i-heroicons-clock',
        to: '/admin/showtimes',
        badge: {
          text: 'En vivo',
          className:
            'text-[11px] leading-none font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-md',
        },
      },
      {
        title: 'KPI',
        description: 'Ventas, ocupacion y conversion.',
        icon: 'i-heroicons-chart-bar',
        to: '/admin/kpi',
        badge: {
          text: 'Ver',
          className:
            'text-[11px] leading-none font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 bg-gray-200/60 dark:bg-gray-800/60 px-2.5 py-1 rounded-md',
        },
      },
    ],
  },
  {
    title: 'Cocina & punto de venta',
    icon: 'i-heroicons-fire',
    cards: [
      {
        title: 'Ingredientes',
        description: 'Stock, costo y alertas de insumos.',
        icon: 'i-heroicons-archive-box',
        to: '/admin/ingredients',
        badge: {
          text: 'Bodega',
          className:
            'text-[11px] leading-none font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-md',
        },
      },
      {
        title: 'Recetas',
        description: 'Costeo por porcion y merma.',
        icon: 'i-heroicons-beaker',
        to: '/admin/recipes',
        badge: {
          text: 'Cocina',
          className:
            'text-[11px] leading-none font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-2.5 py-1 rounded-md',
        },
      },
      {
        title: 'Menu',
        description: 'Productos visibles para el cliente.',
        icon: 'i-heroicons-sparkles',
        to: '/admin/menu',
        badge: {
          text: 'Publico',
          className:
            'text-[11px] leading-none font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2.5 py-1 rounded-md',
        },
      },
    ],
  },
]

type MotionPreset = {
  initial: Record<string, any>
  enter: Record<string, any>
  hover?: Record<string, any>
}

const rollBottom = (delay = 0): MotionPreset => ({
  initial: {
    opacity: 0,
    y: 34,
    rotateX: -50,
    scale: 0.96,
    transformOrigin: 'bottom center',
  },
  enter: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      delay,
      type: 'spring',
      stiffness: 210,
      damping: 20,
      mass: 0.9,
    },
  },
})

const withHoverLift = (preset: MotionPreset): MotionPreset => ({
  ...preset,
  hover: {
    scale: 1.02,
    rotateX: -1.4,
    rotateY: 1.4,
    transition: {
      type: 'spring',
      stiffness: 250,
      damping: 18,
    },
  },
})

const headerMotion = rollBottom(0.05)
const sectionHeaderMotion = (index: number) => rollBottom(0.08 + index * 0.04)
const cardMotion = (index: number) => withHoverLift(rollBottom(0.12 + index * 0.05))
</script>

<template>
  <UContainer class="py-8 space-y-8">
    <Motion tag="header" class="space-y-1" v-bind="headerMotion">
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <UIcon name="i-heroicons-cog-8-tooth" class="text-primary text-2xl" />
        Panel administrativo
      </h1>
      <p class="text-sm text-muted">
        Control de peliculas, funciones, inventario y ventas.
      </p>
    </Motion>

    <section
      v-for="(section, sectionIndex) in sections"
      :key="section.title"
      class="space-y-4"
    >
      <Motion
        tag="div"
        class="flex items-center gap-2"
        v-bind="sectionHeaderMotion(sectionIndex)"
      >
        <UIcon :name="section.icon" class="text-primary text-xl" />
        <h2 class="text-sm font-semibold uppercase tracking-wide text-muted">
          {{ section.title }}
        </h2>
      </Motion>

      <div class="grid gap-4 md:grid-cols-3">
        <NuxtLink
          v-for="(card, cardIndex) in section.cards"
          :key="card.title"
          :to="card.to"
          class="block"
        >
          <Motion
            tag="div"
            class="h-full"
            v-bind="cardMotion(sectionIndex * 10 + cardIndex)"
          >
            <UCard
              class="group rounded-2xl border border-default/60 cursor-pointer transition hover:bg-primary/5 hover:ring-1 hover:ring-primary/30 h-full"
            >
              <div class="flex items-start justify-between h-full">
                <div class="flex items-start gap-3">
                  <UIcon
                    :name="card.icon"
                    class="text-primary text-2xl shrink-0"
                  />
                  <div class="space-y-1">
                    <div class="font-semibold text-base leading-tight text-gray-800 dark:text-gray-100">
                      {{ card.title }}
                    </div>
                    <p class="text-xs text-muted leading-snug">
                      {{ card.description }}
                    </p>
                  </div>
                </div>

                <span :class="card.badge.className">
                  {{ card.badge.text }}
                </span>
              </div>
            </UCard>
          </Motion>
        </NuxtLink>
      </div>
    </section>
  </UContainer>
</template>
