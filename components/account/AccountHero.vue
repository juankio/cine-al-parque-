<script setup lang="ts">
const props = defineProps<{
  userName: string
  lastVisit?: string | null
  favoriteTitle?: string | null
}>()
</script>

<template>
  <UCard
    class="p-6 sm:p-8 rounded-3xl border border-default/40 bg-white dark:bg-slate-900 transition hover:border-primary/50 hover:shadow-[0_12px_35px_rgba(225,29,72,0.15)]"
  >
    <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-2 max-w-xl">
        <p class="text-xs uppercase tracking-[0.35em] text-primary/70 font-semibold">Mi cuenta</p>
        <h1 class="text-3xl sm:text-4xl font-semibold leading-tight text-default">
          Hola, {{ props.userName }}
        </h1>
        <p class="text-muted text-sm sm:text-base">
          Revisa tus visitas al parque, tu gasto acumulado y cada función confirmada. Gestiona próximas reservas o revive tus favoritas desde un solo lugar.
        </p>
      </div>
      <div class="grid gap-3 text-sm min-w-[260px]">
        <UCard class="p-4 rounded-2xl border border-default/40 bg-white/80 dark:bg-slate-800/80 transition hover:border-primary/60 hover:shadow-[0_10px_25px_rgba(225,29,72,0.15)]">
          <p class="text-xs uppercase tracking-wide text-muted font-semibold">Última visita</p>
          <p class="text-lg font-semibold text-default mt-1">{{ props.lastVisit || 'Sin visitas confirmadas' }}</p>
        </UCard>
        <UCard class="p-4 rounded-2xl border border-default/40 bg-white/80 dark:bg-slate-800/80 transition hover:border-primary/60 hover:shadow-[0_10px_25px_rgba(225,29,72,0.15)]">
          <p class="text-xs uppercase tracking-wide text-muted font-semibold">Favorita reciente</p>
          <p class="text-base font-semibold text-default mt-1 whitespace-normal break-words">
            {{ props.favoriteTitle || 'Aún sin seleccionar' }}
          </p>
        </UCard>
      </div>
    </div>
  </UCard>
</template>
