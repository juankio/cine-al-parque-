<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["admin"] })

import AdminHeader from "~/components/boss/shared/AdminHeader.vue"
import ConfirmDeleteModal from "~/components/shared/ConfirmDeleteModal.vue"
import AdminRecipeForm from "~/components/boss/recipes/AdminRecipeForm.vue"
import AdminRecipeList from "~/components/boss/recipes/AdminRecipeList.vue"
import { useAdminRecipes } from "~/composables/admin/useAdminRecipe"

const {
  // state
  list, loading, error,
  ingLoading, ingOptions,
  q, openPanel, isEditing, currentId,
  openDelete, toDelete,
  form, filtered,
  // methods
  fetchRecipes, fetchIngredientsOptions,
  startCreate, startEdit, save, askDelete, doDelete,
} = useAdminRecipes()

onMounted(async () => {
  await Promise.all([fetchRecipes(1, 50), fetchIngredientsOptions()])
})
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <AdminHeader
      title="Recetas"
      subtitle="Define recetas usando ingredientes base; se usarán luego por el Menú."
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <UInput
            v-model.trim="q"
            type="search"
            placeholder="Buscar receta…"
            icon="i-heroicons-magnifying-glass-20-solid"
            class="w-64"
            @keydown.enter="fetchRecipes(1, 50, q)"
          />
          <UButton v-if="q" variant="ghost" color="gray" @click="q = ''; fetchRecipes(1, 50)">
            Limpiar
          </UButton>
          <UButton color="primary" @click="startCreate">Nueva</UButton>
        </div>
      </template>
    </AdminHeader>

    <AdminRecipeList
      :items="filtered"
      :loading="loading"
      :error="error"
      @edit="startEdit"
      @delete="askDelete"
    />

    <!-- Slideover -->
    <USlideover
      v-model:open="openPanel"
      :title="isEditing ? 'Editar receta' : 'Nueva receta'"
      :description="isEditing ? 'Modifica los datos y guarda los cambios.' : 'Completa los campos y crea la receta.'"
      side="right"
      :ui="{ footer: 'justify-end' }"
      :key="(currentId || 'new') + ':' + (isEditing ? 1 : 0) + ':' + (openPanel ? 1 : 0)"
      class="max-w-md"
    >
      <template #body>
        <div class="p-4">
          <AdminRecipeForm
            :key="(currentId || 'new') + ':' + isEditing"
            v-model="form"
            :ingredient-options="ingOptions"
            :loading-ingredients="ingLoading"
          />
        </div>
      </template>

      <template #footer>
        <UButton label="Cerrar" color="neutral" variant="outline" @click="openPanel = false" />
        <UButton :label="isEditing ? 'Guardar' : 'Crear'" color="primary" @click="save" />
      </template>
    </USlideover>

    <!-- Confirm delete -->
    <ConfirmDeleteModal v-model="openDelete" title="Eliminar receta" @confirm="doDelete">
      <p class="text-sm">
        ¿Seguro que quieres eliminar <b>{{ toDelete?.nombre }}</b>?<br />
        Esta acción no se puede deshacer.
      </p>
    </ConfirmDeleteModal>
  </UContainer>
</template>
