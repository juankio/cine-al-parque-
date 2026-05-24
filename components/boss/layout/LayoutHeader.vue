<script setup lang="ts">
const props = defineProps<{
  showtime: any | null
  showtimeId: string
  totalMesas: number
  totalSillas: number
}>()

const fmtMoney = (n?: number) =>
  typeof n === 'number' ? n.toLocaleString('es-CO') : '0'
</script>

<template>
  <div class="flex items-start justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold">Layout de sillas</h1>
      <p class="text-sm text-muted">Define mesas de 2 o 4 sillas por celda y genera el layout.</p>

      <div v-if="showtime" class="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <UBadge variant="soft" color="neutral">
          Showtime: <code class="ml-1">{{ showtime._id?.slice(-6) }}</code>
        </UBadge>
        <UBadge variant="soft" color="neutral">Sala: <b class="ml-1">{{ showtime.sala }}</b></UBadge>
        <UBadge variant="soft" color="neutral">Precio: <b class="ml-1">$ {{ fmtMoney(showtime.price) }}</b></UBadge>
        <UBadge :color="showtime.active ? 'success' : 'neutral'" variant="soft">
          {{ showtime.active ? 'Activo' : 'Inactivo' }}
        </UBadge>
        <UBadge variant="soft" color="primary">Mesas: {{ totalMesas }}</UBadge>
        <UBadge variant="soft" color="primary">Sillas: {{ totalSillas }}</UBadge>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <UButton
        :to="`/admin/movies/${showtime?.movieId || ''}/showtimes`"
        color="neutral" variant="outline" size="sm" icon="i-heroicons-arrow-uturn-left"
      >Volver</UButton>
      <UButton
        :to="`/showtimes/${showtimeId}`"
        color="primary" variant="outline" size="sm" icon="i-heroicons-eye"
      >Ver público</UButton>
    </div>
  </div>
</template>
