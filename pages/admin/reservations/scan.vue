<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { BrowserQRCodeReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'
import { useToast } from '#imports'
import type { ReservationScanResult } from '~/types/reservations'
import ScannerManualSection from '~/components/admin/reservations/ScannerManualSection.vue'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const videoRef = ref<HTMLVideoElement | null>(null)
const scanning = ref(false)
const scannerError = ref<string | null>(null)
const verifying = ref(false)
const manualToken = ref('')
const lastResult = ref<{ ok: boolean; reservation?: ReservationScanResult; message?: string } | null>(null)

const toast = useToast()
let controls: IScannerControls | null = null
let reader: BrowserQRCodeReader | null = null

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString('es-CO', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Sin fecha'

const stopScanner = () => {
  controls?.stop()
  controls = null
  reader = null
  scanning.value = false
}

const handleToken = async (token: string) => {
  if (!token) return
  manualToken.value = token
  await verifyToken(token)
}

const ignoredErrors = new Set(['NotFoundException', 'ChecksumException', 'FormatException'])

const startScanner = async () => {
  if (process.server || scanning.value) return
  scannerError.value = null
  try {
    reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 400 })
    controls = await reader.decodeFromVideoDevice(
      undefined,
      videoRef.value as HTMLVideoElement,
      (result, err) => {
        if (result?.getText()) {
          stopScanner()
          handleToken(result.getText())
          return
        }
        if (err) {
          if (ignoredErrors.has(err.name)) {
            scannerError.value = null
            return
          }
          scannerError.value = err.message || 'No pudimos leer el código'
        }
      }
    )
    scanning.value = true
  } catch (err: any) {
    scannerError.value = err?.message || 'No pudimos acceder a la cámara'
    scanning.value = false
  }
}

const verifyToken = async (token: string) => {
  verifying.value = true
  lastResult.value = null
  try {
    const response = await $fetch<{ ok: boolean; reservation: ReservationScanResult }>('/api/reservations/scan', {
      method: 'POST',
      credentials: 'include',
      body: { token }
    })
    lastResult.value = { ok: true, reservation: response.reservation }
    toast.add({
      title: 'Reserva validada',
      description: `Asientos ${response.reservation.seats.join(', ')}`,
      color: 'green',
      icon: 'i-heroicons-check-badge'
    })
  } catch (err: any) {
    const message = err?.data?.statusMessage || err?.statusMessage || err?.message || 'No pudimos validar el código'
    lastResult.value = { ok: false, message, reservation: err?.data?.reservation }
    toast.add({ title: 'No se pudo validar', description: message, color: 'red', icon: 'i-heroicons-exclamation-circle' })
  } finally {
    verifying.value = false
  }
}

const onManualSubmit = () => handleToken(manualToken.value.trim())

onMounted(() => startScanner())
onBeforeUnmount(() => stopScanner())
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-muted">Control de acceso</p>
        <h1 class="text-3xl font-bold">Escanear reservas</h1>
        <p class="text-sm text-muted">Escanea el QR o digita el token para marcar el check-in.</p>
      </div>
      <div class="flex items-center gap-2">
        <UButton color="primary" variant="soft" icon="i-heroicons-video-camera" :loading="!scanning && !scannerError" @click="startScanner">
          {{ scanning ? 'Cámara activa' : 'Activar cámara' }}
        </UButton>
        <UButton color="neutral" variant="ghost" icon="i-heroicons-stop" :disabled="!scanning" @click="stopScanner">
          Detener
        </UButton>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <UCard class="rounded-3xl border border-default/40 bg-white/90 dark:bg-slate-900/90">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-muted">Scanner</p>
              <h2 class="text-xl font-semibold">Lectura en vivo</h2>
            </div>
            <UBadge :color="scanning ? 'green' : 'neutral'" variant="soft">{{ scanning ? 'Listo' : 'Detenido' }}</UBadge>
          </div>
        </template>
        <div class="space-y-4">
          <div class="relative rounded-2xl bg-black/90 overflow-hidden aspect-video">
            <video ref="videoRef" class="w-full h-full object-cover" autoplay muted playsinline />
            <div v-if="!scanning" class="absolute inset-0 grid place-items-center bg-black/70 text-white text-sm">
              {{ scannerError || 'Activa la cámara para comenzar' }}
            </div>
          </div>
          <UAlert
            v-if="scannerError"
            color="red"
            icon="i-heroicons-information-circle"
            :description="scannerError"
            title="No pudimos usar la cámara"
          />
        </div>
      </UCard>

      <ScannerManualSection
        v-model:manual-token="manualToken"
        :verifying="verifying"
        :last-result="lastResult"
        :format-date-time="formatDateTime"
        @submit="onManualSubmit()"
      />
    </div>
  </div>
</template>
