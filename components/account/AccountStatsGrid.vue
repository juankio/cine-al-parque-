<script setup lang="ts">
import type { PropType } from 'vue'

type Card = {
  label: string
  value: string | number
  hint: string
  icon: string
}

const props = defineProps({
  cards: {
    type: Array as PropType<Card[]>,
    default: () => []
  }
})
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <Motion
      v-for="(card, idx) in cards"
      :key="card.label"
      tag="div"
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 0.05 * idx, duration: 0.25 } }"
      :hover="{ y: -4, transition: { type: 'spring', stiffness: 240, damping: 20 } }"
    >
      <UCard class="h-full p-5 rounded-2xl border border-default/40 transition hover:border-primary/40 hover:shadow-[0_12px_30px_rgba(225,29,72,0.12)]">
        <div class="flex items-center justify-between gap-3">
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-wide text-muted">{{ card.label }}</p>
            <p class="text-2xl font-semibold">{{ card.value }}</p>
            <p class="text-xs text-muted">{{ card.hint }}</p>
          </div>
          <UIcon :name="card.icon" class="text-2xl text-primary/70" />
        </div>
      </UCard>
    </Motion>
  </div>
</template>
