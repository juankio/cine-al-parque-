<script setup lang="ts">
const rows = defineModel<number>("rows", { default: 6 });
const cols = defineModel<number>("cols", { default: 6 });
const replace = defineModel<boolean>("replace", { default: true });

defineProps<{ active: boolean }>();
const emit = defineEmits<{
  (e: "init-pattern", kind: "alt" | "2" | "4" | "empty"): void;
  (e: "toggle-active"): void;
}>();

function preset(kind: "S" | "M" | "L") {
  if (kind === "S") {
    rows.value = 4;
    cols.value = 6;
  }
  if (kind === "M") {
    rows.value = 6;
    cols.value = 8;
  }
  if (kind === "L") {
    rows.value = 8;
    cols.value = 10;
  }
  emit("init-pattern", "alt");
}
</script>

<template>
  <UCard class="p-4">
    <div class="grid gap-4 md:grid-cols-12 items-end">
      <!-- Presets -->
      <div class="md:col-span-4">
        <label class="text-sm font-medium mb-2 block">Tamaño rápido</label>
        <div class="flex flex-wrap gap-2">
          <UButton size="xs" variant="ghost" color="neutral" @click="preset('S')"
            >Pequeña (4×6)</UButton
          >
          <UButton size="xs" variant="ghost" color="neutral" @click="preset('M')"
            >Media (6×8)</UButton
          >
          <UButton size="xs" variant="ghost" color="neutral" @click="preset('L')"
            >Grande (8×10)</UButton
          >
        </div>
      </div>

      <!-- Inputs -->
      <div class="md:col-span-4">
        <label class="text-sm font-medium mb-2 block">Tamaño Manual</label>
        <UFormGroup label="Filas" class="md:col-span-2">
          <UInput
            v-model.number="rows"
            type="number"
            min="1"
            max="20"
            icon="i-heroicons-bars-3-bottom-left"
          />
        </UFormGroup>

        <UFormGroup label="Columnas" class="md:col-span-2">
          <UInput
            v-model.number="cols"
            type="number"
            min="1"
            max="20"
            icon="i-heroicons-bars-3"
          />
        </UFormGroup>
      </div>
      <div class="md:col-span-2">
        <label class="text-sm font-medium mb-2 block">Reemplazo</label>
        <UCheckbox v-model="replace" label="Reemplazar layout existente" />
      </div>

      <!-- Herramientas de patrón -->
      <div class="md:col-span-12">
        <div class="flex flex-wrap gap-2 items-center">
          <span class="text-xs text-gray-500 dark:text-gray-400 mr-1">Patrón:</span>

          <UButton
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-rectangle-group"
            @click="emit('init-pattern', 'alt')"
          >
            Ajedrez (2/4)
          </UButton>

          <UButton
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-square-2-stack"
            @click="emit('init-pattern', '2')"
          >
            Llenar 2
          </UButton>

          <UButton
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-squares-2x2"
            @click="emit('init-pattern', '4')"
          >
            Llenar 4
          </UButton>

          <UButton
            size="xs"
            variant="ghost"
            color="error"
            icon="i-heroicons-trash"
            @click="emit('init-pattern', 'empty')"
          >
            Limpiar
          </UButton>

          <div class="ml-auto flex items-center gap-2 text-xs">
            <UBadge variant="soft" color="neutral">2</UBadge>
            <span class="text-gray-600 dark:text-gray-300">mesa de 2</span>
            <span class="opacity-40">·</span>
            <UBadge variant="soft" color="primary">4</UBadge>
            <span class="text-gray-600 dark:text-gray-300">mesa de 4</span>
          </div>
        </div>
      </div>

      <!-- Toggle activo -->
      <div class="md:col-span-12 flex justify-end">
        <UButton
          :label="active ? 'Desactivar showtime' : 'Activar showtime'"
          :color="active ? 'error' : 'primary'"
          variant="ghost"
          icon="i-heroicons-power"
          @click="emit('toggle-active')"
        />
      </div>
    </div>
  </UCard>
</template>
