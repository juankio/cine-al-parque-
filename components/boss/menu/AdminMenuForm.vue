<!-- components/boss/menu/AdminMenuForm.vue -->
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

/** Helper para crear v-model por campo sin clonar el objeto (evita loops). */
function field<T = any>(key: string, fallback: T) {
  return computed<T>({
    get: () => ((props.modelValue as any)?.[key] ?? fallback) as T,
    set: (v: T) => {
      emit('update:modelValue', { ...props.modelValue, [key]: v })
    }
  })
}

const nombre     = field<string>('nombre', '')
const precio     = field<number | string>('precio', '')
const porciones  = field<number | string>('porciones', 1)
const descripcion= field<string>('descripcion', '')
const categoria  = field<string>('categoria', '')
const tipo       = field<string>('tipo', '')
const tags       = field<string[]>('tags', [])
const activo     = field<boolean>('activo', true)
const recipeIds  = field<string[]>('recipeIds', [])

/* ====== RECETAS (multi) ====== */
const recipeSearch = ref('')
const filteredRecipes = computed(() => {
  const q = recipeSearch.value.toLowerCase().trim()
  const list = props.recipeOptions || []
  if (!q) return list
  return list.filter(r => String(r.label).toLowerCase().includes(q))
})

function isSelected(id: string) {
  return (recipeIds.value || []).includes(String(id))
}
function toggleRecipe(id: string) {
  const curr = new Set((recipeIds.value || []).map(String))
  const sid = String(id)
  curr.has(sid) ? curr.delete(sid) : curr.add(sid)
  recipeIds.value = Array.from(curr)
}
function clearRecipes() { recipeIds.value = [] }

/* ====== TIPO ====== */
const tipoOptions = [
  { value: 'personal', label: 'Personal', hint: '1 porción' },
  { value: 'grupal',  label: 'Grupal',  hint: '2–3 porciones' },
  { value: 'parche',  label: 'Parche',  hint: '4+ porciones' },
]
function pickTipo(val: string) {
  tipo.value = (tipo.value === val) ? '' : val
  const n = Number(porciones.value) || 1
  if (tipo.value === 'personal') porciones.value = 1
  else if (tipo.value === 'grupal') porciones.value = Math.max(2, n)
  else if (tipo.value === 'parche') porciones.value = Math.max(4, n)
}

/* ====== CATEGORÍAS ====== */
const categoryChips = computed<Opt[]>(() =>
  (props.categoryOptions?.length ? props.categoryOptions : [
    { value: 'Combo',  label: 'Combo' },
    { value: 'Pizza',  label: 'Pizza' },
    { value: 'Bebida', label: 'Bebida' },
    { value: 'Snack',  label: 'Snack' },
    { value: 'Postre', label: 'Postre' }
  ])
)
function pickCategoria(val: string) {
  categoria.value = (categoria.value === val) ? '' : val
}

/* ====== TAGS ====== */
const suggestedTags = ['combo', 'vegano', 'nuevo', 'popular', 'sin-gluten', 'familiar', 'picante', 'light']
function toggleTag(tag: string) {
  const set = new Set(tags.value || [])
  set.has(tag) ? set.delete(tag) : set.add(tag)
  tags.value = Array.from(set)
}
</script>

<template>
  <div class="space-y-8">
    <!-- NOMBRE -->
    <div>
      <label class="text-sm font-medium mb-2 block">Nombre</label>
      <UInput
        v-model.trim="nombre"
        placeholder="Ej: Combo Parche Pepperoni"
        icon="i-heroicons-cube-transparent"
        autofocus
      />
    </div>

    <!-- RECETAS -->
    <div>
      <label class="text-sm font-medium mb-2 block">Asociar recetas (opcional)</label>
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
          :disabled="!recipeIds.length"
          @click="clearRecipes"
        >Quitar selección</UButton>
      </div>

      <div
        role="group"
        aria-label="Recetas"
        class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-auto pr-1"
      >
        <template v-if="recipeLoading">
          <USkeleton v-for="i in 6" :key="i" class="h-20 rounded-xl" />
        </template>

        <button
          v-for="r in filteredRecipes"
          :key="r.value"
          type="button"
          :aria-pressed="isSelected(r.value)"
          @click="toggleRecipe(r.value)"
          class="px-3 py-2 text-left transition focus:outline-none focus-visible:ring rounded-xl relative bg-transparent hover:bg-muted/40"
          :class="isSelected(r.value) ? 'ring-1 ring-primary/40 bg-primary/10' : ''"
        >
          <div class="font-medium truncate">{{ r.label }}</div>
          <div class="text-xs text-muted">ID: {{ String(r.value).slice(-6) }}</div>
          <UIcon
            v-if="isSelected(r.value)"
            name="i-heroicons-check-circle"
            class="absolute right-2 top-2 text-primary text-lg"
          />
        </button>
      </div>

      <p class="text-xs text-muted mt-2">
        Puedes seleccionar <b>varias</b> recetas (ideal para combos).
        Selección: {{ recipeIds.length }}
      </p>
    </div>

    <!-- TIPO -->
    <div>
      <label class="text-sm font-medium mb-2 block">Tipo</label>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="t in tipoOptions"
          :key="t.value"
          size="xs"
          :variant="tipo === t.value ? 'solid' : 'soft'"
          :color="tipo === t.value ? 'primary' : 'gray'"
          class="rounded-full"
          @click="pickTipo(t.value)"
        >
          {{ t.label }} <span class="opacity-70 ml-1 text-xs">({{ t.hint }})</span>
        </UButton>
      </div>
    </div>

    <!-- PRECIO / PORCIONES -->
    <div class="grid sm:grid-cols-2 gap-4">
      <UInput
        v-model.number="precio"
        type="number"
        min="0"
        label="Precio"
        placeholder="18990"
        icon="i-heroicons-currency-dollar"
      />
      <UInput
        v-model.number="porciones"
        type="number"
        min="1"
        label="Porciones"
        icon="i-heroicons-calculator"
      />
    </div>

    <!-- CATEGORÍA -->
    <div>
      <label class="text-sm font-medium mb-2 block">Categoría</label>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="c in categoryChips"
          :key="c.value"
          size="xs"
          :variant="categoria === c.value ? 'solid' : 'soft'"
          :color="categoria === c.value ? 'primary' : 'gray'"
          class="rounded-full"
          @click="pickCategoria(c.value)"
        >
          {{ c.label }}
        </UButton>
      </div>
    </div>

    <!-- DESCRIPCIÓN -->
    <UTextarea
      v-model="descripcion"
      label="Descripción"
      placeholder="Breve descripción del producto"
      icon="i-heroicons-pencil-square"
      autoresize
    />

    <!-- TAGS -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium">Etiquetas</label>
        <span class="text-xs text-muted">{{ (tags || []).length }} / 8</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="t in suggestedTags"
          :key="t"
          size="xs"
          :variant="(tags || []).includes(t) ? 'solid' : 'soft'"
          :color="(tags || []).includes(t) ? 'primary' : 'gray'"
          class="rounded-full"
          @click="toggleTag(t)"
        >
          #{{ t }}
        </UButton>
      </div>
    </div>

    <!-- ACTIVO -->
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-sm font-medium">Activo</h4>
        <p class="text-xs text-muted">Aparece en el menú público</p>
      </div>
      <USwitch v-model="activo" />
    </div>
  </div>
</template>
