<script setup lang="ts">
type Opt = { value: string; label: string }

const props = defineProps<{
  modelValue: {
    nombre?: string
    precio?: number | string
    porciones?: number | string
    descripcion?: string
    categoria?: string
    tipo?: string
    tags?: string[]
    activo?: boolean
    recipeIds?: string[]
  }
  recipeOptions: Opt[]
  recipeLoading?: boolean
  categoryOptions?: Opt[]
}>()

const emit = defineEmits<{ 'update:modelValue': [any] }>()

// proxy directo (como AdminIngredientForm)
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

/* ===== RECETAS ===== */
const recipeSearch = ref('')
const filteredRecipes = computed(() => {
  const q = recipeSearch.value.toLowerCase().trim()
  const list = props.recipeOptions || []
  if (!q) return list
  return list.filter(r => String(r.label).toLowerCase().includes(q))
})
function isSelected(id: string) {
  return (model.value.recipeIds || []).map(String).includes(String(id))
}
function toggleRecipe(id: string) {
  const arr = [...(model.value.recipeIds || [])].map(String)
  const sid = String(id)
  const idx = arr.indexOf(sid)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(sid)
  model.value.recipeIds = arr
}
function clearRecipes() { model.value.recipeIds = [] }

/* ===== TIPO ===== */
const tipoOptions = [
  { value: 'personal', label: 'Personal', hint: '1 porción' },
  { value: 'grupal', label: 'Grupal', hint: '2–3 porciones' },
  { value: 'parche', label: 'Parche', hint: '4+ porciones' }
]
function pickTipo(val: string) {
  const currentTipo = model.value.tipo || ''
  const newTipo = currentTipo === val ? '' : val
  let newPorciones = Number(model.value.porciones) || 1
  if (newTipo === 'personal') newPorciones = 1
  else if (newTipo === 'grupal') newPorciones = Math.max(2, newPorciones)
  else if (newTipo === 'parche') newPorciones = Math.max(4, newPorciones)
  model.value.tipo = newTipo
  model.value.porciones = newPorciones
}

/* ===== CATEGORÍAS ===== */
const categoryChips = computed<Opt[]>(() =>
  (props.categoryOptions?.length
    ? props.categoryOptions
    : [
        { value: 'Combo', label: 'Combo' },
        { value: 'Pizza', label: 'Pizza' },
        { value: 'Bebida', label: 'Bebida' },
        { value: 'Snack', label: 'Snack' },
        { value: 'Postre', label: 'Postre' }
      ])
)
function pickCategoria(val: string) {
  const current = model.value.categoria || ''
  model.value.categoria = current === val ? '' : val
}

/* ===== TAGS ===== */
const suggestedTags = [
  'combo', 'vegano', 'nuevo', 'popular',
  'sin-gluten', 'familiar', 'picante', 'light'
]
function toggleTag(tag: string) {
  const list = [...(model.value.tags || [])]
  const i = list.indexOf(tag)
  if (i >= 0) list.splice(i, 1)
  else list.push(tag)
  model.value.tags = list
}

/* ===== ACTIVO ===== */
function flipActivo(v: boolean) { model.value.activo = v }
</script>

<template>
  <div class="space-y-8">
    <!-- Nombre -->
    <div>
      <label class="text-sm font-medium mb-2 block">Nombre</label>
      <UInput
        v-model.trim="model.nombre"
        placeholder="Ej: Combo Parche Pepperoni"
        icon="i-heroicons-cube-transparent"
        autofocus
      />
    </div>

    <!-- Recetas -->
    <div>
      <label class="text-sm font-medium mb-2 block">Recetas asociadas (opcional)</label>
      <div class="flex items-center gap-2 mb-3">
        <UInput
          v-model="recipeSearch"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Buscar receta por nombre"
          class="flex-1"
        />
        <UButton
          size="xs"
          variant="ghost"
          :disabled="!(model.recipeIds && model.recipeIds.length)"
          @click="clearRecipes"
        >
          Quitar selección
        </UButton>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-auto pr-1">
        <template v-if="recipeLoading">
          <USkeleton v-for="i in 6" :key="i" class="h-20 rounded-xl" />
        </template>

        <button
          v-for="r in filteredRecipes"
          :key="r.value"
          type="button"
          :aria-pressed="isSelected(r.value)"
          @click="toggleRecipe(r.value)"
          class="px-3 py-2 text-left border rounded-xl transition relative focus-visible:ring"
          :class="isSelected(r.value)
            ? 'border-emerald-600 bg-emerald-50'
            : 'border-gray-300 hover:bg-gray-50'"
        >
          <div class="font-medium truncate flex items-center gap-2">
            <span>{{ r.label }}</span>
            <UIcon
              v-if="isSelected(r.value)"
              name="i-heroicons-check-circle"
              class="text-emerald-600 text-lg"
            />
          </div>
          <div class="text-xs text-muted">ID: {{ String(r.value).slice(-6) }}</div>
        </button>
      </div>

      <p class="text-xs text-muted mt-2">
        Puedes seleccionar <b>varias</b> recetas (ideal para combos grandes).
        Seleccionadas: {{ model.recipeIds?.length || 0 }}
      </p>
    </div>

    <!-- Tipo -->
    <div>
      <label class="text-sm font-medium mb-2 block">Tipo</label>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="t in tipoOptions"
          :key="t.value"
          size="xs"
          :variant="model.tipo === t.value ? 'solid' : 'soft'"
          :color="model.tipo === t.value ? 'primary' : 'gray'"
          class="rounded-full"
          @click="pickTipo(t.value)"
        >
          {{ t.label }}
          <span class="opacity-70 ml-1 text-xs">({{ t.hint }})</span>
        </UButton>
      </div>
    </div>

    <!-- Precio / Porciones -->
    <div class="grid sm:grid-cols-2 gap-4">
      <UInput
        v-model.number="model.precio"
        type="number"
        min="0"
        label="Precio"
        placeholder="18990"
        icon="i-heroicons-currency-dollar"
      />
      <UInput
        v-model.number="model.porciones"
        type="number"
        min="1"
        label="Porciones"
        icon="i-heroicons-calculator"
      />
    </div>

    <!-- Categoría -->
    <div>
      <label class="text-sm font-medium mb-2 block">Categoría</label>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="c in categoryChips"
          :key="c.value"
          size="xs"
          :variant="model.categoria === c.value ? 'solid' : 'soft'"
          :color="model.categoria === c.value ? 'primary' : 'gray'"
          class="rounded-full"
          @click="pickCategoria(c.value)"
        >
          {{ c.label }}
        </UButton>
      </div>
    </div>

    <!-- Descripción -->
    <UTextarea
      v-model="model.descripcion"
      label="Descripción"
      placeholder="Breve descripción del producto"
      icon="i-heroicons-pencil-square"
      autoresize
    />

    <!-- Tags -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium">Etiquetas</label>
        <span class="text-xs text-muted">{{ (model.tags || []).length }} / 8</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="t in suggestedTags"
          :key="t"
          size="xs"
          :variant="(model.tags || []).includes(t) ? 'solid' : 'soft'"
          :color="(model.tags || []).includes(t) ? 'primary' : 'gray'"
          class="rounded-full"
          @click="toggleTag(t)"
        >
          #{{ t }}
        </UButton>
      </div>
    </div>

    <!-- Activo -->
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-sm font-medium">Activo</h4>
        <p class="text-xs text-muted">Aparece en el menú público</p>
      </div>
      <USwitch :model-value="model.activo ?? true" @update:model-value="flipActivo" />
    </div>
  </div>
</template>
