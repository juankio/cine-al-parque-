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
  { value: 'parche', label: 'Parche', hint: '4+ porciones' },
]

const ensurePorciones = (tipo?: string) => {
  if (!tipo) return
  let porciones = Number(model.value.porciones) || 1
  if (tipo === 'personal') porciones = 1
  else if (tipo === 'grupal') porciones = Math.max(2, porciones)
  else if (tipo === 'parche') porciones = Math.max(4, porciones)
  model.value.porciones = porciones
}

function setTipo(val: string) {
  if (model.value.tipo === val) return
  model.value.tipo = val
  ensurePorciones(val)
}

watch(
  () => props.modelValue.tipo,
  (val) => {
    if (!val) return
    model.value.tipo = val
    ensurePorciones(val)
  },
  { immediate: true }
)

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
    <div>
      <label class="text-sm font-medium text-muted">Nombre</label>
      <UInput
        v-model.trim="model.nombre"
        placeholder="Ej: Combo Parche Pepperoni"
        icon="i-heroicons-cube-transparent"
        autofocus
      />
    </div>

    <div>
      <label class="text-sm font-medium">Recetas asociadas (opcional)</label>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center mb-3">
        <UInput
          v-model="recipeSearch"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Buscar receta por nombre"
          class="flex-1"
        />
        <UButton
          variant="ghost"
          color="primary"
          :disabled="!(model.recipeIds && model.recipeIds.length)"
          @click="clearRecipes"
        >
          Quitar selección
        </UButton>
      </div>
      <div class="grid grid-cols-1 gap-2 max-h-72 overflow-auto pr-1 sm:grid-cols-2">
        <template v-if="recipeLoading">
          <USkeleton
            v-for="i in 6"
            :key="i"
            class="h-20 rounded-xl"
          />
        </template>
        <button
          v-for="r in filteredRecipes"
          :key="r.value"
          type="button"
          class="flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition duration-200"
          :class="isSelected(r.value)
            ? 'border-primary bg-primary/10 shadow-[0_10px_25px_rgba(244,63,94,0.18)]'
            : 'border-default hover:border-primary/40 hover:bg-primary/5'"
          @click="toggleRecipe(r.value)"
        >
          <div class="flex-1 min-w-0 space-y-1">
            <p class="font-semibold text-sm sm:text-base leading-tight">{{ r.label }}</p>
            <p class="text-xs text-muted font-mono tracking-wide">
              ID: {{ String(r.value).slice(-6).toUpperCase() }}
            </p>
          </div>
          <span
            class="inline-flex h-7 w-7 items-center justify-center rounded-full border transition"
            :class="isSelected(r.value)
              ? 'border-primary bg-white text-primary shadow-inner'
              : 'border-default text-muted'"
          >
            <UIcon
              name="i-heroicons-check"
              class="text-base"
            />
          </span>
        </button>
      </div>
      <p class="text-xs text-muted mt-2">
        Puedes seleccionar varias recetas. Seleccionadas: {{ model.recipeIds?.length || 0 }}
      </p>
    </div>

    <div>
      <label class="text-sm font-medium">Tipo</label>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="t in tipoOptions"
          :key="t.value"
          size="xs"
          :variant="model.tipo === t.value ? 'solid' : 'soft'"
          :color="model.tipo === t.value ? 'primary' : 'gray'"
          class="rounded-full"
          @click="setTipo(t.value)"
        >
          {{ t.label }}
          <span class="opacity-70 ml-1 text-xs">({{ t.hint }})</span>
        </UButton>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="text-sm font-medium">Precio</label>
        <UInput
          v-model.number="model.precio"
          type="number"
          min="0"
          placeholder="18990"
          icon="i-heroicons-currency-dollar"
        />
      </div>
      <div>
        <label class="text-sm font-medium">Porciones</label>
        <UInput
          v-model.number="model.porciones"
          type="number"
          min="1"
          icon="i-heroicons-calculator"
          readonly
          class="opacity-80"
          :aria-readonly="true"
          title="Las porciones se ajustan con los botones de Tipo"
        />
        <p class="text-xs text-muted mt-1">Se ajusta automáticamente según el tipo seleccionado.</p>
      </div>
    </div>

    <div>
      <label class="text-sm font-medium">Categoría</label>
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

    <div>
      <label class="text-sm font-medium">Descripción</label>
      <UTextarea
        v-model="model.descripcion"
        placeholder="Breve descripción del producto"
        icon="i-heroicons-pencil-square"
        autoresize
      />
    </div>

    <div>
      <div class="flex items-center justify-between">
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

    <div>
      <label class="text-sm font-medium">Estado</label>
      <div class="flex items-center justify-between rounded-2xl border border-default/60 px-4 py-3">
        <div>
          <p class="text-sm font-medium">Activo en menú</p>
          <p class="text-xs text-muted">Aparece para los clientes</p>
        </div>
        <USwitch :model-value="model.activo ?? true" @update:model-value="flipActivo" />
      </div>
    </div>
  </div>
</template>
