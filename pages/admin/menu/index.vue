<script setup lang="ts">
import AdminMenuForm from '~/components/boss/menu/AdminMenuForm.vue'
import { useMenuAdmin } from '~/composables/admin/useMenuAdmin'

definePageMeta({ layout: 'admin' })

const {
  items,
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
  deleteItem
} = useMenuAdmin()

onMounted(() => {
  fetchMenu()
  fetchRecipes()
})

/* ---------- UI ---------- */
const open = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

/* ---------- Form ---------- */
const form = reactive({
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

/** Llena form desde item existente */
function hydrateFromRow(row: any) {
  const recIds: string[] = Array.isArray(row?.recipeIds)
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
    tipo: row?.tipo ?? '',
    tags: Array.isArray(row?.tags) ? [...row.tags] : [],
    activo: row?.activo ?? true,
    recipeIds: recIds
  })
}

/** Crear nuevo (limpieza total) */
function startCreate() {
  isEditing.value = false
  editingId.value = null
  Object.assign(form, {
    nombre: '',
    precio: '',
    porciones: 1,
    descripcion: '',
    categoria: '',
    tipo: '',
    tags: [],
    activo: true,
    recipeIds: []
  })
  open.value = true
}

/** Editar existente */
function startEdit(row: any) {
  isEditing.value = true
  editingId.value = row?._id ?? null
  hydrateFromRow(row)
  open.value = true
}

/** Guardar cambios */
async function onSubmit() {
  if (!form.nombre?.trim()) {
    alert('El nombre es obligatorio')
    return
  }

  const payload: any = {
    ...form,
    precio: Number(form.precio) || 0,
    porciones: Number(form.porciones) || 1
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
    if (isEditing.value && editingId.value) {
      await updateItem(editingId.value, payload)
    } else {
      await createItem(payload)
    }
    open.value = false
    fetchMenu()
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
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Menú</h1>
        <p class="text-sm text-gray-500">
          Productos del menú con receta opcional y estado.
        </p>
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

    <!-- GRID -->
    <div
      v-if="!loading && filtered.length"
      class="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <UCard
        v-for="it in filtered"
        :key="it._id"
        class="group cursor-pointer hover:bg-muted/30 transition"
        @click="startEdit(it)"
      >
        <div class="flex items-start justify-between">
          <div class="min-w-0">
            <div class="font-medium truncate max-w-[16rem]">
              {{ it.nombre }}
            </div>
            <div class="text-xs text-gray-500">
              {{ it.categoria || 'Sin categoría' }}
            </div>
          </div>
          <UBadge :color="it.activo ? 'green' : 'gray'">
            {{ it.activo ? 'Activo' : 'Inactivo' }}
          </UBadge>
        </div>

        <div class="mt-3 text-lg font-semibold">
          ${{ it.precio }}
        </div>

        <div class="mt-2 flex flex-wrap gap-1">
          <UBadge v-for="t in (it.tags || [])" :key="t" variant="soft">#{{ t }}</UBadge>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton size="xs" variant="ghost" @click.stop="startEdit(it)">Editar</UButton>
            <UButton size="xs" color="red" variant="soft" @click.stop="deleteItem(it._id)">
              Borrar
            </UButton>
          </div>
        </template>
      </UCard>
    </div>

    <p v-else-if="!loading" class="text-sm text-gray-500">Sin productos.</p>

    <!-- SLIDEOVER -->
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
