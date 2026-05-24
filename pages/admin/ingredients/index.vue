<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["admin"], ssr: false });

import { ref, reactive, computed, onMounted, toRaw, nextTick } from "vue";
import AdminIngredientForm from "~/components/boss/ingredients/AdminIngredientForm.vue";
import AdminIngredientList from "~/components/boss/ingredients/AdminIngredientList.vue";
import AdminHeader from "~/components/boss/shared/AdminHeader.vue";
import ConfirmDeleteModal from "~/components/shared/ConfirmDeleteModal.vue";
import { useAdminIngredients } from "~/composables/admin/useAdminIngredients";

const toast = useToast();

const {
  list,
  loading,
  error,
  fetchIngredients,
  createIngredient,
  updateIngredient,
  removeIngredient,
} = useAdminIngredients();

// -------- estado
const q = ref("");
const openPanel = ref(false);
const isEditing = ref(false);
const openDelete = ref(false);
const toDelete = ref<any>(null);
const currentId = ref<string | null>(null);

// formulario desacoplado del item
const form = reactive({
  nombre: "",
  unidad: "unid",
  stock: 0,
  costoUnitario: 0,
  activo: true,
});

onMounted(() => fetchIngredients(1, 50));

const filtered = computed(() => {
  const term = q.value.toLowerCase();
  const items = list.value?.items ?? [];
  return term ? items.filter((i) => i.nombre?.toLowerCase().includes(term)) : items;
});

function startCreate() {
  currentId.value = null;
  isEditing.value = false;
  Object.assign(form, {
    nombre: "",
    unidad: "unid",
    stock: 0,
    costoUnitario: 0,
    activo: true,
  });
  openPanel.value = true;
}

function startEdit(ing: any) {
  currentId.value = ing._id;
  isEditing.value = true;
  // mapear de API → form local
  Object.assign(form, {
    nombre: ing.nombre ?? "",
    unidad: ing.unidad ?? "unid",
    stock: Number(ing.stockBase ?? 0),
    costoUnitario: Number(ing.costoPromedio ?? 0),
    activo: !!ing.activo,
  });
  // cambiar key: fuerza remount del contenido del slideover y evita “datos pegados”
  openPanel.value = false;
  nextTick(() => {
    openPanel.value = true;
  });
}

async function save() {
  try {
    const raw = toRaw(form);
    // form → payload API
    const payload = {
      nombre: raw.nombre,
      unidad: raw.unidad,
      stockBase: Number(raw.stock) || 0,
      costoPromedio: Number(String(raw.costoUnitario).replace(",", ".")) || 0,
      activo: !!raw.activo,
    };

    if (isEditing.value && currentId.value) {
      await updateIngredient(currentId.value, payload);
      toast.add({ title: "Ingrediente actualizado", color: "success" });
    } else {
      await createIngredient(payload);
      toast.add({ title: "Ingrediente creado", color: "success" });
    }

    // refresca lista y cierra cuando el DOM ya procesó
    await fetchIngredients(1, 50, q.value || "");
    openPanel.value = false;
  } catch (e: any) {
    console.error("[ING] save error", e);
    toast.add({
      title: e?.data?.message || e?.message || "Error al guardar",
      color: "error",
    });
  }
}

function askDelete(ing: any) {
  toDelete.value = ing;
  openDelete.value = true;
}

async function doDelete() {
  if (!toDelete.value) return;
  await removeIngredient(toDelete.value._id);
  openDelete.value = false;
  await fetchIngredients(1, 50, q.value || "");
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <Motion
      tag="section"
      :initial="{ opacity: 0, y: -16 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }"
    >
      <AdminHeader
        title="Ingredientes"
        subtitle="Gestiona los ingredientes base usados en tus recetas y menú."
      >
        <template #actions>
          <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div class="flex w-full flex-col gap-2 sm:flex-row sm:w-auto sm:items-center">
              <UInput
                v-model.trim="q"
                type="search"
                placeholder="Buscar ingrediente…"
                icon="i-heroicons-magnifying-glass-20-solid"
                class="w-full sm:w-64"
              />
              <UButton
                v-if="q"
                variant="ghost"
                color="neutral"
                class="w-full sm:w-auto"
                @click="q = ''"
              >
                Limpiar
              </UButton>
            </div>
            <UButton
              color="primary"
              class="w-full sm:w-auto"
              @click="startCreate"
            >
              Nuevo
            </UButton>
          </div>
        </template>
      </AdminHeader>
    </Motion>

    <AdminIngredientList
      :items="filtered"
      :loading="loading"
      :error="error"
      @select="startEdit"
      @delete="askDelete"
    />

    <!-- Slideover accesible + con keys para remount -->
    <USlideover
      v-model:open="openPanel"
      :title="isEditing ? 'Editar ingrediente' : 'Nuevo ingrediente'"
      :description="
        isEditing
          ? 'Modifica los datos y guarda los cambios.'
          : 'Completa los campos y crea el ingrediente.'
      "
      side="right"
      :ui="{ body: 'overflow-visible', footer: 'justify-end' }"
      :key="(currentId || 'new') + ':' + (isEditing ? 1 : 0) + ':' + (openPanel ? 1 : 0)"
      class="max-w-md"
    >
      <template #body>
        <div class="p-4 space-y-5">
          <AdminIngredientForm
            :key="(currentId || 'new') + ':' + isEditing"
            v-model="form"
          />
        </div>
      </template>

      <template #footer>
        <UButton
          label="Cerrar"
          color="neutral"
          variant="outline"
          @click="openPanel = false"
        />
        <UButton :label="isEditing ? 'Guardar' : 'Crear'" color="primary" @click="save" />
      </template>
    </USlideover>

    <ConfirmDeleteModal
      v-model="openDelete"
      title="Eliminar ingrediente"
      @confirm="doDelete"
    >
      <p class="text-sm">
        ¿Seguro que quieres eliminar <b>{{ toDelete?.nombre }}</b
        >?<br />
        Esta acción no se puede deshacer.
      </p>
    </ConfirmDeleteModal>
  </UContainer>
</template>
