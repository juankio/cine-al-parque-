import { computed } from "vue";

<!-- components/boss/ingredients/AdminIngredientForm.vue -->
<template>
  <div class="space-y-5">
    <!-- Nombre -->
    <div>
      <label class="text-sm font-medium mb-2 block">Nombre</label>

      <UInput
        v-model.trim="model.nombre"
        placeholder="Ej: Harina de trigo"
        icon="i-heroicons-cube-transparent"
        autofocus
      />
    </div>

    <!-- Unidad (grid de tarjetas con íconos corregidos y balanceados) -->
    <div>
      <label class="text-sm font-medium mb-2 block">Unidad</label>

      <div
        role="radiogroup"
        aria-label="Unidad"
        class="grid grid-cols-2 sm:grid-cols-3 gap-2"
      >
        <button
          v-for="u in units"
          :key="u.value"
          role="radio"
          type="button"
          :aria-checked="model.unidad === u.value"
          @click="model.unidad = u.value"
          class="rounded-xl border px-3 py-2 text-left transition focus:outline-none focus-visible:ring"
          :class="
            model.unidad === u.value
              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
              : 'border-default hover:bg-muted/30'
          "
        >
          <div class="flex items-center gap-2 font-medium">
            <UIcon :name="u.icon" class="text-primary text-2xl" />
            {{ u.label }}
          </div>
          <div class="text-xs text-muted">{{ u.hint }}</div>
        </button>
      </div>

      <p class="text-xs text-muted mt-2">
        La unidad define la <code>unidadBase</code> y el
        <code>factor</code> automáticamente.
      </p>
    </div>

    <!-- Stock / Costo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="text-sm font-medium">Stock</label>

        <UInput
          v-model.number="model.stock"
          type="number"
          min="0"
          placeholder="0"
          icon="i-heroicons-archive-box"
        />
        <p class="text-xs text-muted mt-1">
          Se guarda como <code>stockBase</code> (g/ml/unid)
        </p>
      </div>

      <div>
        <label class="text-sm font-medium">Costo unitario</label>

        <UInput
          v-model.number="model.costoUnitario"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          icon="i-heroicons-banknotes"
        />
        <p class="text-xs text-muted mt-1">Se guarda como <code>costoPromedio</code></p>
      </div>
    </div>

    <!-- Activo -->
    <div class="flex items-center gap-2">
      <UCheckbox v-model="model.activo" />
      <span class="text-sm">Activo</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    nombre: string;
    unidad: "g" | "kg" | "ml" | "l" | "unid" | string;
    stock: number;
    costoUnitario: number;
    activo: boolean;
  };
}>();

const emit = defineEmits<{ "update:modelValue": [any] }>();

// proxy v-model
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

// tarjetas disponibles
const units = [
  { label: "Gramo", value: "g", hint: "Base: g · Peso", icon: "i-heroicons-scale" },
  {
    label: "Kilo",
    value: "kg",
    hint: "Base: g · Peso (×1000)",
    icon: "i-heroicons-cube",
  },
  {
    label: "mL",
    value: "ml",
    hint: "Base: ml · Volumen",
    icon: "i-heroicons-beaker",
  },
  {
    label: "Litro",
    value: "l",
    hint: "Base: ml · Volumen (×1000)",
    icon: "i-heroicons-beaker-solid",
  },
  {
    label: "Unidad",
    value: "unid",
    hint: "Base: unid · Unidad",
    icon: "i-heroicons-archive-box",
  },
];

// normaliza si llega algo raro
watchEffect(() => {
  const ok = units.some((u) => u.value === model.value.unidad);
  if (!ok) model.value.unidad = "unid";
});
</script>
