<script setup>
const props = defineProps({
  rows: { type: Number, default: 8 },
  cols: { type: Number, default: 12 },
  value: { type: Array, default: () => [] },          // seleccionados (ids o códigos)
  seats: { type: Array, required: true }              // [{ id|code, taken }]
})
const emit = defineEmits(['update:value', 'toggle'])

function keyOf(s) {
  return s.id ?? s.code ?? s.seat ?? s.seatId
}
function labelOf(s) {
  return String(keyOf(s))
}
function toggle(s) {
  if (s.taken) return
  const k = keyOf(s)
  const picked = new Set(props.value)
  picked.has(k) ? picked.delete(k) : picked.add(k)
  emit('update:value', [...picked])
  emit('toggle', k)
}
</script>

<template>
  <div class="grid gap-2" :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }">
    <button
      v-for="s in seats" :key="keyOf(s)"
      @click="toggle(s)"
      class="aspect-square rounded-lg border text-xs sm:text-sm select-none"
      :class="[
        s.taken
          ? 'border-red-400/40 bg-red-400/20 line-through cursor-not-allowed'
          : 'border-white/15 hover:bg-white/10',
        value.includes(keyOf(s)) && !s.taken ? 'ring-2 ring-brand/70' : ''
      ]"
    >
      {{ labelOf(s) }}
    </button>
  </div>
</template>
