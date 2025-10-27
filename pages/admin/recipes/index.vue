<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["admin"] })

import { ref, reactive, computed, onMounted } from "vue"
import AdminHeader from "~/components/boss/shared/AdminHeader.vue"
import ConfirmDeleteModal from "~/components/shared/ConfirmDeleteModal.vue"
import AdminRecipeForm from "~/components/boss/recipes/AdminRecipeForm.vue"

// ✅ fetch seguro (SSR/cookies)
const rfetch = useRequestFetch()

// ---------- Estado: recetas ----------
const list = ref<{ items: any[]; page: number; pageSize: number; total: number } | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// ---------- Estado: ingredientes (para el selector) ----------
const ingLoading = ref(false)
const ingOptions = ref<{ value: string; label: string; unit?: string }[]>([])
const ingMap = computed<Record<string, string>>(() => {
  const m: Record<string, string> = {}
  for (const it of ingOptions.value) m[it.value] = it.label
  return m
})

// ---------- Estado UI ----------
const q = ref("")
const openPanel = ref(false)
const isEditing = ref(false)
const currentId = ref<string | null>(null)

const openDelete = ref(false)
const toDelete = ref<any>(null)

// ---------- Form ----------
const form = reactive({
  nombre: "",
  // Porciones como string para evitar NaN al tipear. Se convierte al guardar.
  porciones: "1",
  activo: true,
  // amount es solo para la UI; al guardar se mapea a qtyBase
  items: [] as Array<{ ingredientId: string; amount: string | number }>,
})

// ---------- Helpers ----------
function toNumberOrNull(v: unknown) {
  if (v === null || v === undefined) return null
  if (typeof v === "number") return Number.isFinite(v) ? v : null
  const s = String(v).trim()
  if (!s) return null
  const n = Number(s.replace(",", "."))
  return Number.isFinite(n) ? n : null
}

function resetForm() {
  Object.assign(form, { nombre: "", porciones: "1", activo: true, items: [] })
}

// Listado filtrado por q (en front; si tu API acepta q úsalo en fetch)
const filtered = computed(() => {
  const items = list.value?.items ?? []
  const term = q.value.toLowerCase().trim()
  if (!term) return items
  return items.filter((r) =>
    String(r.nombre || "")
      .toLowerCase()
      .includes(term)
  )
})

// ---------- Carga ----------
async function fetchRecipes(page = 1, pageSize = 50, search = "") {
  loading.value = true
  error.value = null
  try {
    const data = await rfetch("/api/admin/recipes", {
      query: { page, pageSize, q: search },
    })
    list.value = data as any
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || "Error cargando recetas"
  } finally {
    loading.value = false
  }
}

async function fetchIngredientsOptions() {
  ingLoading.value = true
  try {
    const data = await rfetch("/api/admin/ingredients", {
      query: { page: 1, pageSize: 500 },
    })
    const items = (data as any)?.items || []
    ingOptions.value = items.map((i: any) => ({
      value: i._id,
      label: `${i.nombre} (${i.unidad})`,
      unit: i.unidad,
    }))
  } finally {
    ingLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchRecipes(1, 50), fetchIngredientsOptions()])
})

// ---------- Acciones ----------
function startCreate() {
  resetForm()
  currentId.value = null
  isEditing.value = false
  openPanel.value = true
}

function startEdit(rec: any) {
  currentId.value = rec._id
  isEditing.value = true
  // Normaliza items: la UI usa "amount" string; el back guarda "qtyBase" number
  const rows = Array.isArray(rec.items)
    ? rec.items.map((r: any) => ({
        ingredientId: r.ingredientId || r.ingredient?._id || "",
        amount: String(r.amount ?? r.qtyBase ?? ""), // mostramos como texto
      }))
    : []
  Object.assign(form, {
    nombre: rec.nombre || "",
    porciones: String(rec.porciones ?? "1"),
    activo: !!rec.activo,
    items: rows,
  })
  openPanel.value = true
}

async function save() {
  // Sanitiza porciones
  const porcionesNum = toNumberOrNull(form.porciones)
  if (porcionesNum === null || porcionesNum < 1) {
    alert("Las porciones deben ser un número válido (>= 1)")
    return
  }

  // Mapea items -> qtyBase (lo que espera el backend). Filtra inválidos.
  const items = (form.items || [])
    .map((r) => {
      const qty = toNumberOrNull(r.amount) // amount (UI) -> number
      return { ingredientId: r.ingredientId, qtyBase: qty }
    })
    .filter((r) => r.ingredientId && r.qtyBase !== null && (r.qtyBase as number) > 0)
    .map((r) => ({ ingredientId: r.ingredientId, qtyBase: r.qtyBase as number }))

  const payload = {
    nombre: form.nombre?.trim() || "",
    porciones: porcionesNum,
    activo: !!form.activo,
    items,
  }

  if (!payload.nombre) {
    alert("El nombre es obligatorio")
    return
  }
  if (!payload.items.length) {
    alert("Agrega al menos un ingrediente con cantidad > 0")
    return
  }

  try {
    if (isEditing.value && currentId.value) {
      await rfetch(`/api/admin/recipes/${currentId.value}`, {
        method: "PATCH",
        body: payload,
      })
    } else {
      await rfetch("/api/admin/recipes", {
        method: "POST",
        body: payload,
      })
    }
    openPanel.value = false
    await fetchRecipes(1, 50)
  } catch (err: any) {
    console.error("[RECETA] Error guardando", err)
    alert(err?.data?.message ?? err?.message ?? "Error guardando")
  }
}

function askDelete(rec: any) {
  toDelete.value = rec
  openDelete.value = true
}

async function doDelete() {
  if (!toDelete.value) return
  try {
    await rfetch(`/api/admin/recipes/${toDelete.value._id}`, { method: "DELETE" })
    openDelete.value = false
    await fetchRecipes(1, 50)
  } catch (err) {
    console.error("[RECETA] Error eliminando", err)
  }
}

const countItems = (rec: any) => (Array.isArray(rec.items) ? rec.items.length : 0)
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
          />
          <UButton v-if="q" variant="ghost" color="gray" @click="q = ''">Limpiar</UButton>
          <UButton color="primary" @click="startCreate">Nueva</UButton>
        </div>
      </template>
    </AdminHeader>

    <!-- Estado -->
    <div v-if="loading" class="grid gap-3">
      <UCard v-for="i in 6" :key="i" class="p-4">
        <USkeleton class="h-5 w-2/3 mb-2" />
        <USkeleton class="h-4 w-1/3" />
      </UCard>
    </div>

    <UAlert
      v-else-if="error"
      color="gray"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="error"
      title="No se pudo cargar las recetas"
    />

    <!-- Grid -->
    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="r in filtered" :key="r._id" class="p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold truncate">{{ r.nombre }}</h3>
          <span
            class="text-xs rounded-md px-2 py-0.5"
            :class="
              r.activo
                ? 'bg-green-500/15 text-green-500'
                : 'bg-neutral-500/15 text-neutral-400'
            "
          >
            {{ r.activo ? "Activo" : "Inactivo" }}
          </span>
        </div>

        <p class="text-sm text-muted">
          Porciones: <b>{{ r.porciones || 1 }}</b> · Ingredientes:
          <b>{{ countItems(r) }}</b>
        </p>

        <div class="flex flex-wrap gap-2 mt-1">
          <UButton size="xs" variant="outline" color="primary" @click="startEdit(r)">
            Editar
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            color="gray"
            @click="askDelete(r)"
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
        <UButton
          label="Cerrar"
          color="neutral"
          variant="outline"
          @click="openPanel = false"
        />
        <UButton :label="isEditing ? 'Guardar' : 'Crear'" color="primary" @click="save" />
      </template>
    </USlideover>

    <!-- Confirm delete -->
    <ConfirmDeleteModal v-model="openDelete" title="Eliminar receta" @confirm="doDelete">
      <p class="text-sm">
        ¿Seguro que quieres eliminar <b>{{ toDelete?.nombre }}</b>?
        <br />
        Esta acción no se puede deshacer.
      </p>
    </ConfirmDeleteModal>
  </UContainer>
</template>
