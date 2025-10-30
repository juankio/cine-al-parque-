<script setup>
definePageMeta({ layout: 'admin', middleware: ['admin'] })
</script>

<template>
  <UContainer class="py-8 space-y-8">
    <!-- HEADER -->
    <header class="space-y-1">
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <UIcon name="i-heroicons-cog-8-tooth" class="text-primary text-2xl" />
        Panel administrativo
      </h1>
      <p class="text-sm text-muted">
        Control de películas, funciones, inventario y ventas.
      </p>
    </header>

    <!-- === OPERACIÓN === -->
    <section class="space-y-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-film" class="text-primary text-xl" />
        <h2 class="text-sm font-semibold uppercase tracking-wide text-muted">
          Operación
        </h2>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <!-- CARTELERA -->
        <NuxtLink to="/admin/movies">
          <UCard
            class="group rounded-2xl border border-default/60 cursor-pointer transition hover:bg-primary/5 hover:ring-1 hover:ring-primary/30"
          >
            <div class="flex items-start justify-between">
              <!-- left block -->
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-clapperboard"
                  class="text-primary text-2xl shrink-0"
                />
                <div class="space-y-1">
                  <div class="font-semibold text-base leading-tight text-gray-800 dark:text-gray-100">
                    Cartelera
                  </div>
                  <p class="text-xs text-muted leading-snug">
                    Películas, sinopsis, duración, edades.
                  </p>
                </div>
              </div>

              <!-- badge -->
              <span
                class="text-[11px] leading-none font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2.5 py-1 rounded-md"
              >
                En sala
              </span>
            </div>
          </UCard>
        </NuxtLink>

        <!-- FUNCIONES -->
        <NuxtLink to="/admin/showtimes">
          <UCard
            class="group rounded-2xl border border-default/60 cursor-pointer transition hover:bg-primary/5 hover:ring-1 hover:ring-primary/30"
          >
            <div class="flex items-start justify-between">
              <!-- left block -->
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-clock"
                  class="text-primary text-2xl shrink-0"
                />
                <div class="space-y-1">
                  <div class="font-semibold text-base leading-tight text-gray-800 dark:text-gray-100">
                    Funciones
                  </div>
                  <p class="text-xs text-muted leading-snug">
                    Horarios, sillas, reservas activas.
                  </p>
                </div>
              </div>

              <!-- badge -->
              <span
                class="text-[11px] leading-none font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-md"
              >
                En vivo
              </span>
            </div>
          </UCard>
        </NuxtLink>

        <!-- KPI -->
        <NuxtLink to="/admin/kpi">
          <UCard
            class="group rounded-2xl border border-default/60 cursor-pointer transition hover:bg-primary/5 hover:ring-1 hover:ring-primary/30"
          >
            <div class="flex items-start justify-between">
              <!-- left block -->
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-chart-bar"
                  class="text-primary text-2xl shrink-0"
                />
                <div class="space-y-1">
                  <div class="font-semibold text-base leading-tight text-gray-800 dark:text-gray-100">
                    KPI
                  </div>
                  <p class="text-xs text-muted leading-snug">
                    Ventas, ocupación, conversión.
                  </p>
                </div>
              </div>

              <!-- badge -->
              <span
                class="text-[11px] leading-none font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 bg-gray-200/60 dark:bg-gray-800/60 px-2.5 py-1 rounded-md"
              >
                Ver
              </span>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </section>

    <!-- === COCINA & POS === -->
    <section class="space-y-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-fire" class="text-primary text-xl" />
        <h2 class="text-sm font-semibold uppercase tracking-wide text-muted">
          Cocina & punto de venta
        </h2>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <!-- INGREDIENTES -->
        <NuxtLink to="/admin/ingredients">
          <UCard
            class="group rounded-2xl border border-default/60 cursor-pointer transition hover:bg-primary/5 hover:ring-1 hover:ring-primary/30"
          >
            <div class="flex items-start justify-between">
              <!-- left block -->
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-archive-box"
                  class="text-primary text-2xl shrink-0"
                />
                <div class="space-y-1">
                  <div class="font-semibold text-base leading-tight text-gray-800 dark:text-gray-100">
                    Ingredientes
                  </div>
                  <p class="text-xs text-muted leading-snug">
                    Stock, costo, insumos.
                  </p>
                </div>
              </div>

              <!-- badge -->
              <span
                class="text-[11px] leading-none font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-md"
              >
                Bodega
              </span>
            </div>
          </UCard>
        </NuxtLink>

        <!-- RECETAS -->
        <NuxtLink to="/admin/recipes">
          <UCard
            class="group rounded-2xl border border-default/60 cursor-pointer transition hover:bg-primary/5 hover:ring-1 hover:ring-primary/30"
          >
            <div class="flex items-start justify-between">
              <!-- left block -->
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-beaker"
                  class="text-primary text-2xl shrink-0"
                />
                <div class="space-y-1">
                  <div class="font-semibold text-base leading-tight text-gray-800 dark:text-gray-100">
                    Recetas
                  </div>
                  <p class="text-xs text-muted leading-snug">
                    Costeo por porción.
                  </p>
                </div>
              </div>

              <!-- badge -->
              <span
                class="text-[11px] leading-none font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-2.5 py-1 rounded-md"
              >
                Cocina
              </span>
            </div>
          </UCard>
        </NuxtLink>

        <!-- MENÚ -->
        <NuxtLink to="/admin/menu">
          <UCard
            class="group rounded-2xl border border-default/60 cursor-pointer transition hover:bg-primary/5 hover:ring-1 hover:ring-primary/30"
          >
            <div class="flex items-start justify-between">
              <!-- left block -->
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-sparkles"
                  class="text-primary text-2xl shrink-0"
                />
                <div class="space-y-1">
                  <div class="font-semibold text-base leading-tight text-gray-800 dark:text-gray-100">
                    Menú
                  </div>
                  <p class="text-xs text-muted leading-snug">
                    Productos que ve el cliente.
                  </p>
                </div>
              </div>

              <!-- badge -->
              <span
                class="text-[11px] leading-none font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2.5 py-1 rounded-md"
              >
                Público
              </span>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </section>
  </UContainer>
</template>
