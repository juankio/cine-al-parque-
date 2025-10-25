<script setup lang="ts">
/**
 * Editor de patrón 2/4 reutilizable
 * Props:
 *  - rows, cols, pattern (['2'|'4'][][])
 * Emits:
 *  - toggle(r,c)
 */
const props = defineProps<{ rows: number; cols: number; pattern: ('2'|'4')[][] }>()
const emit = defineEmits<{ (e:'toggle', r:number, c:number):void }>()
</script>

<template>
  <UCard>
    <p class="mb-3 text-xs text-muted">
      Click en cada celda para alternar entre mesas de <b>2</b> y <b>4</b>.
    </p>
    <div class="inline-grid gap-2" :style="{ gridTemplateColumns: `repeat(${props.cols}, minmax(48px, 1fr))` }">
      <UButton
        v-for="(cell, idx) in props.rows * props.cols"
        :key="idx"
        :label="props.pattern[Math.floor(idx / props.cols)][idx % props.cols]"
        :variant="props.pattern[Math.floor(idx / props.cols)][idx % props.cols] === '4' ? 'outline' : 'soft'"
        :color="props.pattern[Math.floor(idx / props.cols)][idx % props.cols] === '4' ? 'primary' : 'gray'"
        class="h-12 text-sm font-semibold"
        @click="emit('toggle', Math.floor(idx / props.cols), idx % props.cols)"
      />
    </div>
  </UCard>
</template>
