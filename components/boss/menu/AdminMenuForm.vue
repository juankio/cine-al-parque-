<!-- components/boss/menu/AdminMenuForm.vue -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: any
  recipeOptions: { value: string; label: string }[]
  recipeLoading?: boolean
  categoryOptions?: { value: string; label: string }[]
}>()

const emit = defineEmits<{ 'update:modelValue': [any] }>()

/** Proxy v-model con compatibilidad:
 *  - si viene recipeId (string), lo mapeo a recipeIds [string]
 */
const form = computed({
  get: () => {
    const v = props.modelValue || {}
    const recipeIds: string[] = Array.isArray(v.recipeIds)
      ? v.recipeIds
      : v.recipeId
      ? [v.recipeId]
      : []
    return {
      nombre: v.nombre ?? '',
      precio: v.precio ?? '',
      porciones: v.porciones ?? 1,
      descripcion: v.descripcion ?? '',
      categoria: v.categoria ?? '',
      tags: Array.isArray(v.tags) ? v.tags : [],
      activo: v.activo ?? true,
      recipeIds
    }
  },
  set: (val) => emit('update:modelValue', val)
})

/* ====== RECETAS (multi) ====== */
const recipeSearch = ref('')
const filteredRecipes = computed(() => {
  const q = recipeSearch.value.toLowerCase().trim()
  if (!q) return props.recipeOptions
  return props.recipeOptions.filter(r =>
    String(r.label).toLowerCase().includes(q)
  )
})

function isSelected(id: string) {
  return form.value.recipeIds.includes(id)
}

function toggleRecipe(id: string) {
  const set = new Set(form.value.recipeIds)
  set.has(id) ? set.delete(id) : set.add(id)
  form.value.recipeIds = Array.from(set)
}

function clearRecipes() {
  form.value.recipeIds = []
}

/* ====== TAGS fijos (chips) ====== */
const suggestedTags = [
  'combo', 'vegano', 'nuevo', 'popular',
  'sin-gluten', 'familiar', 'picante', 'light'
]

function toggleTag(tag: string) {
  const set = new Set(form.value.tags || [])
  set.has(tag) ? set.delete(tag) : set.add(tag)
  form.value.tags = Array.from(set)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Asociar receta (estilo tarjetas, multi) -->
    <div>
      <label class="text-sm font-medium mb-2 block">Asociar receta (opcional)</label>

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
          :disabled="!form.recipeIds.length"
          @click="clearRecipes"
        >
          Quitar selección
        </UButton>
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
          class="rounded-xl border px-3 py-2 text-left transition focus:outline-none focus-visible:ring relative"
          :class="isSelected(r.value)
            ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
            : 'border-default hover:bg-muted/30'"
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
        Puedes seleccionar <b>varias recetas</b> (ideal para combos). Selección: {{ form.recipeIds.length }}
      </p>
    </div>

    <!-- Información básica -->
    <UCard>
      <template #header>
        <h3 class="text-sm font-semibold">Información básica</h3>
      </template>

      <div class="grid sm:grid-cols-2 gap-4">
        <UInput
          v-model.trim="form.nombre"
          label="Nombre"
          placeholder="Ej: Combo Familiar"
          icon="i-heroicons-cube-transparent"
        />
        <UInput
          v-model.number="form.precio"
          type="number"
          min="0"
          label="Precio"
          placeholder="18990"
          icon="i-heroicons-currency-dollar"
        />
        <UInput
          v-model.number="form.porciones"
          type="number"
          min="1"
          label="Porciones"
          icon="i-heroicons-calculator"
        />
        <USelectMenu
          v-model="form.categoria"
          searchable
          :options="categoryOptions || []"
          value-attribute="value"
          option-attribute="label"
          label="Categoría"
          placeholder="Selecciona o escribe una categoría"
          icon="i-heroicons-rectangle-stack"
        />
      </div>

      <UTextarea
        v-model="form.descripcion"
        label="Descripción"
        placeholder="Breve descripción del producto"
        icon="i-heroicons-pencil-square"
        autoresize
      />
    </UCard>

    <!-- Etiquetas (chips Nuxt UI) -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold">Etiquetas</h3>
          <span class="text-xs text-muted">{{ form.tags.length }} / 8</span>
        </div>
      </template>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="t in suggestedTags"
          :key="t"
          size="xs"
          :variant="form.tags.includes(t) ? 'solid' : 'soft'"
          :color="form.tags.includes(t) ? 'primary' : 'gray'"
          class="rounded-full"
          @click="toggleTag(t)"
        >
          #{{ t }}
        </UButton>
      </div>
    </UCard>

    <!-- Activo -->
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-sm font-medium">Activo</h4>
        <p class="text-xs text-muted">Aparece en el menú público</p>
      </div>
      <USwitch v-model="form.activo" />
    </div>
  </div>
</template>
