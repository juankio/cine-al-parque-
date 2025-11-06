<template>
  <UContainer class="py-12 space-y-8">
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-2 text-sm text-primary hover:underline"
    >
      <UIcon name="i-heroicons-arrow-left" />
      Volver al inicio
    </NuxtLink>

    <header class="space-y-3">
      <p class="text-sm uppercase tracking-wide text-primary/80 font-semibold">Reservas</p>
      <div class="space-y-2">
        <h1 class="text-3xl font-bold">Mis reservas</h1>
        <p class="text-muted">
          Aquí podrás revisar el estado de tus reservas, descargar comprobantes y gestionar cambios.
          Estamos terminando la integración para mostrarte toda la información en tiempo real.
        </p>
      </div>
    </header>

    <div class="grid gap-6 lg:grid-cols-3">
      <UCard class="rounded-2xl border border-default/40 bg-white/90 dark:bg-slate-900/90">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" class="text-primary" />
            ¿Qué encontrarás aquí?
          </div>
        </template>
        <ul class="space-y-3 text-sm text-muted">
          <li v-for="item in roadmap" :key="item.title">
            <p class="font-semibold text-default">{{ item.title }}</p>
            <p>{{ item.description }}</p>
          </li>
        </ul>
      </UCard>

      <UCard class="lg:col-span-2 rounded-2xl border border-dashed border-primary/30 bg-white/80 dark:bg-slate-900/80">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm uppercase tracking-wide text-primary/80 font-semibold">
                Próxima actualización
              </p>
              <h2 class="text-2xl font-semibold">Historial de confirmaciones</h2>
            </div>
            <UBadge color="primary" variant="soft">En progreso</UBadge>
          </div>
        </template>

        <EmptyState
          title="Aún no tienes reservaciones visibles"
          description="Una vez confirmes una función, verás aquí el detalle de tus entradas y los pasos para modificarlas."
          icon="i-heroicons-ticket"
        />
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <UButton
            v-for="action in actions"
            :key="action.label"
            :to="action.to"
            class="justify-start"
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-long-right"
            trailing
          >
            {{ action.label }}
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const roadmap = [
  {
    title: 'Confirmaciones sincronizadas',
    description: 'Mostraremos la hora, sala, mesa y código QR de cada reserva confirmada.',
  },
  {
    title: 'Cambios en línea',
    description: 'Podrás reprogramar tu reserva o liberar tu mesa directamente desde esta página.',
  },
  {
    title: 'Historial descargable',
    description: 'Exporta tus reservas pasadas en PDF o compártelas por correo en un clic.',
  },
]

const actions = [
  { label: 'Explorar cartelera', to: '/' },
  { label: 'Ver combos disponibles', to: '/menu' },
]
</script>
