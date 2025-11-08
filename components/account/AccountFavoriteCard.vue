<script setup lang="ts">
const props = defineProps<{
  title: string
  poster?: string | null
}>()

const bgStyle = computed(() => ({
  backgroundImage: `linear-gradient(135deg, rgba(0,0,0,.55), rgba(0,0,0,.1)), url('${props.poster || '/placeholder.png'}')`
}))
</script>

<template>
  <Motion
    tag="div"
    :initial="{ opacity: 0, y: 16 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 0.3 } }"
  >
    <UCard class="p-0 rounded-2xl border border-primary/40 overflow-hidden bg-primary/5 transition hover:scale-[1.01] hover:shadow-[0_18px_40px_rgba(225,29,72,0.18)]">
      <div class="grid sm:grid-cols-[220px,1fr]">
        <div class="p-5 space-y-2">
          <p class="text-xs uppercase tracking-wide text-primary font-semibold">Tu favorita</p>
          <h3 class="text-xl font-semibold leading-tight">{{ props.title }}</h3>
          <p class="text-sm text-muted">
            Elegida por tu historial reciente. Actualiza tus reservas para mantener este ranking al día.
          </p>
        </div>
        <div
          class="h-40 sm:h-full bg-cover bg-center transition duration-300"
          :style="bgStyle"
        />
      </div>
    </UCard>
  </Motion>
</template>
