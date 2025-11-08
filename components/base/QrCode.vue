<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 180
  },
  colorDark: {
    type: String,
    default: '#111827'
  },
  colorLight: {
    type: String,
    default: '#ffffff'
  }
})

const dataUrl = ref<string | null>(null)
let activeRender = 0

const renderQr = async () => {
  activeRender++
  const renderId = activeRender
  if (!props.value) {
    dataUrl.value = null
    return
  }
  try {
    const url = await QRCode.toDataURL(props.value, {
      width: props.size,
      margin: 1,
      color: {
        dark: props.colorDark,
        light: props.colorLight
      }
    })
    if (renderId === activeRender) {
      dataUrl.value = url
    }
  } catch (err) {
    console.error('QR render error', err)
    if (renderId === activeRender) {
      dataUrl.value = null
    }
  }
}

watch(
  () => [props.value, props.size, props.colorDark, props.colorLight],
  () => {
    renderQr()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  activeRender++
})
</script>

<template>
  <div class="inline-flex flex-col items-center gap-2">
    <img
      v-if="dataUrl"
      :src="dataUrl"
      alt="Código QR de la reserva"
      class="rounded-lg shadow-sm border border-default/40 bg-white"
      :style="{ width: `${size}px`, height: `${size}px` }"
    />
    <div v-else class="grid place-items-center rounded-lg bg-muted/10" :style="{ width: `${size}px`, height: `${size}px` }">
      <UIcon name="i-heroicons-qr-code" class="text-muted text-3xl" />
    </div>
    <slot />
  </div>
</template>
