<template>
  <div class="space-y-5">
    <!-- Nombre -->
    <div>
      <label class="text-sm font-medium">Nombre</label>
      <UInput v-model.trim="model.nombre" placeholder="Nombre de la receta" />
    </div>

    <!-- Porciones -->
    <div>
      <label class="text-sm font-medium">Porciones</label>
      <UInput
        v-model.trim="model.porciones"
        type="text"
        inputmode="decimal"
        placeholder="1"
      />
    </div>

    <!-- Ingredientes (selector tipo grid con popover) -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium">Ingredientes</label>
        <UButton
          size="xs"
          variant="outline"
          color="primary"
          @click="addRow"
          :disabled="loadingIngredients"
        >
          Agregar
        </UButton>
      </div>

      <div v-if="(model.items?.length || 0) === 0" class="text-sm text-muted">
        No hay ingredientes aún.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(row, idx) in model.items"
          :key="idx"
          :class="[
            'grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-3 rounded-2xl border p-3',
            isRowAvailable(row) ? 'border-transparent' : 'border-red-200 bg-red-50'
          ]"
        >
          <!-- Trigger + Popover con GRID -->
          <UPopover :open="openIdx === idx" @update:open="onToggleOpen(idx, $event)">
            <UButton
              variant="outline"
              color="neutral"
              class="justify-between"
              :label="selectedLabel(row.ingredientId) || 'Selecciona ingrediente…'"
              icon="i-heroicons-squares-2x2-20-solid"
            />
            <template #content>
              <div class="p-3 w-80 space-y-3">
                <UInput
                  v-model.trim="search"
                  placeholder="Buscar ingrediente…"
                  icon="i-heroicons-magnifying-glass-20-solid"
                />
                <div class="grid grid-cols-2 gap-2 max-h-80 overflow-auto pr-1">
                  <UButton
                    v-for="opt in filteredOptions"
                    :key="opt.value"
                    variant="soft"
                    color="neutral"
                    class="justify-start"
                    :aria-pressed="row.ingredientId === opt.value"
                    :data-active="row.ingredientId === opt.value"
                    @click="pick(idx, opt.value)"
                  >
                    <div class="text-left">
                      <div class="font-medium truncate">{{ opt.label }}</div>
                      <div class="text-[11px] text-muted">
                        Unidad: {{ opt.unit || "—" }}
                      </div>
                    </div>
                  </UButton>
                </div>

                <div v-if="filteredOptions.length === 0" class="text-xs text-muted">
                  Sin coincidencias.
                </div>
              </div>
            </template>
          </UPopover>

          <!-- Cantidad -->
          <div class="min-w-0">
            <label class="text-xs text-muted">Cantidad</label>
            <UInput
              v-model.trim="row.amount"
              type="text"
              inputmode="decimal"
              placeholder="0"
              class="w-28"
            />
          </div>

          <!-- Quitar -->
        <div class="pt-5">
          <UButton
            icon="i-heroicons-x-mark"
            color="neutral"
            variant="ghost"
            @click="removeRow(idx)"
            title="Quitar"
          />
        </div>

        <p
          v-if="!isRowAvailable(row)"
          class="col-span-3 text-xs text-red-600 flex items-center gap-1"
        >
          <UIcon name="i-heroicons-exclamation-triangle" />
          Ingrediente inactivo o sin stock. Se desactiva la receta hasta actualizarlo.
        </p>
      </div>
      </div>

      <p class="text-xs text-muted mt-2">
        La cantidad se interpreta en la unidad base del ingrediente (g/ml/unid).
      </p>
    </div>

    <!-- Activo -->
    <div class="flex items-center gap-2">
      <UCheckbox v-model="model.activo" />
      <span class="text-sm">Activo</span>
    </div>
  </div>
</template>

<script setup lang="ts">
type Row = { ingredientId: string; amount: string | number; ingredientName?: string; ingredientUnit?: string }
type IngredientOption = { value: string; label: string; unit?: string }

const props = defineProps<{
  modelValue: {
    nombre: string
    porciones: string | number
    activo: boolean
    items: Row[]
  }
  ingredientOptions: IngredientOption[]
  loadingIngredients?: boolean
}>()

const emit = defineEmits<{ "update:modelValue": [any] }>()

// proxy v-model
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
})

// índice del row con popover abierto
const openIdx = ref<number | null>(null)
const search = ref("")

// map id -> label (para mostrar en el botón)
const labelById = computed<Record<string, string>>(() => {
  const m: Record<string, string> = {}
  for (const o of (props.ingredientOptions || [])) m[o.value] = o.label
  for (const row of model.value.items || []) {
    if (row.ingredientId && row.ingredientName) {
      m[row.ingredientId] = `${row.ingredientName}${row.ingredientUnit ? ` (${row.ingredientUnit})` : ''}`
    }
  }
  return m
})
const selectedLabel = (id?: string) => (id && labelById.value[id]) || ""

// opciones filtradas por search (en popover)
const filteredOptions = computed(() => {
  const term = search.value.toLowerCase().trim()
  const src = props.ingredientOptions || []
  const existing = new Set((model.value.items || []).map((row) => row.ingredientId))
  const filtered = src.filter((o) => !existing.has(o.value))
  if (!term) return filtered
  return filtered.filter((o) => o.label.toLowerCase().includes(term))
})

// Abrir/cerrar popover por fila
function onToggleOpen(idx: number, val: boolean) {
  openIdx.value = val ? idx : openIdx.value === idx ? null : openIdx.value
}

// acciones
function addRow() {
  const nextItems = [...(model.value.items || []), { ingredientId: "", amount: "" }]
  model.value.items = nextItems
  nextTick(() => { openIdx.value = nextItems.length - 1 })
}

function removeRow(idx: number) {
  const copy = [...(model.value.items || [])]
  copy.splice(idx, 1)
  model.value.items = copy
  if (openIdx.value === idx) openIdx.value = null
}

function pick(idx: number, id: string) {
  const copy = [...(model.value.items || [])]
  const option = (props.ingredientOptions || []).find(o => o.value === id)
  copy[idx] = {
    ...copy[idx],
    ingredientId: id,
    ingredientName: option?.label,
    ingredientUnit: option?.unit,
  }
  model.value.items = copy
  openIdx.value = null
}

const isRowAvailable = (row: Row) => {
  if (!row.ingredientId) return false
  const opt = (props.ingredientOptions || []).find(o => o.value === row.ingredientId)
  return !!opt
}
</script>
