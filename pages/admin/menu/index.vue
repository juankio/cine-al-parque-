<script setup>
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

const open = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

function newForm () {
  return {
    nombre: '',
    precio: '',
    recipeId: null,
    porciones: 1,
    descripcion: '',
    categoria: '',
    tags: [],
    activo: true
  }
}
const form = reactive(newForm())

function startCreate () {
  isEditing.value = false
  editingId.value = null
  Object.assign(form, newForm())
  open.value = true
}

function startEdit (row) {
  isEditing.value = true
  editingId.value = row._id || null
  Object.assign(form, {
    nombre: row?.nombre ?? '',
    precio: row?.precio ?? '',
    recipeId: row?.recipeId ?? null,
    porciones: row?.porciones ?? 1,
    descripcion: row?.descripcion ?? '',
    categoria: row?.categoria ?? '',
    tags: Array.isArray(row?.tags) ? [...row.tags] : [],
    activo: row?.activo ?? true
  })
  open.value = true
}

async function onSubmit () {
  if (!form.nombre?.trim()) return alert('El nombre es obligatorio')

  const payload = {
    ...form,
    precio: Number(form.precio) || 0,
    porciones: Number(form.porciones) || 1
  }

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

function onDelete (id) {
  if (!confirm('¿Borrar este producto?')) return
  deleteItem(id)
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
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
        />
        <UButton color="primary" @click="startCreate">Nuevo</UButton>
      </div>
    </div>

    <!-- grid de productos -->
    <div v-if="!loading && filtered.length" class="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      <UCard v-for="it in filtered" :key="it._id" class="group">
        <div class="flex items-start justify-between">
          <div>
            <div class="font-medium">{{ it.nombre }}</div>
            <div class="text-xs text-gray-500">{{ it.categoria || 'Sin categoría' }}</div>
          </div>
          <UBadge :color="it.activo ? 'green' : 'gray'">{{ it.activo ? 'Activo' : 'Inactivo' }}</UBadge>
        </div>

        <div class="mt-3 text-lg font-semibold">
          ${{ Number(it.precio || 0).toLocaleString('es-CO') }}
        </div>

        <div class="mt-2 flex flex-wrap gap-1">
          <UBadge v-for="t in (it.tags || [])" :key="t" variant="soft">#{{ t }}</UBadge>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton size="xs" variant="ghost" @click="startEdit(it)">Editar</UButton>
            <UButton size="xs" color="red" variant="soft" @click="onDelete(it._id)">Borrar</UButton>
          </div>
        </template>
      </UCard>
    </div>

    <p v-else-if="!loading" class="text-sm text-gray-500">Sin productos.</p>

    <!-- Slideover accesible (props title/description + slots body/footer) -->
    <USlideover
      v-model:open="open"
      :title="isEditing ? 'Editar producto' : 'Nuevo producto'"
      description="Completa los campos para crear el producto."
    >
      <!-- BODY -->
      <template #body>
        <div class="p-4">
          <!-- OJO: el picker de recetas está DENTRO del AdminMenuForm para no duplicarlo -->
          <AdminMenuForm
            :model-value="form"
            :recipe-options="recipes"
            :recipe-loading="recipesLoading"
            :category-options="[]"
            @update:modelValue="v => Object.assign(form, v)"
          />
        </div>
      </template>

      <!-- FOOTER -->
      <template #footer>
        <div class="flex items-center justify-between w-full">
          <div class="text-xs text-gray-500">
            {{ isEditing ? 'Editando' : 'Creando' }}: <b>{{ form.nombre || '—' }}</b>
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
