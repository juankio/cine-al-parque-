<template>
  <div class="space-y-4">
    <div>
      <label class="text-sm font-medium">Nombre</label>
      <UInput v-model.trim="model.nombre" placeholder="Nombre del ingrediente" />
    </div>

    <div>
      <label class="text-sm font-medium">Unidad</label>
      <USelect
        v-model="model.unidad"
        :options="units"
        option-attribute="label"
        value-attribute="value"
        placeholder="Unidad"
      />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-sm font-medium">Stock</label>
        <UInput v-model.number="model.stock" type="number" min="0" placeholder="0" />
        <p class="text-xs text-muted mt-1">Se guarda como <code>stockBase</code> (g/ml/unid)</p>
      </div>
      <div>
        <label class="text-sm font-medium">Costo unitario</label>
        <UInput v-model.number="model.costoUnitario" type="number" min="0" step="0.01" placeholder="0.00" />
        <p class="text-xs text-muted mt-1">Se guarda como <code>costoPromedio</code></p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <UCheckbox v-model="model.activo" />
      <span class="text-sm">Activo</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    nombre: string
    unidad: string
    stock: number
    costoUnitario: number
    activo: boolean
  }
}>()

const emit = defineEmits<{
  'update:modelValue':[any]
}>()

// proxy seguro para v-model (mantiene 2-way binding)
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const units = [
  { label: 'Gramo (g)', value: 'g' },
  { label: 'Kilogramo (kg)', value: 'kg' },
  { label: 'Mililitro (ml)', value: 'ml' },
  { label: 'Litro (l)', value: 'l' },
  { label: 'Unidad (unid)', value: 'unid' }
]
</script>
