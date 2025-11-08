<script setup lang="ts">
const props = defineProps<{ item: any }>();
const emit = defineEmits<{
  (e: "select", item: any): void;
  (e: "delete", item: any): void;
}>();

// mismo set de iconos que usamos en AdminIngredientForm.vue
const unidadIcon: Record<string, string> = {
  g: "i-heroicons-scale", // gramos
  kg: "i-heroicons-cube", // kilos
  ml: "i-heroicons-beaker", // mililitros
  l: "i-heroicons-beaker-solid", // litros
  unid: "i-heroicons-archive-box", // unidades
};

// nombre "bonito" de la unidad para mostrarle al admin
const unidadPretty: Record<string, string> = {
  g: "g",
  kg: "kg",
  ml: "ml",
  l: "l",
  unid: "unid",
};

const money = (n: any) => {
  const v = Number(n ?? 0);
  return isFinite(v) ? v.toLocaleString("es-CO") : "0";
};

// helpers computados para no llenar el template de lógica
const iconName = computed(() => {
  const u = props.item?.unidad ?? "";
  return unidadIcon[u] || "i-heroicons-question-mark-circle"; // fallback
});

const unidadText = computed(() => {
  const u = props.item?.unidad ?? "";
  return unidadPretty[u] || u || "—";
});

const stockText = computed(() => {
  // en DB guardas stockBase normalizado a base (g / ml / unid)
  const raw = props.item?.stockBase ?? 0;
  return Number(raw).toLocaleString("es-CO");
});

const costoText = computed(() => money(props.item?.costoPromedio));
</script>

<template>
  <UCard
    class="cursor-pointer rounded-2xl hover:bg-primary/5 transition"
    @click="emit('select', item)"
  >
    <div class="flex flex-col gap-3">
      <div class="flex items-start justify-between gap-3">
      <!-- IZQUIERDA: nombre + info -->
        <div class="min-w-0">
        <!-- Nombre -->
        <div class="flex items-start gap-2">
          <UIcon :name="iconName" class="text-primary text-xl shrink-0" />
          <h3 class="font-semibold truncate">
            {{ item.nombre }}
          </h3>
        </div>

        <!-- Meta -->
        <p class="text-xs text-muted mt-1 leading-snug">
            Unidad: <b>{{ unidadText }}</b> · Stock: <b>{{ stockText }}</b> · $
          <b>{{ costoText }}</b>
          </p>
        </div>

        <UBadge :color="item.activo ? 'success' : 'neutral'" variant="outline" >
          {{ item.activo ? 'Activo' : 'Inactivo' }}
        </UBadge>
      </div>

      <div class="flex justify-end gap-2">
        <UButton
          icon="i-heroicons-pencil-square"
          variant="ghost"
          color="primary"
          aria-label="Editar"
          @click.stop="emit('select', item)"
        />
        <UButton
          icon="i-heroicons-trash"
          variant="ghost"
          color="neutral"
          aria-label="Eliminar"
          @click.stop="emit('delete', item)"
        />
    </div>
    </div>
  </UCard>
</template>
