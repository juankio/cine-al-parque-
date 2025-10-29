<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

import { ref, computed, onMounted, nextTick } from 'vue'
import AdminHeader from '~/components/boss/shared/AdminHeader.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import AdminMenuForm from '~/components/boss/menu/AdminMenuForm.vue'
import { useMenuAdmin } from '~/composables/admin/useMenuAdmin'

// composable
const {
  items, filtered, loading, error, search,
  recipes, recipesLoading,
  fetchMenu, fetchRecipes, createItem, updateItem, deleteItem
} = useMenuAdmin()

// ---------- Estado UI ----------
const openPanel = ref(false)
const isEditing = ref(false)
const currentId = ref<string | null>(null)
const openDelete = ref(false)
const toDelete = ref<any>(null)

// ---------- Form ----------
const form = ref({
  nombre: '',
  precio: '',
  recipeId: null as string | null,
  activo: true
})

const EMPTY_MENU = Object.freeze({ nombre: '', precio: '', recipeId: null, activo: true })
const formSafe = computed(() => form.value ?? EMPTY_MENU)

// ---------- Funciones ----------
function resetForm() {
  form.value = { nombre: '', precio: '', recipeId: null, activo: true }
}

onMounted(() => Promise.all([fetchMenu(), fetchRecipes()]))

function startCreate() {
  resetForm()
  currentId.value = null
  isEditing.value = false
  openPanel.value = true
}

function startEdit(item: any) {
  form.value = {
    nombre: item.nombre || '',
    precio: String(item.precio ?? ''),
    recipeId: item.recipeId?._id || item.recipeId || null,
    activo: !!item.activo
  }
  currentId.value = item._id
  isEditing.value = true
  openPanel.value = true
}

async function save() {
  await nextTick()
  const data = {
    nombre: String(form.value.nombre ?? '').trim(),
    precio: Number(String(form.value.precio).replace(',', '.')),
    recipeId: form.value.recipeId || null,
    activo: !!form.value.activo
  }

  if (!data.nombre) return alert('El nombre es obligatorio')
  if (!Number.isFinite(data.precio) || data.precio < 0) return alert('El precio debe ser un número válido')

  try {
    if (isEditing.value && currentId.value) await updateItem(currentId.value, data)
    else await createItem(data)
    openPanel.value = false
  } catch (err: any) {
    console.error('[MENÚ] Error guardando', err)
    alert(err?.data?.message ?? err?.message ?? 'Error guardando')
  }
}

function askDelete(item: any) {
  toDelete.value = item
  openDelete.value = true
}

async function doDelete() {
  if (!toDelete.value) return
  try {
    await deleteItem(toDelete.value._id)
    openDelete.value = false
  } catch (err) {
    console.error('[MENÚ] Error eliminando', err)
  }
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <AdminHeader title="Menú" subtitle="Define los productos disponibles para venta.">
      <template #actions>
        <div class="flex items-center gap-2">
          <UInput
            v-model.trim="search"
            type="search"
            placeholder="Buscar producto…"
            icon="i-heroicons-magnifying-glass-20-solid"
            class="w-64"
          />
          <UButton v-if="search" variant="ghost" color="gray" @click="search = ''">Limpiar</UButton>
          <UButton color="primary" @click="startCreate">Nuevo</UButton>
        </div>
      </template>
    </AdminHeader>

    <!-- Estado de carga -->
    <div v-if="loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="i in 6" :key="i" class="p-4">
        <USkeleton class="h-5 w-2/3 mb-2" />
        <USkeleton class="h-4 w-1/3" />
      </UCard>
    </div>

    <!-- Error -->
    <UAlert
      v-else-if="error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudo cargar el menú"
    />

    <!-- Grid de productos -->
    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="p in filtered" :key="p._id" class="p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold truncate">{{ p.nombre }}</h3>
          <span
            class="text-xs rounded-md px-2 py-0.5"
            :class="p.activo ? 'bg-green-500/15 text-green-500' : 'bg-neutral-500/15 text-neutral-400'"
          >
            {{ p.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <p class="text-sm text-muted">
          Precio: <b>${{ p.precio?.toLocaleString?.() ?? p.precio }}</b>
        </p>

        <p class="text-xs text-muted">
          Receta: <b>{{ p.recipeId?.nombre || p.recipeId?._id || '—' }}</b>
        </p>

        <div class="flex flex-wrap gap-2 mt-1">
          <UButton size="xs" variant="outline" color="primary" @click="startEdit(p)">
            Editar
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            color="gray"
            @click="askDelete(p)"
            icon="i-heroicons-trash"
          >
            Eliminar
          </UButton>
        </div>
      </UCard>

      <div v-if="filtered.length === 0" class="text-muted">Sin resultados.</div>
    </div>

    <!-- Slideover -->
   <USlideover
  v-model:open="openPanel"
  :title="isEditing ? 'Editar producto' : 'Nuevo producto'"
  :description="isEditing ? 'Modifica los datos y guarda el producto.' : 'Completa los campos y crea el producto.'"
  side="right"
  :ui="{ footer: 'justify-end' }"
  class="max-w-md"
>
  <template #body>
    <div class="p-4">
      <AdminMenuForm
        v-model="form"                   
        :recipe-options="[...recipes]"
        :loading-recipes="recipesLoading"
      />
    </div>
  </template>

  <template #footer>
    <UButton label="Cerrar" color="neutral" variant="outline" @click="openPanel = false" />
    <UButton :label="isEditing ? 'Guardar' : 'Crear'" color="primary" @click="save" />
  </template>
</USlideover>


    <!-- Confirmar eliminar -->
    <ConfirmDeleteModal v-model="openDelete" title="Eliminar producto" @confirm="doDelete">
      <p class="text-sm">
        ¿Seguro que quieres eliminar <b>{{ toDelete?.nombre }}</b>?<br />
        Esta acción no se puede deshacer.
      </p>
    </ConfirmDeleteModal>
  </UContainer>
</template>
