<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

import AdminIngredientForm from '~/components/boss/ingredients/AdminIngredientForm.vue'
import AdminIngredientList from '~/components/boss/ingredients/AdminIngredientList.vue'
import AdminHeader from '~/components/boss/shared/AdminHeader.vue'
import ConfirmDeleteModal from '~/components/shared/ConfirmDeleteModal.vue'
import { useAdminIngredients } from '~/composables/admin/useAdminIngredients'

const {
  list, loading, error,
  fetchIngredients, createIngredient,
  updateIngredient, removeIngredient
} = useAdminIngredients()

const q = ref('')
const openPanel = ref(false)
const isEditing = ref(false)

const openDelete = ref(false)
const toDelete = ref<any>(null)
const currentId = ref<string | null>(null)

const form = reactive({
  nombre: '',
  unidad: 'und',
  stock: 0,
  costoUnitario: 0,
  activo: true // visual, no se envía
})

onMounted(() => fetchIngredients(1, 50))

const filtered = computed(() => {
  const term = q.value.toLowerCase()
  const items = list.value?.items ?? []
  return term ? items.filter(i => (i?.nombre ?? '').toLowerCase().includes(term)) : items
})

function resetForm () {
  Object.assign(form, { nombre: '', unidad: 'und', stock: 0, costoUnitario: 0, activo: true })
}

function startCreate () {
  resetForm()
  currentId.value = null
  isEditing.value = false
  openPanel.value = true
}

function startEdit (ing: any) {
  Object.assign(form, {
    nombre: ing?.nombre ?? '',
    unidad: ing?.unidad ?? 'und',
    stock: Number(ing?.stock ?? 0),
    costoUnitario: Number(ing?.costoUnitario ?? 0),
    activo: (ing?.activo ?? true)
  })
  currentId.value = ing._id
  isEditing.value = true
  openPanel.value = true
}

async function save () {
  // Solo manda lo que tu backend acepta
  const payload = {
    nombre: form.nombre,
    unidad: form.unidad,
    stock: Number(form.stock || 0),
    costoUnitario: Number(form.costoUnitario || 0)
  }

  if (isEditing.value && currentId.value) {
    await updateIngredient(currentId.value, payload)
  } else {
    await createIngredient(payload)
  }
  openPanel.value = false
  await fetchIngredients(1, 50)
}

function askDelete (ing: any) {
  toDelete.value = ing
  openDelete.value = true
}

async function doDelete () {
  if (!toDelete.value) return
  await removeIngredient(toDelete.value._id)
  openDelete.value = false
  await fetchIngredients(1, 50)
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <AdminHeader
      title="Ingredientes"
      subtitle="Gestiona los ingredientes base usados en tus recetas y menú."
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <UInput
            v-model.trim="q"
            type="search"
            placeholder="Buscar ingrediente…"
            icon="i-heroicons-magnifying-glass-20-solid"
            class="w-64"
          />
          <UButton v-if="q" variant="ghost" color="gray" @click="q = ''">Limpiar</UButton>
          <UButton color="primary" @click="startCreate">Nuevo</UButton>
        </div>
      </template>
    </AdminHeader>

    <AdminIngredientList
      :items="filtered"
      :loading="loading"
      :error="error"
      @select="startEdit"
      @delete="askDelete"
    />

   <!-- Panel lateral (crear/editar) -->
<USlideover
  v-model:open="openPanel"
  side="right"
  :ui="{
    overlay: 'bg-black/40',
    content: 'max-w-md p-0 bg-default',   // sin padding extra, ancho cómodo
    container: 'p-0'
  }"
>
  <!-- Title/description accesibles -->
  <template #title>
    {{ isEditing ? 'Editar ingrediente' : 'Nuevo ingrediente' }}
  </template>
  <template #description>
    Completa los campos y guarda los cambios.
  </template>

  <!-- Contenido del panel -->
  <template #content>
    <div class="flex h-full flex-col">
      <!-- Header visual del panel -->
      <div class="px-5 py-4 border-b border-default">
        <h3 class="text-base font-semibold">
          {{ isEditing ? 'Editar ingrediente' : 'Nuevo ingrediente' }}
        </h3>
        <p class="text-sm text-muted">Completa los campos y guarda los cambios.</p>
      </div>

      <!-- Body scrollable -->
      <div class="flex-1 overflow-y-auto px-5 py-4">
        <form class="grid gap-4 md:grid-cols-2" @submit.prevent="save">
          <UFormField label="Nombre del ingrediente" class="md:col-span-2">
            <UInput v-model.trim="form.nombre" />
          </UFormField>

          <UFormField label="Unidad">
            <USelect
              v-model="form.unidad"
              :items="[
                { label: 'Unidad', value: 'unid' },
                { label: 'Litro',  value: 'l' },
                { label: 'Kilogramo', value: 'kg' }
              ]"
            />
          </UFormField>

          <UFormField label="Costo unitario">
            <UInput v-model.number="form.costoUnitario" type="number" min="0" />
          </UFormField>

          <UFormField label="Stock" class="md:col-span-2">
            <UInput v-model.number="form.stock" type="number" min="0" />
          </UFormField>

          <div class="md:col-span-2">
            <USwitch v-model="form.activo" label="Activo" />
          </div>
        </form>
      </div>

      <!-- Footer sticky -->
      <div class="sticky bottom-0 border-t border-default bg-default/80 backdrop-blur px-5 py-3 flex justify-end gap-2">
        <UButton
          label="Cerrar"
          variant="subtle"
          color="neutral"
          @click="openPanel = false"
        />
        <UButton
          :label="isEditing ? 'Guardar' : 'Crear'"
          color="primary"
          @click="save"
        />
      </div>
    </div>
  </template>
</USlideover>

    <ConfirmDeleteModal
      v-model="openDelete"
      title="Eliminar ingrediente"
      @confirm="doDelete"
    >
      <p class="text-sm">
        ¿Seguro que quieres eliminar <b>{{ toDelete?.nombre }}</b>?<br>
        Esta acción no se puede deshacer.
      </p>
    </ConfirmDeleteModal>
  </UContainer>
</template>
