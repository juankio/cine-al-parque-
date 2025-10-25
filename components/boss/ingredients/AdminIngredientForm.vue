<script setup lang="ts">
type Ingredient = {
  nombre: string
  unidad: string
  stock: number
  costoUnitario: number
  // activo se puede seguir usando visualmente, pero no lo mandaremos al backend
  activo?: boolean
}

const model = defineModel<Ingredient>({ required: true })
</script>

<template>
  <div class="grid gap-4">
    <UFormField label="Nombre del ingrediente">
      <UInput v-model="model.nombre" placeholder="Ej. Azúcar" />
    </UFormField>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Unidad">
        <USelect
          v-model="model.unidad"
          :options="[
            { label: 'Unidad', value: 'und' },
            { label: 'Litro',  value: 'l'   },
            { label: 'Kilogramo', value: 'kg' },
            { label: 'Gramo', value: 'g' }
          ]"
        />
      </UFormField>

      <UFormField label="Costo unitario">
        <UInput v-model.number="model.costoUnitario" type="number" min="0" />
      </UFormField>
    </div>

    <UFormField label="Stock">
      <UInput v-model.number="model.stock" type="number" min="0" />
    </UFormField>

    <!-- Opcional: sólo UI, no se envía al backend -->
    <div class="flex items-center gap-3">
      <USwitch v-model="model.activo" color="primary" />
      <span class="text-sm">Activo (visual)</span>
    </div>
  </div>
</template>
