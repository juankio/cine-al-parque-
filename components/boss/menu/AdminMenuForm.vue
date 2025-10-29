<script setup lang="ts">
type MenuForm = { nombre: string; precio: string | number; recipeId: string | null; activo: boolean }

const model = defineModel<MenuForm>({ required: true }) // <- v-model seguro, sin watchers

const props = withDefaults(defineProps<{
  recipeOptions: { value: string; label: string }[]
  loadingRecipes?: boolean
}>(), { loadingRecipes: false })

const showPicker = ref(false)
function pickRecipe(id: string | null) {
  model.value.recipeId = id
  showPicker.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1.5">
      <label class="text-sm font-medium">Nombre</label>
      <UInput v-model="model.nombre" placeholder="Nombre del producto" />
    </div>

    <div class="space-y-1.5">
      <label class="text-sm font-medium">Precio</label>
      <UInput v-model="model.precio" type="number" min="0" />
    </div>

    <!-- Selector de receta con GRID (no dropdown) -->
    <div class="space-y-1.5">
      <label class="text-sm font-medium">Receta (opcional)</label>

      <div class="flex items-center gap-2">
        <UButton variant="outline" @click="showPicker = !showPicker">
          {{ model.recipeId ? (props.recipeOptions.find(r => r.value === model.recipeId)?.label ?? '—') : 'Sin receta' }}
        </UButton>
        <UButton v-if="model.recipeId" variant="ghost" color="gray" @click="model.recipeId = null">
          Quitar
        </UButton>
      </div>

      <div v-if="showPicker" class="mt-3 p-3 rounded-xl border grid gap-2 grid-cols-2 sm:grid-cols-3">
        <UButton
          variant="soft"
          color="neutral"
          @click="pickRecipe(null)"
        >Sin receta</UButton>

        <template v-if="!props.loadingRecipes && props.recipeOptions?.length">
          <UButton
            v-for="r in props.recipeOptions"
            :key="r.value"
            variant="outline"
            @click="pickRecipe(r.value)"
          >
            {{ r.label }}
          </UButton>
        </template>

        <div v-else class="col-span-full text-sm text-muted">Cargando recetas…</div>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <UCheckbox v-model="model.activo" />
      <span class="text-sm">Activo</span>
    </div>
  </div>
</template>
