<script setup lang="ts">
import AdminMenuForm from '~/components/boss/menu/AdminMenuForm.vue'
import AdminMenuHeader from '~/components/boss/menu/AdminMenuHeader.vue'
import AdminMenuList from '~/components/boss/menu/AdminMenuList.vue'
import AdminMenuSkeleton from '~/components/boss/menu/AdminMenuSkeleton.vue'
import { useMenuAdmin } from '~/composables/admin/useMenuAdmin'

definePageMeta({ layout: 'admin' })

const {
  loading,
  error,
  search,
  filtered,
  recipes,
  recipesLoading,
  fetchMenu,
  fetchRecipes,
  createItem,
  updateItem,
  deleteItem,
} = useMenuAdmin()

const open = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  nombre: '',
  precio: '',
  porciones: 1,
  descripcion: '',
  categoria: '',
  tipo: 'personal',
  tags: [] as string[],
  activo: true,
  recipeIds: [] as string[],
})

const resetForm = () =>
  Object.assign(form, {
    nombre: '',
    precio: '',
    porciones: 1,
    descripcion: '',
    categoria: '',
    tipo: 'personal',
    tags: [],
    activo: true,
    recipeIds: [],
  })

const inferTipoFromPorciones = (porciones?: number | string) => {
  const value = Number(porciones) || 1
  if (value >= 4) return 'parche'
  if (value >= 2) return 'grupal'
  return 'personal'
}

const hydrateFromRow = (row: any) => {
  const recIds = Array.isArray(row?.recipeIds)
    ? row.recipeIds.map((id: any) => String(id))
    : row?.recipeId
    ? [String(row.recipeId)]
    : []

  Object.assign(form, {
    nombre: row?.nombre ?? '',
    precio: row?.precio ?? '',
    porciones: row?.porciones ?? 1,
    descripcion: row?.descripcion ?? '',
    categoria: row?.categoria ?? '',
    tipo: row?.tipo ? String(row.tipo).toLowerCase() : inferTipoFromPorciones(row?.porciones),
    tags: Array.isArray(row?.tags) ? [...row.tags] : [],
    activo: row?.activo ?? true,
    recipeIds: recIds,
  })
}

const startCreate = () => {
  isEditing.value = false
  editingId.value = null
  resetForm()
  open.value = true
}

const startEdit = (row: any) => {
  isEditing.value = true
  editingId.value = row?._id ?? null
  hydrateFromRow(row)
  open.value = true
}

const onSubmit = async () => {
  if (!form.nombre?.trim()) return alert('El nombre es obligatorio')

  const payload: any = {
    ...form,
    precio: Number(form.precio) || 0,
    porciones: Number(form.porciones) || 1,
  }

  if (Array.isArray(form.recipeIds)) {
    if (form.recipeIds.length <= 1) {
      payload.recipeId = form.recipeIds[0] ?? null
      delete payload.recipeIds
    } else {
      delete payload.recipeId
    }
  }

  saving.value = true
  try {
    if (isEditing.value && editingId.value) await updateItem(editingId.value, payload)
    else await createItem(payload)
    open.value = false
    fetchMenu()
  } catch (err) {
    console.error(err)
    alert('No se pudo guardar')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchMenu()
  fetchRecipes()
})
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <AdminMenuHeader
      v-model:query="search"
      @create="startCreate"
    />

    <AdminMenuSkeleton v-if="loading" />

    <UAlert
      v-else-if="error"
      color="neutral"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudo cargar la lista"
    />

    <AdminMenuList
      v-else
      :items="filtered"
      @edit="startEdit"
      @delete="deleteItem"
    />

    <USlideover v-model:open="open">
      <template #title>
        {{ isEditing ? 'Editar producto' : 'Nuevo producto' }}
      </template>
      <template #description>
        Completa los campos para crear el producto.
      </template>
      <template #body>
        <div class="p-6 space-y-8">
          <AdminMenuForm
            v-model="form"
            :recipe-options="recipes"
            :recipe-loading="recipesLoading"
            :category-options="[]"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex items-center justify-between w-full">
          <div class="text-xs text-gray-500">
            {{ isEditing ? 'Editando:' : 'Creando:' }}
            <b>{{ form.nombre || '(sin nombre)' }}</b>
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
