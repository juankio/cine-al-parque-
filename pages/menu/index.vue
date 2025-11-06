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
      <p class="text-sm uppercase tracking-wide text-primary/80 font-semibold">Menú</p>
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold">Combos y experiencias</h1>
          <p class="text-muted">
            Elige tu combo favorito para acompañar la función de hoy. Actualizamos la lista cada minuto.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            color="gray"
            variant="soft"
            :loading="loading"
            icon="i-heroicons-arrow-path"
            @click="handleRefresh"
          >
            Actualizar
          </UButton>
        </div>
      </div>
    </header>

    <UAlert
      v-if="error"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No pudimos cargar los combos"
    />

    <div
      v-if="loading && !combos.length"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <USkeleton
        v-for="i in 6"
        :key="i"
        class="h-44 rounded-2xl"
      />
    </div>

    <div
      v-else-if="combos.length"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <UCard
        v-for="combo in combos"
        :key="combo._id"
        class="rounded-2xl h-full flex flex-col border border-default/40 bg-white/90 dark:bg-slate-900/90 shadow-[0_12px_30px_rgba(15,23,42,.15)] dark:shadow-[0_18px_36px_rgba(0,0,0,.45)]"
      >
        <div class="space-y-2">
          <p class="text-[11px] uppercase tracking-wide text-muted flex items-center gap-1">
            <UIcon name="i-heroicons-sparkles" class="text-primary" />
            Recomendado
          </p>
          <div class="flex items-start justify-between gap-2">
            <h2 class="font-semibold text-lg leading-tight">
              {{ combo.nombre }}
            </h2>
            <span class="text-base font-semibold text-primary whitespace-nowrap">
              $ {{ money(combo.precio) }}
            </span>
          </div>
          <p v-if="combo.descripcion" class="text-sm text-muted line-clamp-2">
            {{ combo.descripcion }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2 text-xs mt-3">
          <UBadge
            v-if="combo.categoria"
            size="sm"
            variant="soft"
            color="primary"
            class="capitalize px-2.5 py-1 rounded-full text-[11px]"
          >
            {{ combo.categoria }}
          </UBadge>
          <span
            v-for="tag in combo.tags || []"
            :key="tag"
            class="inline-flex items-center gap-1 rounded-full border border-default/30 px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted"
          >
            <UIcon name="i-heroicons-hashtag" class="text-primary/70" />
            {{ tag }}
          </span>
        </div>

        <div class="mt-auto pt-4 flex items-center justify-between border-t border-default/40">
          <span class="text-xs text-muted">Perfecto para compartir</span>
          <UButton
            color="primary"
            variant="solid"
            size="sm"
            icon="i-heroicons-arrow-right"
            trailing
          >
            Reservar función
          </UButton>
        </div>
      </UCard>
    </div>

    <EmptyState v-else description="Aún no cargamos combos. Intenta más tarde." />
  </UContainer>
</template>

<script setup lang="ts">
import { useCombos } from '~/composables/useCombos'

const PAGE_LIMIT = 12
const { combos, loading, error, fetchCombos, refresh } = useCombos()

await fetchCombos({ limit: PAGE_LIMIT, force: true })

const handleRefresh = () => {
  refresh({ limit: PAGE_LIMIT })
}

const money = (value?: number) => (Number(value || 0)).toLocaleString('es-CO')
</script>
