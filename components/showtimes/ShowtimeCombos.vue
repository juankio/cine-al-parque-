<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { ComboItem } from '~/composables/useCombos'
import type { CartLine } from '~/types/showtime'
import UCollapse from '~/components/base/UCollapse.vue'

const props = defineProps({
  combos: {
    type: Array as PropType<ComboItem[]>,
    default: () => []
  },
  combosLoading: Boolean,
  combosError: {
    type: String,
    default: null
  },
  cart: {
    type: Object as PropType<Record<string, CartLine>>,
    default: () => ({})
  },
  cartCount: {
    type: Number,
    default: 0
  },
  cartSubtotal: {
    type: Number,
    default: 0
  },
  orderTotal: {
    type: Number,
    default: 0
  },
  selectionCount: {
    type: Number,
    default: 0
  },
  hasCartItems: Boolean
})

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'clear'): void
  (e: 'reserve'): void
  (e: 'increment', combo: ComboItem): void
  (e: 'decrement', combo: ComboItem): void
}>()

const expandedCombos = ref(true)
watch(() => props.selectionCount, (count) => {
  if (count && !expandedCombos.value) expandedCombos.value = true
})

const money = (value?: number) => (Number(value || 0)).toLocaleString('es-CO')
</script>

<template>
  <UCard class="p-6 space-y-4 rounded-3xl border border-default/40 bg-white dark:bg-slate-900">
    <div class="flex flex-wrap items-start justify-between gap-5">
      <div class="space-y-1">
        <p class="text-xs uppercase tracking-[0.35em] text-primary font-semibold">Snacks &amp; combos</p>
        <h2 class="text-2xl font-semibold">Completa tu orden</h2>
        <p class="text-sm text-muted max-w-2xl">
          Añade comida o bebidas y las dejaremos listas junto a tu mesa. El monto se suma automáticamente a tu reserva.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UButton
          variant="ghost"
          color="primary"
          size="xs"
          :icon="expandedCombos ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          @click="expandedCombos = !expandedCombos"
        >
          {{ expandedCombos ? 'Ocultar combos' : 'Mostrar combos' }}
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-heroicons-arrow-top-right-on-square"
          to="/menu"
        >
          Ver menú completo
        </UButton>
        <UButton
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-heroicons-arrow-path"
          :loading="combosLoading"
          @click="emit('refresh')"
        >
          Actualizar
        </UButton>
        <UButton
          v-if="hasCartItems"
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-heroicons-trash"
          @click="emit('clear')"
        >
          Limpiar
        </UButton>
      </div>
    </div>

    <UCollapse :model-value="expandedCombos">
      <div class="grid gap-6 lg:grid-cols-[minmax(240px,320px),1fr] mt-4">
        <Motion
          tag="div"
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 0.3 } }"
        >
          <div class="h-full rounded-3xl bg-gradient-to-br from-rose-50 to-white dark:from-slate-800 dark:to-slate-900 border border-primary/20 p-5 space-y-5">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-xs uppercase tracking-[0.35em] text-primary font-semibold">Resumen</p>
                <UBadge color="primary" variant="soft">{{ hasCartItems ? 'Con snacks' : 'Solo sillas' }}</UBadge>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-muted">Sillas</span>
                  <b class="text-default">{{ selectionCount }}</b>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted">Combos</span>
                  <b class="text-default">{{ cartCount }}</b>
                </div>
                <div class="flex items-center justify-between text-primary">
                  <span>Total combos</span>
                  <b>$ {{ money(cartSubtotal) }}</b>
                </div>
                <div class="flex items-center justify-between text-default">
                  <span>Orden completa</span>
                  <b>$ {{ money(orderTotal) }}</b>
                </div>
              </div>
            </div>
            <UButton
              block
              color="primary"
              icon="i-heroicons-shopping-bag"
              :disabled="!selectionCount"
              @click="emit('reserve')"
            >
              {{ hasCartItems ? 'Reservar con combos' : 'Regresar a las sillas' }}
            </UButton>
            <p v-if="!selectionCount" class="text-xs text-muted text-center">
              Primero elige tus sillas antes de confirmar la compra.
            </p>
          </div>
        </Motion>

        <Motion
          tag="div"
          class="space-y-4"
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.3 } }"
        >
          <UAlert
            v-if="combosError"
            color="neutral"
            variant="soft"
            icon="i-heroicons-exclamation-triangle"
            :description="combosError"
            title="No pudimos cargar los combos"
          />

          <div v-else-if="combosLoading" class="grid gap-4 sm:grid-cols-2">
            <USkeleton v-for="i in 4" :key="i" class="h-32 rounded-2xl" />
          </div>

          <div v-else-if="combos.length" class="grid gap-5 sm:grid-cols-2">
            <Motion
              v-for="(combo, index) in combos"
              :key="combo._id"
              tag="div"
              :initial="{ opacity: 0, y: 18 }"
              :enter="{
                opacity: 1,
                y: 0,
                transition: { delay: 0.05 * index, duration: 0.25 }
              }"
              :hover="{ y: -4, transition: { type: 'spring', stiffness: 250, damping: 20 } }"
            >
              <UCard class="h-full border border-default/30 rounded-2xl bg-white dark:bg-slate-900/80 shadow-sm hover:border-primary/40 transition">
                <div class="space-y-3">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-[11px] uppercase tracking-wide text-primary/70">
                        {{ combo.categoria || 'Combo' }}
                      </p>
                      <h3 class="text-lg font-semibold leading-tight mt-1">
                        {{ combo.nombre }}
                      </h3>
                      <p v-if="combo.descripcion" class="text-sm text-muted mt-1 line-clamp-2">
                        {{ combo.descripcion }}
                      </p>
                    </div>
                    <span class="text-base font-semibold text-primary whitespace-nowrap">
                      $ {{ money(combo.precio) }}
                    </span>
                  </div>

                  <div class="flex flex-wrap gap-1">
                    <UBadge
                      v-for="tag in combo.tags || []"
                      :key="tag"
                      size="xs"
                      variant="soft"
                      color="primary"
                      class="uppercase tracking-wide"
                    >
                      #{{ tag }}
                    </UBadge>
                  </div>

                  <div class="flex items-center justify-between gap-3 border-t border-default/40 pt-3">
                    <span class="text-sm text-muted">
                      {{ cart[combo._id]?.qty ? 'En tu selección' : 'Añadir a la orden' }}
                    </span>
                    <div class="flex items-center gap-2">
                      <UButton
                        icon="i-heroicons-minus"
                        size="xs"
                        variant="outline"
                        color="neutral"
                        :disabled="!(cart[combo._id]?.qty)"
                        @click="emit('decrement', combo)"
                      />
                      <span class="w-7 text-center font-semibold">{{ cart[combo._id]?.qty || 0 }}</span>
                      <UButton
                        icon="i-heroicons-plus"
                        size="xs"
                        color="primary"
                        @click="emit('increment', combo)"
                      />
                    </div>
                  </div>
                </div>
              </UCard>
            </Motion>
          </div>

          <EmptyState
            v-else
            title="Aún no tenemos combos disponibles"
            description="Estamos actualizando la carta para este showtime."
          />
        </Motion>
      </div>
    </UCollapse>
  </UCard>
</template>
