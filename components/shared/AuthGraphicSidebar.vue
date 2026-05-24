<template>
  <div class="hidden lg:flex relative bg-black items-center justify-center overflow-hidden" :class="orderClass">
    <img :src="imgSrc" class="absolute inset-0 w-full h-full object-cover opacity-30 grayscale-[30%] mix-blend-lighten" />
    
    <div class="absolute inset-0 z-10" :class="gradientClasses"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>

    <div class="relative z-20 space-y-8 max-w-md p-16 opacity-0" :class="[animationClass, alignmentClass]">
      <div class="space-y-4">
        <div class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg" :class="badgeClasses">
          <UIcon :name="badgeIcon" class="w-3.5 h-3.5" /> {{ badgeText }}
        </div>
        <h2 class="text-4xl font-black leading-tight text-white drop-shadow-md">
          {{ title }}
        </h2>
        <p class="text-white/70 text-base font-medium leading-relaxed">
          {{ description }}
        </p>
      </div>

      <ul class="space-y-5">
        <li v-for="(perk, idx) in perks" :key="idx" class="flex items-center gap-4 text-sm font-bold text-white">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20">
            <UIcon name="i-heroicons-check" class="h-4 w-4" />
          </div>
          {{ perk }}
        </li>
      </ul>

      <div v-if="stats && stats.length" class="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
        <div v-for="stat in stats" :key="stat.label" class="text-left">
          <p class="text-2xl font-black text-rose-400 drop-shadow-sm">{{ stat.value }}</p>
          <p class="text-[9px] uppercase tracking-widest font-bold text-white/50 mt-1">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  imgSrc: string
  badgeText: string
  badgeIcon: string
  badgeColor?: 'primary' | 'rose'
  title: string
  description: string
  perks: string[]
  stats?: { label: string, value: string }[]
  position?: 'left' | 'right'
}>()

const orderClass = computed(() => props.position === 'left' ? 'order-2 lg:order-1' : '')
const animationClass = computed(() => props.position === 'left' ? 'anim-left' : 'anim-right')
const alignmentClass = computed(() => props.position === 'left' ? 'ml-auto' : 'mr-auto')

const gradientClasses = computed(() => {
  return props.position === 'left' 
    ? 'bg-gradient-to-l from-[#0a0a0a]/90 to-transparent'
    : 'bg-gradient-to-r from-[#0a0a0a]/90 to-transparent'
})

const badgeClasses = computed(() => {
  return props.badgeColor === 'rose'
    ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
    : 'bg-primary/20 border border-primary/30 text-primary'
})
</script>
