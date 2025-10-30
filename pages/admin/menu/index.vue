<!-- pages/admin/menu/index.vue -->
<script setup lang="ts">
import AdminMenuForm from '~/components/boss/menu/AdminMenuForm.vue'
import { useMenuAdmin } from '~/composables/admin/useMenuAdmin'

definePageMeta({ layout: 'admin' })

const {
  items, loading, error, search, filtered,
  recipes, recipesLoading, fetchMenu, fetchRecipes,
  createItem, updateItem, deleteItem
} = useMenuAdmin()

onMounted(() => {
  fetchMenu()
  fetchRecipes()
})

/* ---------- UI state ---------- */
const open = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref<string|null>(null)

/* ---------- Form state (MISMA referencia siempre) ---------- */
const defaults = () => ({
  nombre: '',
  precio: '',
  porciones: 1,
  descripcion: '',
  categoria: '',
  tipo: '',
  tags: [] as string[],
  activo: true,
  recipeIds: [] as string[]
})
const form = reactive(defaults())

function resetForm() { Object.assign(form, defaults()) }

function hydrateFromRow(row: any) {
  Object.assign(form, {
    nombre: row?.nombre ?? '',
    precio: row?.precio ?? '',
    porciones: row?.porciones ?? 1,
    descripcion: row?.descripcion ?? '',
    categoria: row?.categoria ?? '',
    tipo: row?.tipo ?? '',
    tags: Array.isArray(row?.tags) ? [...row.tags] : [],
    activo: row?.activo ?? true,

    // Reconstruir seleccion: primero el recipeId, luego extras[]
    recipeIds: [
      ...([row?.recipeId].filter(Boolean).map((x:any)=>String(x))),
      ...((Array.isArray(row?.extras) ? row.extras : []).map((x:any)=>String(x)))
    ]
  })
}

function startCreate () {
  isEditing.value = false
  editingId.value = null
  resetForm()
  open.value = true
}

function startEdit (row: any) {
  isEditing.value = true
  editingId.value = row?._id ?? null
  resetForm()
  hydrateFromRow(row)
  open.value = true
}

async function onSubmit () {
  if (!form.nombre?.trim()) {
    alert('El nombre es obligatorio')
    return
  }

  const payload: any = {
    nombre: form.nombre.trim(),
    precio: Number(form.precio) || 0,
    porciones: Number(form.porciones) || 1,
    descripcion: form.descripcion ?? '',
    categoria: form.categoria ?? '',
    tipo: form.tipo ?? '',
    tags: Array.isArray(form.tags) ? form.tags : [],
    activo: !!form.activo
  }

  // Compat backend actual:
  // - primer id => recipeId
  // - resto => extras[]
  const ids = Array.isArray(form.recipeIds) ? form.recipeIds.filter(Boolean).map(String) : []
  payload.recipeId = ids[0] ?? null
  payload.extras   = ids.slice(1)

  saving.value = true
  try {
    if (isEditing.value && editingId.value) {
      await updateItem(editingId.value, payload)
    } else {
      await createItem(payload)
    }
    open.value = false
  } catch (e) {
    console.error(e)
    alert('No se pudo guardar')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Menú</h1>
        <p class="text-sm text-gray-500">Productos del menú con receta opcional y estado.</p>
      </div>
      <div class="flex gap-2">
        <UInput
          v-model.trim="search"
          placeholder="Buscar producto…"
          icon="i-heroicons-magnifying-glass-20-solid"
          class="w-64"
        />
        <UButton color="primary" @click="startCreate">Nuevo</UButton>
      </div>
    </div>

    <!-- Grid de productos -->
    <div v-if="!loading && filtered.length" class="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      <UCard v-for="it in filtered" :key="it._id" class="group">
        <div class="flex items-start justify-between">
          <div class="min-w-0">
            <div class="font-medium truncate max-w-[16rem]">{{ it.nombre }}</div>
            <div class="text-xs text-gray-500">{{ it.categoria || 'Sin categoría' }}</div>
          </div>
          <UBadge :color="it.activo ? 'green' : 'gray'">{{ it.activo ? 'Activo' : 'Inactivo' }}</UBadge>
        </div>

        <div class="mt-3 text-lg font-semibold">
          ${{ (Number(it.precio)||0).toLocaleString('es-CO') }}
        </div>

        <div class="mt-2 flex flex-wrap gap-1">
          <UBadge v-for="t in (it.tags || [])" :key="t" variant="soft">#{{ t }}</UBadge>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton size="xs" variant="ghost" @click="startEdit(it)">Editar</UButton>
            <UButton size="xs" color="red" variant="soft" @click="deleteItem(it._id)">Borrar</UButton>
          </div>
        </template>
      </UCard>
    </div>

    <p v-else-if="!loading" class="text-sm text-gray-500">Sin productos.</p>

    <!-- Slideover -->
    <USlideover v-model:open="open">
      <!-- HEADER -->
      <template #title>
        {{ isEditing ? 'Editar producto' : 'Nuevo producto' }}
      </template>
      <template #description>
        Completa los campos para crear el producto.
      </template>

    <!-- BODY -->
<template #body>
  <div class="p-4">
    <AdminMenuForm
      :model-value="form"
      :recipe-options="recipes"
      :recipe-loading="recipesLoading"
      :category-options="[]"
      @update:modelValue="(patch:any) => Object.assign(form, patch)"  
    />
  </div>
</template>


      <!-- FOOTER -->
      <template #footer>
        <div class="flex items-center justify-between w-full">
          <div class="text-xs text-gray-500">
            {{ isEditing ? 'Editando' : 'Creando' }}:
            <b>{{ form.nombre?.trim() || '(sin nombre)' }}</b>
          </div>
          <div class="flex gap-2">
            <UButton variant="ghost" @click="open = false">Cancelar</UButton>
            <UButton color="primary" :loading="saving" @click="onSubmit">
              {{ isEditing ? 'Guardar cambios' : 'Crear' }}
            </UButton>
          </div>
        </div>
      </template>
    </USlideover>
  </UContainer>
</template>
